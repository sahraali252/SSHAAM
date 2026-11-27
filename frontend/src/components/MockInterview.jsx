import { useEffect, useState } from "react";
import { getMockInterview } from "../services/ai";
import "./MockInterview.css";

const TYPE_LABELS = { technical: "Technical", "role-specific": "Role-specific" };

// US-18: the 10 AI-generated questions for one application, listed one per
// line, each with its own Show tip toggle.
export default function MockInterview({ application, job, onClose }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [openTips, setOpenTips] = useState(() => new Set());

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

  const toggleTip = (index) => {
    setOpenTips((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

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

      {!loading && !error && questions.length > 0 && (
        <>
          <p className="mock-interview-intro">
            Practice answering each question out loud, then open its tip to see what a strong answer covers.
          </p>

          <ol className="mock-interview-list" aria-label="Interview questions">
            {questions.map((question, index) => {
              const tipOpen = openTips.has(index);
              const tipId = `mock-interview-tip-${index}`;

              return (
                <li className="mock-interview-item" key={`${index}-${question.question}`}>
                  <div className="mock-interview-meta">
                    <span className="mock-interview-number">{index + 1}</span>
                    <span className={`mock-interview-type mock-interview-type-${question.type}`}>
                      {TYPE_LABELS[question.type] || "Question"}
                    </span>
                  </div>

                  <p className="mock-interview-question">{question.question}</p>

                  <button
                    className="secondary-button mock-interview-tip-toggle"
                    type="button"
                    aria-expanded={tipOpen}
                    aria-controls={tipId}
                    onClick={() => toggleTip(index)}
                  >
                    {tipOpen ? "Hide tip" : "Show tip"}
                  </button>

                  {tipOpen && (
                    <p className="mock-interview-tip" id={tipId}>
                      {question.tip || "No tip for this question."}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        </>
      )}
    </section>
  );
}
