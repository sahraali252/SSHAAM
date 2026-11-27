"""#95: a user can only apply once to the same job, whatever link format the id comes from."""

import pytest

from app.models import JobApplication
from app.schemas import normalize_job_id

HIMALAYAS = 'https://himalayas.app/companies/acme/jobs/react-developer'


def apply(client, headers, job_id):
    return client.post('/applications/', json={'job_id': job_id}, headers=headers)


def test_second_application_to_the_same_job_returns_400(client, database, users, headers, posting):
    first = apply(client, headers['seeker'], posting.id)
    second = apply(client, headers['seeker'], posting.id)

    assert first.status_code == 201
    assert second.status_code == 400
    assert second.json()['detail'] == 'You already applied to this job'
    assert database.query(JobApplication).filter_by(user_id=users['seeker'].id).count() == 1


@pytest.mark.parametrize('variant', [
    f'{HIMALAYAS}?utm_source=api',  # Himalayas applicationLink
    f'{HIMALAYAS}/',
    f'  {HIMALAYAS}  ',
    f'{HIMALAYAS}#apply',
])
def test_link_variants_of_the_same_job_cannot_bypass_the_duplicate_check(
        client, database, users, headers, variant):
    assert apply(client, headers['seeker'], HIMALAYAS).status_code == 201
    response = apply(client, headers['seeker'], variant)

    assert response.status_code == 400
    rows = database.query(JobApplication).filter_by(user_id=users['seeker'].id).all()
    assert [row.job_id for row in rows] == [HIMALAYAS]


def test_application_stores_the_normalized_job_id(client, headers):
    response = apply(client, headers['seeker'], f'{HIMALAYAS}?utm_source=api')
    assert response.status_code == 201
    assert response.json()['job_id'] == HIMALAYAS


def test_other_users_and_other_jobs_are_not_blocked(client, headers, posting):
    assert apply(client, headers['seeker'], posting.id).status_code == 201
    assert apply(client, headers['other'], posting.id).status_code == 201
    assert apply(client, headers['seeker'], HIMALAYAS).status_code == 201


def test_empty_job_id_is_rejected(client, headers):
    assert apply(client, headers['seeker'], '   ').status_code == 422


@pytest.mark.parametrize('value, expected', [
    ('0b1c-uuid', '0b1c-uuid'),
    ('  0b1c-uuid ', '0b1c-uuid'),
    (f'{HIMALAYAS}?utm_source=api', HIMALAYAS),
    ('https://himalayas.app.evil.example/jobs/1?x=1', 'https://himalayas.app.evil.example/jobs/1?x=1'),
])
def test_normalize_job_id(value, expected):
    assert normalize_job_id(value) == expected
