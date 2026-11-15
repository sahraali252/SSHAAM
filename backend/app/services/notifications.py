from datetime import datetime, timedelta, timezone

from sqlalchemy.exc import IntegrityError

from app.models import JobApplication, JobPosting, Notification, User


def create_notification(db, user_id, kind, message, application=None, job_id=None):
    notification = Notification(
        user_id=user_id, kind=kind, message=message,
        application_id=application.id if application else None,
        job_id=application.job_id if application else job_id,
    )
    db.add(notification)
    return notification


def notify_new_application(db, application):
    posting = db.get(JobPosting, application.job_id)
    if posting:
        create_notification(
            db, posting.recruiter_id, "new_application",
            f"New application received for {posting.title}.", application,
        )


def change_application_status(db, application, status, invitation_message=None, notify_interview=True):
    changed = application.status != status
    if changed:
        application.status = status
        create_notification(
            db, application.user_id, "application_status",
            f"Your application status is now {status}.", application,
        )
    if status == "Interview" and notify_interview:
        db.flush()
        previous_invitation = db.query(Notification.id).filter(
            Notification.application_id == application.id,
            Notification.kind == "interview_invitation",
        ).first()
        # An owner may have tracked Interview themselves before the recruiter invites them.
        if changed or not previous_invitation:
            create_notification(
                db, application.user_id, "interview_invitation",
                invitation_message or "You have been invited to an interview.", application,
            )


def generate_deadline_reminders(db, now=None):
    # SQLite stores naive UTC datetimes; normalize before comparisons and keys
    now = now or datetime.now(timezone.utc)
    now = now.astimezone(timezone.utc) if now.tzinfo else now.replace(tzinfo=timezone.utc)
    postings = db.query(JobPosting).filter(
        JobPosting.status == "active", JobPosting.deadline > now,
        JobPosting.deadline <= now + timedelta(hours=24),
    ).all()
    created = 0
    seekers = db.query(User).filter(User.role == "job_seeker").all()
    for posting in postings:
        deadline = posting.deadline
        if deadline.tzinfo:
            deadline = deadline.astimezone(timezone.utc).replace(tzinfo=None)
        applied_ids = {row.user_id for row in db.query(JobApplication).filter(
            JobApplication.job_id == posting.id
        ).all()}
        for seeker in seekers:
            if seeker.id in applied_ids:
                continue
            key = f"deadline:{seeker.id}:{posting.id}:{deadline.isoformat()}"
            if db.query(Notification.id).filter(Notification.deduplication_key == key).first():
                continue
            try:
                # the unique key also prevents duplicates across workers/restarts
                with db.begin_nested():
                    db.add(Notification(
                        user_id=seeker.id, kind="deadline_reminder", job_id=posting.id,
                        message=f"Applications for {posting.title} close at {deadline.isoformat()} UTC.",
                        deduplication_key=key,
                    ))
                    db.flush()
                created += 1
            except IntegrityError:
                pass
    db.commit()
    return created
