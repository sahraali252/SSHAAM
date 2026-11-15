from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import JobApplication, User
from app.schemas import (
    JobApplicationCreate,
    JobApplicationResponse,
    JobApplicationStatusUpdate
)
from app.security import get_current_user
from app.services.notifications import notify_new_application, change_application_status

router = APIRouter(prefix="/applications", tags=["Applications"])


# submits a new job application
@router.post("/", response_model=JobApplicationResponse, status_code=201)
def submit_application(
    application: JobApplicationCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    if user.role != "job_seeker":
        raise HTTPException(
            status_code=403,
            detail="Only job seekers can apply"
        )

    # prevents duplicate applications
    existing = db.query(JobApplication).filter(
        JobApplication.user_id == user.id,
        JobApplication.job_id == application.job_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="You already applied to this job"
        )

    new_application = JobApplication(
        user_id=user.id,
        job_id=application.job_id,
        status="Applied"
    )

    db.add(new_application)

    try:
        db.flush()
        notify_new_application(db, new_application)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Application could not be saved due to a database conflict"
        )

    db.refresh(new_application)

    return new_application


# retrieves all applications submitted by the user
@router.get("/my-applications", response_model=list[JobApplicationResponse])
def get_my_applications(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    return db.query(JobApplication).filter(
        JobApplication.user_id == user.id
    ).order_by(JobApplication.applied_at.desc()).all()


# retrieves the status of an application
@router.get("/{application_id}/status")
def get_application_status(
    application_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    application = db.query(JobApplication).filter(
        JobApplication.id == application_id,
        JobApplication.user_id == user.id
    ).first()

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    return {
        "application_id": application.id,
        "status": application.status
    }


# updates the user's own application status
@router.patch("/{application_id}/status", response_model=JobApplicationResponse)
def update_application_status(
    application_id: int,
    status_update: JobApplicationStatusUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    if user.role != "job_seeker":
        raise HTTPException(
            status_code=403,
            detail="Only job seekers can update their applications"
        )

    application = db.query(JobApplication).filter(
        JobApplication.id == application_id,
        JobApplication.user_id == user.id
    ).first()

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    change_application_status(db, application, status_update.status, notify_interview=False)

    db.commit()
    db.refresh(application)

    return application