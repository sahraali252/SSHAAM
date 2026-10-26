import os
import uuid

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, File, HTTPException, Response, UploadFile
from sqlalchemy.orm import Session
from supabase import create_client

from app.database import get_db
from app.models import Resume, User
from app.schemas import ResumeResponse

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

router = APIRouter(
    prefix="/resumes",
    tags=["Resumes"],
)


def get_signed_url(storage_path: str) -> str:
    try:
        result = supabase.storage.from_("resumes").create_signed_url(
            storage_path,
            60 * 60,
        )

        data = getattr(result, "data", result)

        if isinstance(data, dict):
            signed_url = data.get("signedURL") or data.get("signed_url")
        else:
            signed_url = getattr(data, "signed_url", None)

        if not signed_url:
            raise ValueError("No signed URL was returned.")

        return signed_url

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to create a resume link: {str(error)}",
        )


def get_user_or_404(user_id: int, db: Session) -> User:
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    return user


@router.get("/{user_id}", response_model=ResumeResponse)
def get_resume(user_id: int, db: Session = Depends(get_db)):
    get_user_or_404(user_id, db)

    resume = db.query(Resume).filter(Resume.user_id == user_id).first()

    if not resume:
        raise HTTPException(status_code=404, detail="No resume has been uploaded.")

    return resume


@router.get("/{user_id}/view")
def view_resume(user_id: int, db: Session = Depends(get_db)):
    get_user_or_404(user_id, db)

    resume = db.query(Resume).filter(Resume.user_id == user_id).first()

    if not resume:
        raise HTTPException(status_code=404, detail="No resume has been uploaded.")

    return {"url": get_signed_url(resume.storage_path)}


@router.post("/{user_id}", response_model=ResumeResponse)
async def upload_or_replace_resume(
    user_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    get_user_or_404(user_id, db)

    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed.",
        )

    file_bytes = await file.read()

    if len(file_bytes) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="The resume must be 5 MB or smaller.",
        )

    original_filename = os.path.basename(file.filename or "resume.pdf")
    storage_path = f"user_{user_id}/{uuid.uuid4()}_{original_filename}"

    current_resume = (
        db.query(Resume)
        .filter(Resume.user_id == user_id)
        .first()
    )

    try:
        supabase.storage.from_("resumes").upload(
            storage_path,
            file_bytes,
            {"content-type": "application/pdf"},
        )
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Resume upload failed: {str(error)}",
        )

    old_storage_path = current_resume.storage_path if current_resume else None

    if current_resume:
        current_resume.original_filename = original_filename
        current_resume.storage_path = storage_path
        current_resume.file_size = len(file_bytes)
    else:
        current_resume = Resume(
            user_id=user_id,
            original_filename=original_filename,
            storage_path=storage_path,
            file_size=len(file_bytes),
        )
        db.add(current_resume)

    db.commit()
    db.refresh(current_resume)

    if old_storage_path:
        try:
            supabase.storage.from_("resumes").remove([old_storage_path])
        except Exception:
            # The new resume is already saved correctly.
            # An unused old file can be cleaned up later if needed.
            pass

    return current_resume


@router.delete("/{user_id}", status_code=204)
def delete_resume(user_id: int, db: Session = Depends(get_db)):
    get_user_or_404(user_id, db)

    resume = db.query(Resume).filter(Resume.user_id == user_id).first()

    if not resume:
        raise HTTPException(status_code=404, detail="No resume has been uploaded.")

    try:
        supabase.storage.from_("resumes").remove([resume.storage_path])
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to delete the stored resume: {str(error)}",
        )

    db.delete(resume)
    db.commit()

    return Response(status_code=204)