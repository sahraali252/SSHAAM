import { useEffect, useState } from "react";
import { getMockInterview } from "../services/ai";
import "./MockInterview.css";

const TYPE_LABELS = { technical: "Technical", "role-specific": "Role-specific" };

// US-18: practice 10 AI-generated questions for one application, one at a time.
// Practice answers stay in this component's state only (never sent anywhere).
export default function MockInterview({ application, job, onClose }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    getMockInterview(application.id, job, controller.signal)
      .then((data) => {
        const list = Array.isArray(data) ? data.filter((item) => item?.question) : [];
        if (list.length === 0) throw new Error("No interview questions were generated. Please try again.");
        setQuestions(list);
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError(requestError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [application.id, job, attempt]);

  const retry = () => {
    setError("");
    setLoading(true);
    setAttempt((current) => current + 1);
  };

  const goTo = (nextIndex) => {
    setIndex(nextIndex);
    setShowTip(false);
  };

  const restart = () => {
    setAnswers({});
    goTo(0);
  };

  const question = questions[index];
  const isLast = index === questions.length - 1;

  return (
    <section className="mock-interview" aria-label="Mock interview">
      <button className="back-link mock-interview-back" type="button" onClick={onClose}>
        ← Back to applications
      </button>

      <p className="mock-interview-eyebrow">MOCK INTERVIEW</p>
      <h2>{job?.title || "Job Application"}</h2>
      {job?.company && <p className="mock-interview-company">{job.company}</p>}

      {loading && (
        <p className="mock-interview-status" role="status">
          Generating 10 interview questions for this job…
        </p>
      )}

      {!loading && error && (
        <div className="mock-interview-error" role="alert">
          <p>{error}</p>
          <button className="secondary-button" type="button" onClick={retry}>
            Try again
          </button>
        </div>
      )}

      {!loading && !error && question && (
        <div className="mock-interview-card">
          <div className="mock-interview-meta">
            <span className="mock-interview-progress">
              Question {index + 1} of {questions.length}
            </span>
            <span className={`mock-interview-type mock-interview-type-${question.type}`}>
              {TYPE_LABELS[question.type] || "Question"}
            </span>
          </div>

          <h3 className="mock-interview-question">{question.question}</h3>

          <label className="mock-interview-label" htmlFor="mock-interview-answer">
            Your practice answer
          </label>
          <textarea
            id="mock-interview-answer"
            rows={6}
            placeholder="Type your answer to practice. It stays in your browser and is not sent anywhere."
            value={answers[index] || ""}
            onChange={(event) => setAnswers((current) => ({ ...current, [index]: event.target.value }))}
          />

          <button
            className="secondary-button mock-interview-tip-toggle"
            type="button"
            aria-expanded={showTip}
            onClick={() => setShowTip((current) => !current)}
          >
            {showTip ? "Hide tip" : "Show tip"}
          </button>
          {showTip && <p className="mock-interview-tip">{question.tip || "No tip for this question."}</p>}

          <div className="mock-interview-navigation">
            <button
              className="secondary-button"
              type="button"
              onClick={() => goTo(index - 1)}
              disabled={index === 0}
            >
              Previous
            </button>

            {isLast ? (
              <button className="primary-button" type="button" onClick={restart}>
                Restart
              </button>
            ) : (
              <button className="primary-button" type="button" onClick={() => goTo(index + 1)}>
                Next
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
