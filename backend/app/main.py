from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models
from app.database import Base, engine
from app.routers import (
    application_router,
    auth_router,
    jobs_router,
    profile_router,
    public_job_postings_router,
    recruiter_postings_router,
    resume_router,
)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def create_database_tables():
    Base.metadata.create_all(bind=engine)

app.include_router(auth_router.router)
app.include_router(profile_router.router)
app.include_router(resume_router.router)
app.include_router(jobs_router.router)
app.include_router(application_router.router)
app.include_router(recruiter_postings_router.router)
app.include_router(public_job_postings_router.router)

@app.get("/")
def root():
    return {"status": "ok"}