import os
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

os.environ['DATABASE_URL'] = 'sqlite://'
os.environ['SUPABASE_URL'] = 'https://notifications-test.supabase.co'
os.environ['SUPABASE_KEY'] = 'test-placeholder-key'
os.environ['JWT_SECRET_KEY'] = 'notifications-test-secret-not-for-production'
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.database import Base, get_db
from app.main import app
from app.models import User, JobPosting
from app.security import create_access_token


@pytest.fixture
def database(tmp_path):
    engine = create_engine(f'sqlite:///{tmp_path}/test.db', connect_args={'check_same_thread': False})
    Base.metadata.create_all(engine)
    factory = sessionmaker(bind=engine, autoflush=False)
    with factory() as db:
        yield db
    engine.dispose()


@pytest.fixture
def client(database, monkeypatch):
    import app.main as main
    monkeypatch.setattr(main, "engine", database.get_bind())
    monkeypatch.setattr(main, "SessionLocal", sessionmaker(bind=database.get_bind()))
    def override_db():
        yield database
    app.dependency_overrides[get_db] = override_db
    # Bind both API requests and the lifespan worker to the isolated test database.
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def users(database):
    result = {}
    for name, role in [('seeker', 'job_seeker'), ('other', 'job_seeker'),
                       ('recruiter', 'recruiter'), ('outsider', 'recruiter')]:
        user = User(email=f'{name}@example.com', password='test-hash', full_name=name, role=role)
        database.add(user)
        database.flush()
        result[name] = user
    database.commit()
    return result


@pytest.fixture
def headers(users):
    return {name: {'Authorization': f'Bearer {create_access_token(user.id)}'}
            for name, user in users.items()}


@pytest.fixture
def posting(database, users):
    posting = JobPosting(id='local-job', recruiter_id=users['recruiter'].id,
                         title='Software Developer', company_name='CareerConnect',
                         location='Montreal', employment_type='Internship', description='Test job')
    database.add(posting)
    database.commit()
    return posting
