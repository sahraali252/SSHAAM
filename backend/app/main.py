import asyncio
import logging
from contextlib import asynccontextmanager, suppress

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models
from app.database import SessionLocal, engine
from app.migrations import initialize_database
from app.routers import (
    application_router,
    auth_router,
    jobs_router,
    notification_router,
    profile_router,
    public_job_postings_router,
    recruiter_applications_router,
    recruiter_postings_router,
    recruiter_applications_router,
    resume_router,
)
from app.services.notifications import generate_deadline_reminders


def run_deadline_reminders():
    with SessionLocal() as db:
        return generate_deadline_reminders(db)


async def reminder_loop():
    while True:
        try:
            await asyncio.to_thread(run_deadline_reminders)
        except Exception:
            logging.exception("Deadline reminder generation failed; retrying in 60 seconds")
        await asyncio.sleep(60)


@asynccontextmanager
async def lifespan(app):
    initialize_database(engine)
    task = asyncio.create_task(reminder_loop())
    try:
        yield
    finally:
        task.cancel()
        with suppress(asyncio.CancelledError):
            await task


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(notification_router.router)
app.include_router(recruiter_applications_router.router)
app.include_router(auth_router.router)
app.include_router(profile_router.router)
app.include_router(resume_router.router)
app.include_router(jobs_router.router)
app.include_router(application_router.router)
app.include_router(recruiter_postings_router.router)
app.include_router(recruiter_applications_router.router)
app.include_router(public_job_postings_router.router)


@app.get("/")
def root():
    return {"status": "ok"}
