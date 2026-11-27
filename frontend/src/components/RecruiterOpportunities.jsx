import { parseApiDate } from "../utils/dates";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ShareJobButton from "./ShareJobButton";
import AlreadyApplied from "./AlreadyApplied";
import useAppliedJobs from "../hooks/useAppliedJobs";
import { normalizeJobId } from "../utils/applications";
import "./RecruiterOpportunities.css";

const API_URL = "http://127.0.0.1:8000";

function RecruiterOpportunities() {
  const navigate = useNavigate();
  const appliedJobs = useAppliedJobs();

  const [postings, setPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPostings = async () => {
      try {
        const response = await fetch(
          `${API_URL}/job-postings/`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Unable to load opportunities."
          );
        }

        setPostings(data);
      } catch (error) {
        setError(
          error.message || "Unable to load opportunities."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPostings();
  }, []);

  const openApplication = (posting) => {
    navigate("/apply", {
      state: {
        job: {
          id: normalizeJobId(posting.id),
          title: posting.title,
          company: posting.company_name,
          location: posting.location,
          type: posting.employment_type,
          description: posting.description,
        },
      },
    });
  };

  if (loading) {
    return (
      <section className="recruiter-opportunities">
        <p>Loading recruiter opportunities...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="recruiter-opportunities">
        <p className="opportunities-error">{error}</p>
      </section>
    );
  }

  if (postings.length === 0) {
    return null;
  }

  return (
    <section className="recruiter-opportunities">
      <div className="opportunities-heading">
        <div>
          <p className="opportunities-eyebrow">
            NEW OPPORTUNITIES
          </p>

          <h2>Jobs posted by recruiters</h2>

          <p>
            Apply directly to opportunities posted on CareerConnect.
          </p>
        </div>
      </div>

      <div className="opportunity-list">
        {postings.slice(0, 6).map((posting) => (
          <article
            className="opportunity-card"
            key={posting.id}
          >
            <h3>{posting.title}</h3>

            <p className="opportunity-company">
              {posting.company_name}
            </p>

            <p>
              <strong>Location:</strong> {posting.location}
            </p>

            <p>
              <strong>Type:</strong> {posting.employment_type}
            </p>

            {posting.deadline && <p><strong>Deadline:</strong> {parseApiDate(posting.deadline)?.toLocaleString()}</p>}

            <p className="opportunity-description">
              {posting.description}
            </p>

            <div className="opportunity-actions">
              {appliedJobs.has(normalizeJobId(posting.id)) ? (
                <AlreadyApplied status={appliedJobs.get(normalizeJobId(posting.id))} />
              ) : (
                <button
                  className="opportunity-apply-button"
                  onClick={() => openApplication(posting)}
                >
                  View and Apply
                </button>
              )}
              <ShareJobButton posting={posting} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default RecruiterOpportunities;