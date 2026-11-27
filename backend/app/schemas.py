import re
from datetime import datetime, timezone
from typing import Literal
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: Literal["job_seeker", "recruiter"] = "job_seeker"

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

class JobPostingBase(BaseModel):
    title: str
    company_name: str
    location: str
    employment_type: str
    description: str
    deadline: datetime | None = None


class JobPostingCreate(JobPostingBase):
    @field_validator("deadline")
    @classmethod
    def normalize_deadline(cls, value):
        if value is not None:
            if value.tzinfo is None:
                return value.replace(tzinfo=timezone.utc)
            return value.astimezone(timezone.utc)
        return value


class JobPostingUpdate(BaseModel):
    title: str | None = None
    company_name: str | None = None
    location: str | None = None
    employment_type: str | None = None
    description: str | None = None
    deadline: datetime | None = None

    @field_validator("deadline")
    @classmethod
    def normalize_deadline(cls, value):
        if value is not None:
            if value.tzinfo is None:
                return value.replace(tzinfo=timezone.utc)
            return value.astimezone(timezone.utc)
        return value


class JobPostingArchiveUpdate(BaseModel):
    status: Literal["active", "archived"]


class JobPostingResponse(JobPostingBase):
    id: str
    recruiter_id: int
    status: Literal["active", "archived"]
    created_at: datetime
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class RecruiterPostingSummary(JobPostingResponse):
    application_count: int

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
HIMALAYAS_JOB_URL = re.compile(r"^https?://([^/?#]*\.)?himalayas\.app([/?#]|$)", re.IGNORECASE)


def normalize_job_id(job_id: str) -> str:
    """One id per job so the duplicate check cannot be bypassed.

    Recruiter postings use their UUID. Himalayas jobs use their public job page
    URL without query string, fragment or trailing slash, so links such as
    applicationLink (?utm_source=api) map to the same id as guid.
    Mirrors normalizeJobId() in frontend/src/utils/applications.js.
    """
    value = job_id.strip()
    if HIMALAYAS_JOB_URL.match(value):
        value = re.split(r"[?#]", value, maxsplit=1)[0].rstrip("/")
    return value


class JobApplicationCreate(BaseModel):
    job_id: str = Field(min_length=1)

    @field_validator("job_id")
    @classmethod
    def normalize(cls, value):
        value = normalize_job_id(value)
        if not value:
            raise ValueError("job_id must not be empty")
        return value


class JobApplicationResponse(BaseModel):
    id: int
    user_id: int
    job_id: str
    status: Literal["Applied", "Under Review", "Interview", "Offered", "Rejected"]
    applied_at: datetime

    model_config = ConfigDict(from_attributes=True)


class JobApplicationStatusUpdate(BaseModel):
    status: Literal["Applied", "Under Review", "Interview", "Offered", "Rejected"]


class NotificationResponse(BaseModel):
    id: int
    kind: str
    message: str
    application_id: int | None
    job_id: str | None
    is_read: bool
    created_at: datetime
    read_at: datetime | None

    model_config = ConfigDict(from_attributes=True)


class UnreadNotificationCount(BaseModel):
    unread_count: int


class InterviewInvitationCreate(BaseModel):
    message: str = Field(default="You have been invited to an interview.", min_length=1, max_length=2000)


# AI resume feedback (US-15). Also used as the Gemini response schema.
class ResumeImprovement(BaseModel):
    section: str
    issue: str
    suggestion: str


class ResumeFeedbackResponse(BaseModel):
    overall_score: int
    summary: str
    strengths: list[str]
    improvements: list[ResumeImprovement]
    missing_sections: list[str]

    @field_validator("overall_score")
    @classmethod
    def clamp_score(cls, value):
        return max(0, min(100, value))


# AI job matching (US-16). AIJobMatchList is the Gemini response schema.
class AIJobMatch(BaseModel):
    job_ref: str
    match_score: int
    matching_skills: list[str]
    missing_skills: list[str]
    reason: str

    @field_validator("match_score")
    @classmethod
    def clamp_score(cls, value):
        return max(0, min(100, value))


class AIJobMatchList(BaseModel):
    matches: list[AIJobMatch]


class JobMatch(BaseModel):
    posting_id: str
    title: str
    company_name: str
    location: str
    employment_type: str
    description: str
    match_score: int
    matching_skills: list[str]
    missing_skills: list[str]
    reason: str


class JobMatchesResponse(BaseModel):
    matches: list[JobMatch]
    message: str | None = None
