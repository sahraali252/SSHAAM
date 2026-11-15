from sqlalchemy import inspect, text

from app.database import Base


def initialize_database(engine):
    # create_all preserves existing tables and records
    Base.metadata.create_all(bind=engine)
    with engine.begin() as connection:
        columns = {column["name"] for column in inspect(connection).get_columns("job_postings")}
        if "deadline" not in columns:
            column_type = "TIMESTAMP WITH TIME ZONE" if engine.dialect.name == "postgresql" else "DATETIME"
            connection.execute(text(f"ALTER TABLE job_postings ADD COLUMN deadline {column_type}"))
        connection.execute(text(
            "CREATE INDEX IF NOT EXISTS ix_job_postings_deadline ON job_postings (deadline)"
        ))
