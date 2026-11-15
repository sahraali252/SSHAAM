from datetime import datetime, timedelta, timezone

import pytest

from app.models import JobApplication, Notification
from app.services.notifications import generate_deadline_reminders


def apply(client, headers, job_id='local-job'):
    response = client.post('/applications/', json={'job_id': job_id}, headers=headers['seeker'])
    assert response.status_code == 201, response.text
    return response.json()['id']


def test_us_new_application_notifies_only_posting_recruiter(client, database, headers, posting):
    application_id = apply(client, headers)
    notifications = client.get('/notifications/', headers=headers['recruiter']).json()
    assert len(notifications) == 1
    assert notifications[0]['kind'] == 'new_application'
    assert notifications[0]['application_id'] == application_id
    assert client.get('/notifications/', headers=headers['outsider']).json() == []
    assert client.get('/notifications/', headers=headers['seeker']).json() == []
    duplicate = client.post('/applications/', json={'job_id': posting.id}, headers=headers['seeker'])
    assert duplicate.status_code == 400
    assert database.query(Notification).count() == 1


def test_us_recruiter_status_change_notifies_candidate(client, headers, posting):
    application_id = apply(client, headers)
    response = client.patch(f'/recruiter/applications/{application_id}/status',
                            json={'status': 'Under Review'}, headers=headers['recruiter'])
    assert response.status_code == 200
    assert response.json()['status'] == 'Under Review'
    messages = client.get('/notifications/', headers=headers['seeker']).json()
    assert len(messages) == 1 and messages[0]['kind'] == 'application_status'
    assert 'Under Review' in messages[0]['message']
    assert client.get('/notifications/', headers=headers['other']).json() == []
    # Repeating a status is a no-op.
    client.patch(f'/recruiter/applications/{application_id}/status',
                 json={'status': 'Under Review'}, headers=headers['recruiter'])
    assert client.get('/notifications/unread-count', headers=headers['seeker']).json() == {'unread_count': 1}


def test_us_interview_invitation_and_duplicate_retry(client, headers, posting):
    application_id = apply(client, headers)
    for _ in range(2):
        response = client.post(f'/recruiter/applications/{application_id}/interview',
                               json={'message': 'Join us Monday at 14:00 UTC'}, headers=headers['recruiter'])
        assert response.status_code == 200
        assert response.json()['status'] == 'Interview'
    messages = client.get('/notifications/', headers=headers['seeker']).json()
    assert {n['kind'] for n in messages} == {'interview_invitation', 'application_status'}
    assert len(messages) == 2
    assert next(n for n in messages if n['kind'] == 'interview_invitation')['message'] == 'Join us Monday at 14:00 UTC'


def test_us_deadline_reminders_for_eligible_seekers(client, database, headers, posting):
    deadline = datetime.now(timezone.utc) + timedelta(hours=4)
    response = client.patch(f'/recruiter/job-postings/{posting.id}',
                            json={'deadline': deadline.isoformat()}, headers=headers['recruiter'])
    assert response.status_code == 200
    assert response.json()['deadline'] is not None
    assert generate_deadline_reminders(database) == 2
    assert generate_deadline_reminders(database) == 0
    for name in ('seeker', 'other'):
        messages = client.get('/notifications/', headers=headers[name]).json()
        assert len(messages) == 1
        assert messages[0]['kind'] == 'deadline_reminder'
        assert messages[0]['job_id'] == posting.id
    assert client.get('/notifications/', headers=headers['recruiter']).json() == []


def test_us_read_status_count_and_user_isolation(client, database, headers, users):
    notice = Notification(user_id=users['seeker'].id, kind='application_status', message='Update')
    database.add(notice)
    database.commit()
    assert client.get('/notifications/unread-count', headers=headers['seeker']).json() == {'unread_count': 1}
    assert client.get('/notifications/unread-count', headers=headers['other']).json() == {'unread_count': 0}
    assert client.patch(f'/notifications/{notice.id}/read', headers=headers['other']).status_code == 404
    assert client.patch('/notifications/99999/read', headers=headers['seeker']).status_code == 404
    first = client.patch(f'/notifications/{notice.id}/read', headers=headers['seeker'])
    assert first.status_code == 200
    assert first.json()['is_read'] is True and first.json()['read_at'] is not None
    second = client.patch(f'/notifications/{notice.id}/read', headers=headers['seeker'])
    assert second.json()['read_at'] == first.json()['read_at']
    assert client.get('/notifications/?unread_only=true', headers=headers['seeker']).json() == []
    assert len(client.get('/notifications/', headers=headers['seeker']).json()) == 1
    assert client.get('/notifications/unread-count', headers=headers['seeker']).json() == {'unread_count': 0}


@pytest.mark.parametrize('method,path', [('get', '/notifications/'), ('get', '/notifications/unread-count'),
    ('patch', '/notifications/1/read'), ('get', '/recruiter/applications/'),
    ('patch', '/recruiter/applications/1/status'), ('post', '/recruiter/applications/1/interview')])
def test_authentication_required(client, method, path):
    response = getattr(client, method)(path)
    assert response.status_code in (401, 403)
    assert getattr(client, method)(path, headers={'Authorization': 'Bearer invalid'}).status_code == 401


def test_recruiter_workflow_authorization(client, headers, posting):
    application_id = apply(client, headers)
    for route, method, data in [('status', 'patch', {'status': 'Rejected'}),
                                 ('interview', 'post', {'message': 'Interview'})]:
        assert getattr(client, method)(f'/recruiter/applications/{application_id}/{route}',
                   json=data, headers=headers['outsider']).status_code == 404
        assert getattr(client, method)(f'/recruiter/applications/{application_id}/{route}',
                   json=data, headers=headers['seeker']).status_code == 403
    assert client.get('/recruiter/applications/', headers=headers['outsider']).json() == []
    assert len(client.get('/recruiter/applications/', headers=headers['recruiter']).json()) == 1
    assert client.get('/recruiter/applications/', headers=headers['seeker']).status_code == 403


def test_existing_endpoints_remain_compatible(client, headers, posting):
    application_id = apply(client, headers)
    assert client.get('/').json() == {'status': 'ok'}
    assert client.get('/job-postings/').status_code == 200
    assert len(client.get('/applications/my-applications', headers=headers['seeker']).json()) == 1
    assert client.get(f'/applications/{application_id}/status', headers=headers['seeker']).json()['status'] == 'Applied'
    assert client.patch(f'/applications/{application_id}/status', json={'status': 'Rejected'},
                         headers=headers['seeker']).status_code == 200
    assert client.patch(f'/applications/{application_id}/status', json={'status': 'Offered'},
                         headers=headers['other']).status_code == 404
    assert client.patch(f'/applications/{application_id}/status', json={'status': 'Invalid'},
                         headers=headers['seeker']).status_code == 422
    # External job IDs keep working without inventing a recruiter recipient.
    assert client.post('/applications/', json={'job_id': 'external'}, headers=headers['seeker']).status_code == 201


def test_list_pagination_is_bounded_and_stable(client, database, users, headers):
    database.add_all([Notification(user_id=users['seeker'].id, kind='application_status', message=str(i)) for i in range(3)])
    database.commit()
    first = client.get('/notifications/?limit=1', headers=headers['seeker']).json()
    second = client.get('/notifications/?limit=1&offset=1', headers=headers['seeker']).json()
    assert first[0]['id'] > second[0]['id']
    assert client.get('/notifications/?limit=101', headers=headers['seeker']).status_code == 422
    assert client.get('/notifications/?offset=-1', headers=headers['seeker']).status_code == 422


def test_registration_login_and_notification_auth(client):
    response = client.post('/auth/register', json={'email': 'new@example.com', 'password': 'test-password',
                           'full_name': 'New Seeker', 'role': 'job_seeker'})
    assert response.status_code == 200
    login = client.post('/auth/login', json={'email': 'new@example.com', 'password': 'test-password'})
    assert login.status_code == 200
    auth = {'Authorization': f"Bearer {login.json()['access_token']}"}
    assert client.get('/notifications/', headers=auth).json() == []
    assert client.get('/notifications/unread-count', headers=auth).json() == {'unread_count': 0}


def test_candidate_cannot_create_recruiter_invitation(client, headers, posting):
    application_id = apply(client, headers)
    response = client.patch(f'/applications/{application_id}/status', json={'status': 'Interview'},
                            headers=headers['seeker'])
    assert response.status_code == 200
    messages = client.get('/notifications/', headers=headers['seeker']).json()
    assert [n['kind'] for n in messages] == ['application_status']


def test_posting_deadline_create_edit_clear_and_offset(client, headers):
    data = {'title': 'Deadline job', 'company_name': 'Co', 'location': 'Montreal',
            'employment_type': 'Intern', 'description': 'Job', 'deadline': '2026-11-16T10:00:00-05:00'}
    response = client.post('/recruiter/job-postings/', json=data, headers=headers['recruiter'])
    assert response.status_code == 201
    assert response.json()['deadline'].startswith('2026-11-16T15:00:00')
    job_id = response.json()['id']
    assert client.patch(f'/recruiter/job-postings/{job_id}', json={'deadline': None},
                         headers=headers['recruiter']).json()['deadline'] is None
    assert client.patch(f'/recruiter/job-postings/{job_id}', json={'deadline': 'not-a-date'},
                         headers=headers['recruiter']).status_code == 422
    assert client.patch(f'/recruiter/job-postings/{job_id}', json={'title': None},
                         headers=headers['recruiter']).status_code == 422


def test_recruiter_can_invite_after_candidate_tracks_interview(client, headers, posting):
    application_id = apply(client, headers)
    client.patch(f'/applications/{application_id}/status', json={'status': 'Interview'}, headers=headers['seeker'])
    response = client.post(f'/recruiter/applications/{application_id}/interview', json={'message': 'Official invitation'},
                           headers=headers['recruiter'])
    assert response.status_code == 200
    messages = client.get('/notifications/', headers=headers['seeker']).json()
    assert sum(n['kind'] == 'interview_invitation' for n in messages) == 1
