from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Resume, User
from app.schemas import ResumeFeedbackResponse
from app.security import get_current_user
from app.services import ai_service


router = APIRouter(
    prefix="/ai",
    tags=["AI"],
)


def require_job_seeker(user: User):
    if user.role != "job_seeker":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only job seekers can use this AI feature.",
        )


def get_resume_text(user: User, db: Session) -> str:
    resume = db.query(Resume).filter(Resume.user_id == user.id).first()

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please upload a resume first.",
        )

    try:
        return ai_service.extract_resume_text(resume.storage_path)
    except ai_service.ResumeTextError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )
    except ai_service.ResumeStorageError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(error),
        )


def ai_unavailable(error: ai_service.AIServiceError) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail=str(error),
    )


# US-15: structured AI feedback on the logged-in user's uploaded resume
@router.post("/resume-feedback", response_model=ResumeFeedbackResponse)
def get_resume_feedback(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_job_seeker(current_user)
    resume_text = get_resume_text(current_user, db)

    try:
        return ai_service.get_resume_feedback(resume_text)
    except ai_service.AIServiceError as error:
        raise ai_unavailable(error)
