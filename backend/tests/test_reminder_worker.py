import asyncio
from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.models import Notification


def test_lifespan_worker_creates_reminders_without_api_trigger(database, posting, monkeypatch):
    import app.main as main
    from app.services.notifications import generate_deadline_reminders
    posting.deadline = datetime.now(timezone.utc) + timedelta(hours=1)
    database.commit()
    monkeypatch.setattr(main, 'engine', database.get_bind())
    factory = sessionmaker(bind=database.get_bind())
    monkeypatch.setattr(main, 'SessionLocal', factory)

    async def wait_for_reminders():
        for _ in range(100):
            with factory() as db:
                if db.query(Notification).count() == 2:
                    return True
            await asyncio.sleep(0.01)
        return False

    with TestClient(app) as client:
        assert client.get('/').status_code == 200
        assert client.portal.call(wait_for_reminders)
    with factory() as db:
        assert generate_deadline_reminders(db) == 0
        assert db.query(Notification).count() == 2


def test_worker_recovers_after_failed_pass(monkeypatch):
    import app.main as main
    calls = []

    def run_pass():
        calls.append('pass')
        if len(calls) == 1:
            raise RuntimeError('Temporary database failure')

    async def tick(seconds):
        assert seconds == 60
        if len(calls) == 2:
            raise asyncio.CancelledError

    monkeypatch.setattr(main, 'run_deadline_reminders', run_pass)
    monkeypatch.setattr(main.asyncio, 'sleep', tick)
    try:
        asyncio.run(main.reminder_loop())
    except asyncio.CancelledError:
        pass
    assert calls == ['pass', 'pass']
