"""Run one deadline-reminder pass: python -m app.reminders."""
from app import models
from app.database import SessionLocal, engine
from app.migrations import initialize_database
from app.services.notifications import generate_deadline_reminders


def main():
    initialize_database(engine)
    with SessionLocal() as db:
        count = generate_deadline_reminders(db)
    print(f"Created {count} deadline reminders.")


if __name__ == "__main__":
    main()
