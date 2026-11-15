from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import JobApplication, JobPosting, User
from app.schemas import (
    JobPostingArchiveUpdate,
    JobPostingCreate,
    JobPostingResponse,
    JobPostingUpdate,
    RecruiterPostingSummary,
)
from app.security import get_current_user


router = APIRouter(
    prefix="/recruiter/job-postings",
    tags=["Recruiter Job Postings"],
)


def require_recruiter(user: User):
    if user.role != "recruiter":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Recruiter access is required.",
        )


def get_owned_posting(
    posting_id: str,
    recruiter_id: int,
    db: Session,
) -> JobPosting:
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
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job posting not found.",
        )

    return posting


@router.post(
    "/",
    response_model=JobPostingResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_job_posting(
    posting_data: JobPostingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_recruiter(current_user)

    new_posting = JobPosting(
        recruiter_id=current_user.id,
        **posting_data.model_dump(),
    )

    db.add(new_posting)
    db.commit()
    db.refresh(new_posting)

    return new_posting


@router.get(
    "/",
    response_model=list[RecruiterPostingSummary],
)
def get_my_job_postings(
    include_archived: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_recruiter(current_user)

    query = (
        db.query(JobPosting)
        .filter(JobPosting.recruiter_id == current_user.id)
    )

    if not include_archived:
        query = query.filter(JobPosting.status == "active")

    postings = query.order_by(JobPosting.created_at.desc()).all()

    for posting in postings:
        posting.application_count = (
            db.query(JobApplication)
            .filter(JobApplication.job_id == posting.id)
            .count()
        )

    return postings


@router.get(
    "/{posting_id}",
    response_model=JobPostingResponse,
)
def get_job_posting(
    posting_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_recruiter(current_user)

    return get_owned_posting(
        posting_id,
        current_user.id,
        db,
    )


@router.patch(
    "/{posting_id}",
    response_model=JobPostingResponse,
)
def update_job_posting(
    posting_id: str,
    posting_data: JobPostingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_recruiter(current_user)

    posting = get_owned_posting(
        posting_id,
        current_user.id,
        db,
    )

    updates = posting_data.model_dump(exclude_unset=True)

    for field, value in updates.items():
        if value is None and field != "deadline":
            raise HTTPException(status_code=422, detail=f"{field} cannot be null")
        setattr(posting, field, value)

    db.commit()
    db.refresh(posting)

    return posting


@router.patch(
    "/{posting_id}/archive",
    response_model=JobPostingResponse,
)
def update_archive_status(
    posting_id: str,
    archive_data: JobPostingArchiveUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_recruiter(current_user)

    posting = get_owned_posting(
        posting_id,
        current_user.id,
        db,
    )

    posting.status = archive_data.status

    db.commit()
    db.refresh(posting)

    return posting