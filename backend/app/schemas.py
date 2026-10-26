from datetime import datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "job_seeker"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProfessionalProfileUpsert(BaseModel):
    headline: str = ""
    location: str = ""
    bio: str = ""
    skills: str = ""
    education: str = ""
    experience: str = ""


class ProfessionalProfileResponse(ProfessionalProfileUpsert):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class ResumeResponse(BaseModel):
    id: int
    user_id: int
    original_filename: str
    file_size: int
    created_at: datetime
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


# validates job application requests and responses
class JobApplicationCreate(BaseModel):
    job_id: str


class JobApplicationResponse(BaseModel):
    id: int
    user_id: int
    job_id: str
    status: Literal["Applied", "Under Review", "Interview", "Offered", "Rejected"]
    applied_at: datetime

    model_config = ConfigDict(from_attributes=True)


class JobApplicationStatusUpdate(BaseModel):
    status: Literal["Applied", "Under Review", "Interview", "Offered", "Rejected"]