import uuid
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.sql import func
from sqlalchemy import UniqueConstraint
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default="job_seeker")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class JobPosting(Base):
    __tablename__ = "job_postings"

    id = Column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    recruiter_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    title = Column(String, nullable=False)
    company_name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    employment_type = Column(String, nullable=False)
    description = Column(Text, nullable=False)

    deadline = Column(DateTime(timezone=True), nullable=True, index=True)
    status = Column(String, default="active", nullable=False, index=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

class ProfessionalProfile(Base):
    __tablename__ = "professional_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    headline = Column(String, default="")
    location = Column(String, default="")
    bio = Column(Text, default="")
    skills = Column(Text, default="")
    education = Column(Text, default="")
    experience = Column(Text, default="")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    original_filename = Column(String, nullable=False)
    storage_path = Column(String, unique=True, nullable=False)
    file_size = Column(Integer, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

# stores job applications submitted by users
class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_id = Column(String, nullable=False)

    status = Column(String, default="Applied", nullable=False)
    applied_at = Column(DateTime(timezone=True), server_default=func.now())

    # prevents applying to the same job twice
    __table_args__ = (
        UniqueConstraint("user_id", "job_id", name="unique_user_job_application"),
    )


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    kind = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    application_id = Column(Integer, ForeignKey("job_applications.id"), nullable=True)
    job_id = Column(String, nullable=True)
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    read_at = Column(DateTime(timezone=True), nullable=True)
    deduplication_key = Column(String, unique=True, nullable=True)
