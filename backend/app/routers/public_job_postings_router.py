from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import JobPosting
from app.schemas import JobPostingResponse


router = APIRouter(
    prefix="/job-postings",
    tags=["Job Opportunities"],
)


@router.get("/", response_model=list[JobPostingResponse])
def get_active_job_postings(
    db: Session = Depends(get_db),
):
    return (
        db.query(JobPosting)
        .filter(JobPosting.status == "active")
        .order_by(JobPosting.created_at.desc())
        .all()
    )