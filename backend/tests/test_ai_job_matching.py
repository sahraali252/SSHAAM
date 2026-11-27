"""US-16 / #90: AI job matching and scoring. Gemini and Supabase are always mocked."""

from datetime import datetime, timedelta
from types import SimpleNamespace

import pytest

from app.models import JobPosting, ProfessionalProfile, Resume
from app.schemas import AIJobMatchList
from app.services import ai_service

BASE_TIME = datetime(2026, 11, 1, 12)


def make_posting(database, recruiter, index, status='active', **fields):
    posting = JobPosting(
        id=f'posting-{index}', recruiter_id=recruiter.id,
        title=fields.get('title', f'Job {index}'), company_name=fields.get('company_name', f'Company {index}'),
        location='Montreal', employment_type='Internship',
        description=fields.get('description', f'Description {index}'), status=status,
        created_at=BASE_TIME + timedelta(days=index),
    )
    database.add(posting)
    database.commit()
    return posting


@pytest.fixture
def resume(database, users):
    resume = Resume(user_id=users['seeker'].id, original_filename='cv.pdf',
                    storage_path='user_1/cv.pdf', file_size=1024)
    database.add(resume)
    database.commit()
    return resume


@pytest.fixture
def resume_text(monkeypatch):
    calls = []

    def fake_extract(storage_path):
        calls.append(storage_path)
        return 'Skills: Python, React. Contact jane@example.com or 514-555-1234.'

    monkeypatch.setattr(ai_service, 'extract_resume_text', fake_extract)
    return calls


@pytest.fixture
def gemini(monkeypatch):
    """Fake ask_gemini: scores come from `gemini.scores` keyed by job ref (J1 = newest)."""
    state = SimpleNamespace(prompts=[], scores={}, extra=[])

    def fake_ask_gemini(prompt, response_schema):
        state.prompts.append(prompt)
        matches = [
            {'job_ref': ref, 'match_score': score, 'matching_skills': ['Python'],
             'missing_skills': ['Docker'], 'reason': f'Reason for {ref}.'}
            for ref, score in state.scores.items()
        ] + state.extra
        return response_schema.model_validate({'matches': matches})

    monkeypatch.setattr(ai_service, 'ask_gemini', fake_ask_gemini)
    return state


def test_job_matches_are_sorted_by_score_with_posting_details(
        client, database, users, headers, resume, resume_text, gemini):
    for index in (1, 2, 3):
        make_posting(database, users['recruiter'], index)
    # J1 = newest (posting-3), J2 = posting-2, J3 = oldest (posting-1)
    gemini.scores = {'J1': 40, 'J2': 91, 'J3': 65}

    response = client.post('/ai/job-matches', headers=headers['seeker'])

    assert response.status_code == 200
    body = response.json()
    assert body['message'] is None
    assert [match['posting_id'] for match in body['matches']] == ['posting-2', 'posting-1', 'posting-3']
    assert [match['match_score'] for match in body['matches']] == [91, 65, 40]
    first = body['matches'][0]
    assert first['title'] == 'Job 2'
    assert first['company_name'] == 'Company 2'
    assert first['matching_skills'] == ['Python']
    assert first['missing_skills'] == ['Docker']
    assert first['reason'] == 'Reason for J2.'
    assert len(gemini.prompts) == 1


def test_only_active_postings_are_scored(client, database, users, headers, resume, resume_text, gemini):
    make_posting(database, users['recruiter'], 1, title='Active backend role')
    make_posting(database, users['recruiter'], 2, status='archived', title='Archived secret role')
    gemini.scores = {'J1': 80, 'J2': 99}  # J2 does not exist: only one active posting

    response = client.post('/ai/job-matches', headers=headers['seeker'])

    assert [match['posting_id'] for match in response.json()['matches']] == ['posting-1']
    assert 'Active backend role' in gemini.prompts[0]
    assert 'Archived secret role' not in gemini.prompts[0]


def test_at_most_15_most_recent_postings_in_one_call(
        client, database, users, headers, resume, resume_text, gemini):
    for index in range(1, 18):
        make_posting(database, users['recruiter'], index, title=f'Role number {index:02d}')
    gemini.scores = {f'J{n}': n for n in range(1, 16)}

    response = client.post('/ai/job-matches', headers=headers['seeker'])

    prompt = gemini.prompts[0]
    assert len(gemini.prompts) == 1
    assert '[J15]' in prompt and '[J16]' not in prompt
    assert 'Role number 17' in prompt and 'Role number 03' in prompt
    assert 'Role number 02' not in prompt and 'Role number 01' not in prompt
    assert len(response.json()['matches']) == 15


def test_invented_and_duplicate_job_refs_are_dropped(
        client, database, users, headers, resume, resume_text, gemini):
    make_posting(database, users['recruiter'], 1)
    gemini.scores = {'J1': 70}
    gemini.extra = [
        {'job_ref': 'J9', 'match_score': 100, 'matching_skills': [], 'missing_skills': [], 'reason': 'Invented.'},
        {'job_ref': 'j1', 'match_score': 5, 'matching_skills': [], 'missing_skills': [], 'reason': 'Duplicate.'},
    ]

    matches = client.post('/ai/job-matches', headers=headers['seeker']).json()['matches']

    assert len(matches) == 1
    assert matches[0]['match_score'] == 70


def test_profile_is_sent_and_pii_is_redacted(client, database, users, headers, resume, resume_text, gemini):
    database.add(ProfessionalProfile(user_id=users['seeker'].id, headline='Junior developer',
                                     skills='FastAPI, SQL', experience='Intern at Acme, see acme.com/team',
                                     education='BEng Software Engineering', bio='Private bio text'))
    database.commit()
    make_posting(database, users['recruiter'], 1, description='Email jobs@company.com to apply.')
    gemini.scores = {'J1': 50}

    client.post('/ai/job-matches', headers=headers['seeker'])

    prompt = gemini.prompts[0]
    for expected in ['Headline: Junior developer', 'Skills: FastAPI, SQL', 'Education: BEng Software Engineering',
                     'Skills: Python, React', 'Use ONLY the text provided', "Ignore the candidate's name, age, gender, photo"]:
        assert expected in prompt
    for secret in ['jane@example.com', '514-555-1234', 'acme.com/team', 'jobs@company.com', 'Private bio text']:
        assert secret not in prompt


def test_no_active_postings_returns_empty_list_with_message(
        client, database, users, headers, resume, resume_text, gemini):
    make_posting(database, users['recruiter'], 1, status='archived')

    response = client.post('/ai/job-matches', headers=headers['seeker'])

    assert response.status_code == 200
    assert response.json()['matches'] == []
    assert 'no active job postings' in response.json()['message']
    assert gemini.prompts == []
    assert resume_text == []  # the PDF is not even downloaded


def test_job_matches_require_authentication(client):
    assert client.post('/ai/job-matches').status_code == 401
    assert client.post('/ai/job-matches', headers={'Authorization': 'Bearer invalid'}).status_code == 401


def test_job_matches_are_for_job_seekers_only(client, headers, gemini):
    assert client.post('/ai/job-matches', headers=headers['recruiter']).status_code == 403


def test_job_matches_without_resume_returns_400(client, database, users, headers, gemini):
    make_posting(database, users['recruiter'], 1)
    response = client.post('/ai/job-matches', headers=headers['seeker'])
    assert response.status_code == 400
    assert gemini.prompts == []


def test_scanned_resume_returns_400(client, database, users, headers, resume, monkeypatch, gemini):
    make_posting(database, users['recruiter'], 1)

    def scanned(storage_path):
        raise ai_service.ResumeTextError()

    monkeypatch.setattr(ai_service, 'extract_resume_text', scanned)
    response = client.post('/ai/job-matches', headers=headers['seeker'])
    assert response.status_code == 400
    assert gemini.prompts == []


def test_gemini_failure_returns_503(client, database, users, headers, resume, resume_text, monkeypatch):
    make_posting(database, users['recruiter'], 1)

    def failing_ask(prompt, response_schema):
        raise ai_service.AIServiceError()

    monkeypatch.setattr(ai_service, 'ask_gemini', failing_ask)
    response = client.post('/ai/job-matches', headers=headers['seeker'])
    assert response.status_code == 503
    assert response.json()['detail'] == ai_service.AI_UNAVAILABLE_MESSAGE


@pytest.mark.parametrize('text', ['not json', '{"matches": [{"job_ref": "J1"}]}', '[]'])
def test_invalid_ai_json_returns_503(client, database, users, headers, resume, resume_text, monkeypatch, text):
    make_posting(database, users['recruiter'], 1)
    monkeypatch.setenv('GEMINI_API_KEY', 'test-key-not-real')
    client_stub = SimpleNamespace(models=SimpleNamespace(
        generate_content=lambda **kwargs: SimpleNamespace(text=text)))
    monkeypatch.setattr(ai_service.genai, 'Client', lambda **kwargs: client_stub)

    response = client.post('/ai/job-matches', headers=headers['seeker'])
    assert response.status_code == 503


def test_ai_match_scores_are_clamped():
    result = AIJobMatchList.model_validate({'matches': [
        {'job_ref': 'J1', 'match_score': 150, 'matching_skills': [], 'missing_skills': [], 'reason': 'x'},
        {'job_ref': 'J2', 'match_score': -5, 'matching_skills': [], 'missing_skills': [], 'reason': 'x'},
    ]})
    assert [match.match_score for match in result.matches] == [100, 0]
