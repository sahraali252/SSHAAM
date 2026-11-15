from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import JobApplication, JobPosting, User
from app.routers.recruiter_postings_router import require_recruiter
from app.schemas import JobApplicationResponse, JobApplicationStatusUpdate, InterviewInvitationCreate
from app.security import get_current_user
from app.services.notifications import change_application_status

router = APIRouter(prefix="/recruiter/applications", tags=["Recruiter Applications"])


def owned_application(db, user, application_id):
    require_recruiter(user)
    application = db.query(JobApplication).join(
        JobPosting, JobApplication.job_id == JobPosting.id
    ).filter(JobApplication.id == application_id, JobPosting.recruiter_id == user.id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return application


@router.get("/", response_model=list[JobApplicationResponse])
def get_applications(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    require_recruiter(user)
    return db.query(JobApplication).join(JobPosting, JobApplication.job_id == JobPosting.id).filter(
        JobPosting.recruiter_id == user.id
    ).order_by(JobApplication.applied_at.desc()).all()


@router.patch("/{application_id}/status", response_model=JobApplicationResponse)
def update_status(application_id: int, update: JobApplicationStatusUpdate,
                  db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    application = owned_application(db, user, application_id)
    change_application_status(db, application, update.status)
    db.commit()
    db.refresh(application)
    return application


@router.post("/{application_id}/interview", response_model=JobApplicationResponse)
def invite_to_interview(application_id: int, invitation: InterviewInvitationCreate,
                        db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    application = owned_application(db, user, application_id)
    change_application_status(db, application, "Interview", invitation.message)
    db.commit()
    db.refresh(application)
    return application
