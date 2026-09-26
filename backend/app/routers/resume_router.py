import os
import uuid

from dotenv import load_dotenv
from fastapi import APIRouter, File, HTTPException, UploadFile
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

router = APIRouter(
    prefix="/resumes",
    tags=["Resumes"]
)


@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )

    file_bytes = await file.read()

    unique_filename = f"{uuid.uuid4()}_{file.filename}"

    try:
        supabase.storage.from_("resumes").upload(
            unique_filename,
            file_bytes,
            {"content-type": "application/pdf"}
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Upload failed: {str(e)}"
        )

    return {
        "message": "Resume uploaded successfully",
        "filename": unique_filename
    }