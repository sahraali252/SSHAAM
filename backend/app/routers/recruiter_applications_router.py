
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    JobApplication,
    JobPosting,
    ProfessionalProfile,
    Resume,
    User,
)
from app.schemas import JobApplicationResponse, JobApplicationStatusUpdate, InterviewInvitationCreate
from app.security import get_current_user
from app.services.notifications import change_application_status
from app.routers.resume_router import get_signed_url
from app.routers.recruiter_postings_router import require_recruiter


router = APIRouter(
    prefix="/recruiter/applications",
    tags=["Recruiter Applications"],
)


def get_owned_posting(
    posting_id: str,
    recruiter_id: int,
    db: Session,
):
    posting = (
        db.query(JobPosting)
        .filter(
            JobPosting.id == posting_id,
            JobPosting.recruiter_id == recruiter_id,
        )
        .first()
    )

    if not posting:
        raise HTTPException(
            status_code=404,
            detail="Job posting not found.",
        )

    return posting


def owned_application(db, user, application_id):
    require_recruiter(user)

    application = (
        db.query(JobApplication)
        .join(JobPosting, JobApplication.job_id == JobPosting.id)
        .filter(
            JobApplication.id == application_id,
            JobPosting.recruiter_id == user.id,
        )
        .first()
    )

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found.",
        )

    return application


@router.get("/", response_model=list[JobApplicationResponse])
def get_applications(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    require_recruiter(user)

    return (
        db.query(JobApplication)
        .join(JobPosting, JobApplication.job_id == JobPosting.id)
        .filter(JobPosting.recruiter_id == user.id)
        .order_by(JobApplication.applied_at.desc())
        .all()
    )


@router.get("/job-postings/{posting_id}")
def get_posting_applications(
    posting_id: str,
    status_filter: str | None = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_recruiter(current_user)

    get_owned_posting(posting_id, current_user.id, db)

    valid_statuses = [
        "Applied",
        "Under Review",
        "Interview",
        "Offered",
        "Rejected",
    ]

    if status_filter and status_filter not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid application status.",
        )

    if start_date and end_date and start_date > end_date:
        raise HTTPException(
            status_code=400,
            detail="Start date cannot be after end date.",
        )

    query = (
        db.query(JobApplication, User, ProfessionalProfile, Resume)
        .join(User, JobApplication.user_id == User.id)
        .outerjoin(
            ProfessionalProfile,
            ProfessionalProfile.user_id == User.id,
        )
        .outerjoin(
            Resume,
            Resume.user_id == User.id,
        )
        .filter(JobApplication.job_id == posting_id)
    )

    if status_filter:
        query = query.filter(
            JobApplication.status == status_filter
        )

    if start_date:
        query = query.filter(
            JobApplication.applied_at >= start_date
        )

    if end_date:
        query = query.filter(
            JobApplication.applied_at <= end_date
        )

    results = query.order_by(
        JobApplication.applied_at.desc()
    ).all()

    applications = []

    for application, candidate, profile, resume in results:
        resume_url = None

        if resume:
            resume_url = get_signed_url(resume.storage_path)

        applications.append({
            "application_id": application.id,
            "candidate_id": candidate.id,
            "candidate_name": candidate.full_name,
            "candidate_email": candidate.email,
            "application_date": application.applied_at,
            "status": application.status,
            "profile": {
                "headline": profile.headline,
                "location": profile.location,
                "bio": profile.bio,
                "skills": profile.skills,
                "education": profile.education,
                "experience": profile.experience,
            } if profile else None,
            "resume": {
                "filename": resume.original_filename,
                "file_size": resume.file_size,
                "view_url": resume_url,
            } if resume else None,
        })

    return applications


@router.patch("/{application_id}/status")
def update_application_status(
    application_id: int,
    status_update: JobApplicationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    application = owned_application(db, current_user, application_id)

    change_application_status(
        db, application, status_update.status, notify_interview=False
    )

    db.commit()
    db.refresh(application)

    return {
        "message": "Application status updated successfully.",
        "application_id": application.id,
        "status": application.status,
    }


@router.post("/{application_id}/interview")
def invite_to_interview(
    application_id: int,
    invitation: InterviewInvitationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    application = owned_application(db, current_user, application_id)

    change_application_status(
        db, application, "Interview", invitation.message
    )

    db.commit()
    db.refresh(application)

    return {
        "message": "Interview invitation sent successfully.",
        "application_id": application.id,
        "status": application.status,
    }
