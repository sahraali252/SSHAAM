"""US-15 / #24: AI resume feedback. Gemini and Supabase are always mocked."""

import io
from types import SimpleNamespace

import pytest
from pypdf import PdfWriter

from app.models import Resume
from app.schemas import ResumeFeedbackResponse
from app.services import ai_service

FEEDBACK = {
    'overall_score': 78,
    'summary': 'A solid technical resume that needs more measurable results.',
    'strengths': ['Relevant Python and React projects'],
    'improvements': [{'section': 'Experience', 'issue': 'Bullets describe duties only.',
                      'suggestion': 'Add measurable outcomes to each bullet.'}],
    'missing_sections': ['Projects'],
}


@pytest.fixture
def resume(database, users):
    resume = Resume(user_id=users['seeker'].id, original_filename='cv.pdf',
                    storage_path='user_1/cv.pdf', file_size=1024)
    database.add(resume)
    database.commit()
    return resume


@pytest.fixture
def resume_text(monkeypatch):
    text = 'Jane Doe\njane@example.com\nSkills: Python, React\nExperience: Intern at Acme'
    monkeypatch.setattr(ai_service, 'extract_resume_text', lambda storage_path: text)
    return text


@pytest.fixture
def gemini(monkeypatch):
    """Fake ask_gemini that records prompts and returns the given payload."""
    calls = []

    def fake_ask_gemini(prompt, response_schema):
        calls.append(prompt)
        return response_schema.model_validate(FEEDBACK)

    monkeypatch.setattr(ai_service, 'ask_gemini', fake_ask_gemini)
    return calls


def fake_genai_client(monkeypatch, *, text=None, error=None):
    """Replace the google-genai client so the real ask_gemini logic runs offline."""
    monkeypatch.setenv('GEMINI_API_KEY', 'test-key-not-real')

    def generate_content(**kwargs):
        if error:
            raise error
        return SimpleNamespace(text=text)

    client = SimpleNamespace(models=SimpleNamespace(generate_content=generate_content))
    monkeypatch.setattr(ai_service.genai, 'Client', lambda **kwargs: client)


def blank_pdf_bytes():
    writer = PdfWriter()
    writer.add_blank_page(width=612, height=792)
    buffer = io.BytesIO()
    writer.write(buffer)
    return buffer.getvalue()


def fake_storage(monkeypatch, *, data=None, error=None):
    def download(path):
        if error:
            raise error
        return data

    bucket = SimpleNamespace(download=download)
    storage = SimpleNamespace(storage=SimpleNamespace(from_=lambda name: bucket))
    monkeypatch.setattr(ai_service, '_get_supabase', lambda: storage)


def test_resume_feedback_returns_structured_feedback(client, headers, resume, resume_text, gemini):
    response = client.post('/ai/resume-feedback', headers=headers['seeker'])
    assert response.status_code == 200
    assert response.json() == FEEDBACK
    assert len(gemini) == 1


def test_resume_feedback_prompt_is_redacted_and_follows_rules(client, headers, resume, resume_text, gemini):
    client.post('/ai/resume-feedback', headers=headers['seeker'])
    prompt = gemini[0]
    assert 'jane@example.com' not in prompt
    assert '[EMAIL]' in prompt
    assert 'Skills: Python, React' in prompt
    assert 'Use ONLY the text provided' in prompt
    assert 'Ignore the candidate\'s name, age, gender, photo' in prompt


def test_resume_feedback_requires_authentication(client):
    assert client.post('/ai/resume-feedback').status_code == 401
    assert client.post('/ai/resume-feedback',
                       headers={'Authorization': 'Bearer invalid'}).status_code == 401


def test_resume_feedback_is_for_job_seekers_only(client, headers, gemini):
    assert client.post('/ai/resume-feedback', headers=headers['recruiter']).status_code == 403


def test_resume_feedback_without_resume_returns_400(client, headers, gemini):
    response = client.post('/ai/resume-feedback', headers=headers['seeker'])
    assert response.status_code == 400
    assert 'upload a resume' in response.json()['detail']
    assert gemini == []


def test_scanned_pdf_without_text_returns_400(client, headers, resume, monkeypatch, gemini):
    fake_storage(monkeypatch, data=blank_pdf_bytes())
    response = client.post('/ai/resume-feedback', headers=headers['seeker'])
    assert response.status_code == 400
    assert 'scanned' in response.json()['detail']
    assert gemini == []


def test_corrupt_pdf_returns_400(client, headers, resume, monkeypatch, gemini):
    fake_storage(monkeypatch, data=b'this is not a pdf')
    response = client.post('/ai/resume-feedback', headers=headers['seeker'])
    assert response.status_code == 400


def test_storage_failure_returns_503(client, headers, resume, monkeypatch, gemini):
    fake_storage(monkeypatch, error=ConnectionError('supabase down'))
    response = client.post('/ai/resume-feedback', headers=headers['seeker'])
    assert response.status_code == 503


@pytest.mark.parametrize('error', [TimeoutError('timed out'), RuntimeError('429 RESOURCE_EXHAUSTED')])
def test_gemini_failure_returns_503(client, headers, resume, resume_text, monkeypatch, error):
    fake_genai_client(monkeypatch, error=error)
    response = client.post('/ai/resume-feedback', headers=headers['seeker'])
    assert response.status_code == 503
    assert response.json()['detail'] == ai_service.AI_UNAVAILABLE_MESSAGE


def test_missing_gemini_key_returns_503(client, headers, resume, resume_text, monkeypatch):
    monkeypatch.delenv('GEMINI_API_KEY', raising=False)
    response = client.post('/ai/resume-feedback', headers=headers['seeker'])
    assert response.status_code == 503
    assert response.json()['detail'] == ai_service.AI_UNAVAILABLE_MESSAGE


@pytest.mark.parametrize('text', ['not json at all', '{"overall_score": 50}', '', None])
def test_invalid_ai_json_returns_503(client, headers, resume, resume_text, monkeypatch, text):
    fake_genai_client(monkeypatch, text=text)
    response = client.post('/ai/resume-feedback', headers=headers['seeker'])
    assert response.status_code == 503


def test_ask_gemini_parses_valid_json(monkeypatch):
    import json
    fake_genai_client(monkeypatch, text=json.dumps({**FEEDBACK, 'overall_score': 140}))
    result = ai_service.ask_gemini('prompt', ResumeFeedbackResponse)
    assert result.improvements[0].section == 'Experience'
    assert result.overall_score == 100  # out-of-range scores are clamped


def test_redact_pii_removes_email_phone_and_urls():
    text = ('Contact: jane.doe@gmail.com, +1 (514) 555-1234, 438.555.9876\n'
            'linkedin.com/in/janedoe https://github.com/jane www.jane.dev\n'
            'Skills: ASP.NET, Node.js, Python 3.12. Concordia 2019 - 2023, GPA 3.8/4.3')
    redacted = ai_service.redact_pii(text)
    for secret in ['jane.doe@gmail.com', '555-1234', '555.9876', 'linkedin.com', 'github.com', 'www.jane.dev']:
        assert secret not in redacted
    assert redacted.count('[EMAIL]') == 1
    assert redacted.count('[PHONE]') == 2
    assert redacted.count('[URL]') == 3
    assert 'ASP.NET, Node.js, Python 3.12. Concordia 2019 - 2023, GPA 3.8/4.3' in redacted


def test_truncation_limits_text_sent_to_gemini():
    assert ai_service.truncate_text('a' * 9000) == 'a' * ai_service.MAX_AI_TEXT_CHARS
    assert ai_service.truncate_text('short') == 'short'
    prepared = ai_service.prepare_text('me@example.com ' + 'b' * 9000)
    assert len(prepared) == ai_service.MAX_AI_TEXT_CHARS
    assert prepared.startswith('[EMAIL]')


def test_long_resume_is_truncated_in_prompt(client, headers, resume, monkeypatch, gemini):
    monkeypatch.setattr(ai_service, 'extract_resume_text', lambda path: 'x' * 20000)
    client.post('/ai/resume-feedback', headers=headers['seeker'])
    assert 'x' * ai_service.MAX_AI_TEXT_CHARS in gemini[0]
    assert 'x' * (ai_service.MAX_AI_TEXT_CHARS + 1) not in gemini[0]
