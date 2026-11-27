import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getJobMatches } from "../services/ai";
import { normalizeJobId } from "../utils/applications";
import AlreadyApplied from "./AlreadyApplied";
import "./AiJobMatches.css";

const scoreLevel = (score) => (score >= 75 ? "high" : score >= 50 ? "medium" : "low");

// Only the best few matches are shown to keep the page focused.
export const TOP_MATCHES_SHOWN = 4;

// US-16: AI match scores for active CareerConnect postings, loaded on demand to save AI quota
const NO_APPLICATIONS = new Map();

// appliedJobs: normalized job id -> status (from useAppliedJobs on the job search page)
export default function AiJobMatches({ appliedJobs = NO_APPLICATIONS }) {
  const navigate = useNavigate();
  const [matches, setMatches] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const findMatches = async () => {
    setError("");
    setMessage("");
    setMatches(null);

    try {
      setLoading(true);
      const data = await getJobMatches();
      const sorted = [...(data.matches || [])].sort((a, b) => b.match_score - a.match_score);
      setMatches(sorted);
      setMessage(data.message || "");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const apply = (match) => {
    navigate("/apply", {
      state: {
        job: {
          id: normalizeJobId(match.posting_id),
          title: match.title,
          company: match.company_name,
          location: match.location,
          type: match.employment_type || "Not specified",
          description: match.description || "No description available.",
        },
      },
    });
  };

  return (
    <section className="ai-matches" aria-label="AI Job Matches">
      <div className="ai-matches-header">
        <div>
          <p className="eyebrow">AI-POWERED</p>
          <h2>AI Job Matches</h2>
          <p>
            Score CareerConnect postings against your resume and profile.
            Contact details are removed before anything is sent to the AI.
          </p>
        </div>
        {!matches && (
          <button
            className="ai-matches-button"
            type="button"
            onClick={findMatches}
            disabled={loading}
          >
            {loading ? "Finding matches..." : "Find my matches"}
          </button>
        )}
      </div>

      {loading && (
        <p className="ai-matches-status" role="status">
          Comparing your resume with active postings…
        </p>
      )}
      {error && <p className="ai-matches-error" role="alert">{error}</p>}
      {message && <p className="ai-matches-status">{message}</p>}

      {matches && matches.length > 0 && (
        <p className="ai-matches-summary">
          Your top {Math.min(matches.length, TOP_MATCHES_SHOWN)} of {matches.length} scored{" "}
          {matches.length === 1 ? "posting" : "postings"}
        </p>
      )}

      {matches && matches.length > 0 && (
        <ol className="ai-match-list" aria-label="AI job match results">
          {matches.slice(0, TOP_MATCHES_SHOWN).map((match) => (
            <li className="ai-match-card" key={match.posting_id}>
              <div className="ai-match-top">
                <span
                  className={`ai-match-score ai-match-score-${scoreLevel(match.match_score)}`}
                  aria-label={`Match score ${match.match_score} out of 100`}
                >
                  {match.match_score}% match
                </span>
                {appliedJobs.has(normalizeJobId(match.posting_id)) ? (
                  <AlreadyApplied status={appliedJobs.get(normalizeJobId(match.posting_id))} />
                ) : (
                  <button
                    className="job-details-button ai-match-apply"
                    type="button"
                    onClick={() => apply(match)}
                  >
                    Apply for this job
                  </button>
                )}
              </div>

              <div className="ai-match-body">
                <h3>{match.title}</h3>
                <p className="ai-match-company">{match.company_name}</p>
                <p className="ai-match-reason">{match.reason}</p>

                {match.matching_skills?.length > 0 && (
                  <div className="ai-match-skills">
                    <strong>Matching skills</strong>
                    {match.matching_skills.map((skill, index) => (
                      <span className="ai-skill ai-skill-match" key={`${index}-${skill}`}>{skill}</span>
                    ))}
                  </div>
                )}
                {match.missing_skills?.length > 0 && (
                  <div className="ai-match-skills">
                    <strong>Missing skills</strong>
                    {match.missing_skills.map((skill, index) => (
                      <span className="ai-skill ai-skill-missing" key={`${index}-${skill}`}>{skill}</span>
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}

      {matches && (
        <p className="ai-matches-disclaimer">
          AI scores are estimates. Read each posting before you apply.
        </p>
      )}
    </section>
  );
}
