"""US-18 / #97: AI mock interview. Gemini and Supabase are always mocked."""

import json
from types import SimpleNamespace

import pytest

from app.models import JobApplication, Resume
from app.schemas import AIMockInterview
from app.services import ai_service

HIMALAYAS = 'https://himalayas.app/companies/acme/jobs/react-developer'


def questions(count=10):
    return [
        {'question': f'Question {n}?', 'type': 'technical' if n % 2 else 'role-specific', 'tip': f'Tip {n}.'}
        for n in range(1, count + 1)
    ]


@pytest.fixture
def gemini(monkeypatch):
    state = SimpleNamespace(prompts=[], questions=questions())

    def fake_ask_gemini(prompt, response_schema):
        state.prompts.append(prompt)
        return response_schema.model_validate({'questions': state.questions})

    monkeypatch.setattr(ai_service, 'ask_gemini', fake_ask_gemini)
    return state


@pytest.fixture
def extract(monkeypatch):
    calls = []

    def fake_extract(storage_path):
        calls.append(storage_path)
        return 'Skills: FastAPI, PostgreSQL. Contact jane@example.com'

    monkeypatch.setattr(ai_service, 'extract_resume_text', fake_extract)
    return calls


def make_application(database, user, job_id):
    application = JobApplication(user_id=user.id, job_id=job_id, status='Applied')
    database.add(application)
    database.commit()
    return application


def add_resume(database, user):
    database.add(Resume(user_id=user.id, original_filename='cv.pdf', storage_path='user/cv.pdf', file_size=10))
    database.commit()


def practice(client, headers, application_id, body=None):
    return client.post(f'/ai/mock-interview/{application_id}', headers=headers, json=body)


def test_returns_10_numbered_technical_or_role_specific_questions(
        client, database, users, headers, posting, gemini, extract):
    application = make_application(database, users['seeker'], posting.id)

    response = practice(client, headers['seeker'], application.id)

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 10
    assert [item['number'] for item in body] == list(range(1, 11))
    assert {item['type'] for item in body} <= {'technical', 'role-specific'}
    assert all(item['question'] and item['tip'] for item in body)
    assert len(gemini.prompts) == 1


def test_recruiter_posting_uses_database_details_not_the_request_body(
        client, database, users, headers, posting, gemini, extract):
    application = make_application(database, users['seeker'], posting.id)

    practice(client, headers['seeker'], application.id,
             {'title': 'Fake title', 'company': 'Fake company', 'description': 'Fake description'})

    prompt = gemini.prompts[0]
    assert 'Title: Software Developer' in prompt
    assert 'Company: CareerConnect' in prompt
    assert 'Test job' in prompt
    assert 'Fake' not in prompt


def test_himalayas_job_uses_details_from_the_request_body(client, database, users, headers, gemini, extract):
    application = make_application(database, users['seeker'], HIMALAYAS)

    response = practice(client, headers['seeker'], application.id, {
        'title': 'Remote React Developer', 'company': 'Acme',
        'description': 'Build React components with TypeScript. Email hr@acme.com',
    })

    assert response.status_code == 200
    prompt = gemini.prompts[0]
    assert 'Title: Remote React Developer' in prompt
    assert 'Company: Acme' in prompt
    assert 'Build React components with TypeScript.' in prompt
    assert 'hr@acme.com' not in prompt


def test_himalayas_job_without_details_returns_400(client, database, users, headers, gemini, extract):
    application = make_application(database, users['seeker'], HIMALAYAS)

    for body in (None, {'title': '   '}):
        assert practice(client, headers['seeker'], application.id, body).status_code == 400
    assert gemini.prompts == []


def test_works_without_a_resume(client, database, users, headers, posting, gemini, extract):
    application = make_application(database, users['seeker'], posting.id)

    response = practice(client, headers['seeker'], application.id)

    assert response.status_code == 200
    assert extract == []
    assert 'No resume provided.' in gemini.prompts[0]


def test_uses_the_redacted_resume_when_uploaded(client, database, users, headers, posting, gemini, extract):
    add_resume(database, users['seeker'])
    application = make_application(database, users['seeker'], posting.id)

    practice(client, headers['seeker'], application.id)

    prompt = gemini.prompts[0]
    assert extract == ['user/cv.pdf']
    assert 'Skills: FastAPI, PostgreSQL.' in prompt
    assert 'jane@example.com' not in prompt


def test_unreadable_resume_still_generates_questions(client, database, users, headers, posting, gemini, monkeypatch):
    add_resume(database, users['seeker'])
    application = make_application(database, users['seeker'], posting.id)

    def scanned(storage_path):
        raise ai_service.ResumeTextError()

    monkeypatch.setattr(ai_service, 'extract_resume_text', scanned)
    response = practice(client, headers['seeker'], application.id)

    assert response.status_code == 200
    assert 'No resume provided.' in gemini.prompts[0]


def test_prompt_forbids_behavioural_questions_and_invented_facts(
        client, database, users, headers, posting, gemini, extract):
    application = make_application(database, users['seeker'], posting.id)
    practice(client, headers['seeker'], application.id)

    prompt = gemini.prompts[0]
    assert 'Write EXACTLY 10 questions.' in prompt
    assert 'Do NOT write behavioural or generic questions' in prompt
    assert '"tell me about yourself"' in prompt
    assert 'Do not invent facts about the company' in prompt
    assert 'Base every question ONLY on the job details and the resume' in prompt


def test_application_of_another_user_returns_404(client, database, users, headers, posting, gemini, extract):
    application = make_application(database, users['other'], posting.id)

    assert practice(client, headers['seeker'], application.id).status_code == 404
    assert practice(client, headers['seeker'], 99999).status_code == 404
    assert gemini.prompts == []


def test_requires_authentication(client, database, users, posting):
    application = make_application(database, users['seeker'], posting.id)

    assert client.post(f'/ai/mock-interview/{application.id}').status_code == 401
    assert client.post(f'/ai/mock-interview/{application.id}',
                       headers={'Authorization': 'Bearer invalid'}).status_code == 401


def test_is_for_job_seekers_only(client, database, users, headers, posting, gemini):
    application = make_application(database, users['seeker'], posting.id)
    assert practice(client, headers['recruiter'], application.id).status_code == 403


def test_gemini_failure_returns_503(client, database, users, headers, posting, extract, monkeypatch):
    application = make_application(database, users['seeker'], posting.id)

    def failing_ask(prompt, response_schema):
        raise ai_service.AIServiceError()

    monkeypatch.setattr(ai_service, 'ask_gemini', failing_ask)
    response = practice(client, headers['seeker'], application.id)

    assert response.status_code == 503
    assert response.json()['detail'] == ai_service.AI_UNAVAILABLE_MESSAGE


@pytest.mark.parametrize('text', [
    'not json',
    json.dumps({'questions': [{'question': 'Q?', 'type': 'behavioural', 'tip': 'T'}] * 10}),
])
def test_invalid_ai_json_returns_503(client, database, users, headers, posting, extract, monkeypatch, text):
    application = make_application(database, users['seeker'], posting.id)
    monkeypatch.setenv('GEMINI_API_KEY', 'test-key-not-real')
    stub = SimpleNamespace(models=SimpleNamespace(generate_content=lambda **kwargs: SimpleNamespace(text=text)))
    monkeypatch.setattr(ai_service.genai, 'Client', lambda **kwargs: stub)

    assert practice(client, headers['seeker'], application.id).status_code == 503


def test_fewer_than_10_questions_returns_503(client, database, users, headers, posting, gemini, extract):
    gemini.questions = questions(7)
    application = make_application(database, users['seeker'], posting.id)
    assert practice(client, headers['seeker'], application.id).status_code == 503


def test_more_than_10_questions_are_trimmed_to_10(client, database, users, headers, posting, gemini, extract):
    gemini.questions = questions(13)
    application = make_application(database, users['seeker'], posting.id)
    body = practice(client, headers['seeker'], application.id).json()
    assert [item['number'] for item in body] == list(range(1, 11))


def test_question_types_are_normalized():
    result = AIMockInterview.model_validate({'questions': [
        {'question': 'Q', 'type': 'Technical', 'tip': 'T'},
        {'question': 'Q', 'type': 'Role Specific', 'tip': 'T'},
        {'question': 'Q', 'type': 'role_specific', 'tip': 'T'},
    ]})
    assert [item.type for item in result.questions] == ['technical', 'role-specific', 'role-specific']
