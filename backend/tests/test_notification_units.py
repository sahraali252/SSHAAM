from datetime import datetime, timedelta, timezone

import pytest
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.exc import IntegrityError

from app.migrations import initialize_database
from app.models import JobApplication, Notification
from app.schemas import JobPostingCreate
from app.services.notifications import (
    change_application_status, create_notification, generate_deadline_reminders,
    notify_new_application,
)


def test_notification_defaults_and_persistence(database, users):
    notification = create_notification(database, users['seeker'].id, 'application_status', 'Updated')
    database.commit()
    database.expire_all()
    stored = database.get(Notification, notification.id)
    assert stored.message == 'Updated'
    assert stored.is_read is False
    assert stored.created_at is not None
    assert stored.read_at is None


def test_status_and_interview_notifications_only_on_change(database, users, posting):
    application = JobApplication(user_id=users['seeker'].id, job_id=posting.id, status='Applied')
    database.add(application)
    database.flush()
    change_application_status(database, application, 'Under Review')
    change_application_status(database, application, 'Interview', 'Meet us Friday at 10 UTC')
    change_application_status(database, application, 'Interview')
    database.commit()
    notifications = database.query(Notification).order_by(Notification.id).all()
    assert [n.kind for n in notifications] == ['application_status', 'application_status', 'interview_invitation']
    assert all(n.user_id == users['seeker'].id and n.application_id == application.id for n in notifications)
    assert notifications[-1].message == 'Meet us Friday at 10 UTC'


def test_new_application_recipient_and_external_job(database, users, posting):
    application = JobApplication(user_id=users['seeker'].id, job_id=posting.id)
    external = JobApplication(user_id=users['seeker'].id, job_id='external-api-job')
    database.add_all([application, external])
    database.flush()
    notify_new_application(database, application)
    notify_new_application(database, external)
    database.commit()
    notifications = database.query(Notification).all()
    assert len(notifications) == 1
    assert notifications[0].user_id == users['recruiter'].id
    assert notifications[0].application_id == application.id


@pytest.mark.parametrize('hours,active,expected', [(1, True, 2), (24, True, 2),
    (25, True, 0), (0, True, 0), (-1, True, 0), (1, False, 0)])
def test_deadline_window(database, users, posting, hours, active, expected):
    now = datetime(2026, 11, 15, 12, tzinfo=timezone.utc)
    posting.deadline = now + timedelta(hours=hours)
    posting.status = 'active' if active else 'archived'
    database.commit()
    assert generate_deadline_reminders(database, now) == expected
    assert generate_deadline_reminders(database, now) == 0
    assert database.query(Notification).count() == expected


def test_deadline_excludes_applicants_and_survives_new_session(database, users, posting):
    now = datetime(2026, 11, 15, 12)
    posting.deadline = now + timedelta(hours=2)
    database.add(JobApplication(user_id=users['seeker'].id, job_id=posting.id))
    database.commit()
    assert generate_deadline_reminders(database, now) == 1
    from sqlalchemy.orm import Session
    with Session(database.get_bind()) as second:
        assert generate_deadline_reminders(second, now) == 0
    assert database.query(Notification).one().user_id == users['other'].id
    posting.deadline = now + timedelta(hours=3)
    database.commit()
    assert generate_deadline_reminders(database, now) == 1


def test_unique_deadline_key_is_enforced_by_database(database, users):
    for _ in range(2):
        database.add(Notification(user_id=users['seeker'].id, kind='deadline_reminder',
                                  message='Soon', deduplication_key='same-deadline'))
        if _ == 0:
            database.commit()
        else:
            with pytest.raises(IntegrityError):
                database.commit()
            database.rollback()
    assert database.query(Notification).count() == 1


def test_workflow_rollback_keeps_notification_atomic(database, users, posting):
    application = JobApplication(user_id=users['seeker'].id, job_id=posting.id, status='Applied')
    database.add(application)
    database.commit()
    change_application_status(database, application, 'Rejected')
    database.flush()
    database.rollback()
    assert database.get(JobApplication, application.id).status == 'Applied'
    assert database.query(Notification).count() == 0


def test_migrate_populated_legacy_sqlite_twice(tmp_path):
    engine = create_engine(f'sqlite:///{tmp_path}/legacy.db')
    with engine.begin() as conn:
        conn.execute(text('CREATE TABLE job_postings (id VARCHAR PRIMARY KEY, recruiter_id INTEGER, title VARCHAR, company_name VARCHAR, location VARCHAR, employment_type VARCHAR, description TEXT, status VARCHAR, created_at DATETIME, updated_at DATETIME)'))
        conn.execute(text("INSERT INTO job_postings (id, title) VALUES ('existing', 'Preserved')"))
        conn.execute(text('CREATE TABLE users (id INTEGER PRIMARY KEY, email VARCHAR, password VARCHAR, full_name VARCHAR, role VARCHAR, created_at DATETIME)'))
        conn.execute(text("INSERT INTO users (id, email, password, full_name, role) VALUES (1, 'legacy@example.com', 'existing-hash', 'Legacy User', 'job_seeker')"))
        conn.execute(text('CREATE TABLE job_applications (id INTEGER PRIMARY KEY, user_id INTEGER, job_id VARCHAR, status VARCHAR, applied_at DATETIME)'))
        conn.execute(text("INSERT INTO job_applications (id, user_id, job_id, status) VALUES (1, 1, 'existing', 'Applied')"))
    initialize_database(engine)
    initialize_database(engine)
    with engine.connect() as conn:
        assert conn.execute(text('SELECT title, deadline FROM job_postings')).one() == ('Preserved', None)
        assert conn.execute(text('SELECT email, password FROM users')).one() == ('legacy@example.com', 'existing-hash')
        assert conn.execute(text('SELECT user_id, job_id, status FROM job_applications')).one() == (1, 'existing', 'Applied')
    assert 'notifications' in inspect(engine).get_table_names()
    assert 'deadline' in {c['name'] for c in inspect(engine).get_columns('job_postings')}
    engine.dispose()


def test_deadline_timezone_normalized():
    posting = JobPostingCreate(title='Dev', company_name='Co', location='Montreal',
                               employment_type='Intern', description='Job', deadline='2026-11-16T10:00:00-05:00')
    assert posting.deadline.hour == 15
    assert posting.deadline.utcoffset() == timedelta(0)
