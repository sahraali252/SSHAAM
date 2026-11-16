from datetime import datetime

import pytest

from app.models import JobApplication


def test_us11_history_contains_only_own_applications_newest_first(client, database, users, headers):
    """US-11: a seeker sees their full history, statuses and submission dates."""
    records = [
        JobApplication(user_id=users['seeker'].id, job_id='external-old',
                       status='Applied', applied_at=datetime(2026, 1, 1, 12)),
        JobApplication(user_id=users['seeker'].id, job_id='external-new',
                       status='Interview', applied_at=datetime(2026, 3, 1, 12)),
        JobApplication(user_id=users['other'].id, job_id='private-job',
                       status='Rejected', applied_at=datetime(2026, 4, 1, 12)),
    ]
    database.add_all(records)
    database.commit()
    response = client.get('/applications/my-applications', headers=headers['seeker'])
    assert response.status_code == 200
    history = response.json()
    assert [row['job_id'] for row in history] == ['external-new', 'external-old']
    assert [row['status'] for row in history] == ['Interview', 'Applied']
    assert all(row['user_id'] == users['seeker'].id for row in history)
    assert [row['applied_at'] for row in history] == ['2026-03-01T12:00:00', '2026-01-01T12:00:00']


def test_history_is_empty_for_new_seeker(client, headers):
    response = client.get('/applications/my-applications', headers=headers['seeker'])
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.parametrize('auth', [{}, {'Authorization': 'Bearer invalid'}])
def test_history_requires_authentication(client, auth):
    assert client.get('/applications/my-applications', headers=auth).status_code in (401, 403)


def test_history_reflects_status_updates_without_changing_submission_date(client, headers):
    original = client.post('/applications/', json={'job_id': 'external'}, headers=headers['seeker']).json()
    response = client.patch(f"/applications/{original['id']}/status", json={'status': 'Rejected'},
                            headers=headers['seeker'])
    assert response.status_code == 200
    history = client.get('/applications/my-applications', headers=headers['seeker']).json()
    assert len(history) == 1
    assert history[0]['status'] == 'Rejected'
    assert history[0]['applied_at'] == original['applied_at']
