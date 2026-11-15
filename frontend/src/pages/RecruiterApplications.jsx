
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RecruiterApplications.css";

const API_URL = "http://127.0.0.1:8000";

const statuses = [
  "Applied",
  "Under Review",
  "Interview",
  "Offered",
  "Rejected",
];

function RecruiterApplications() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");
  const userRole = localStorage.getItem("user_role");

  const [postings, setPostings] = useState([]);
  const [selectedPosting, setSelectedPosting] = useState("");
  const [applications, setApplications] = useState([]);

  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (userRole !== "recruiter") {
      navigate("/dashboard");
      return;
    }

    loadPostings();
  }, [token, userRole, navigate]);

  const loadPostings = async () => {
    try {
      const response = await fetch(
        `${API_URL}/recruiter/job-postings/?include_archived=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to load job postings.");
      }

      setPostings(data);

      if (data.length > 0) {
        setSelectedPosting(data[0].id);
      } else {
        setMessage("You do not have any job postings yet.");
      }
    } catch (error) {
      setMessage(error.message);
    }
  };

  const loadApplications = async () => {
    if (!selectedPosting) return;

    setLoading(true);
    setMessage("");

    try {
      const params = new URLSearchParams();

      if (statusFilter) {
        params.append("status_filter", statusFilter);
      }

      if (startDate) {
        params.append("start_date", `${startDate}T00:00:00`);
      }

      if (endDate) {
        params.append("end_date", `${endDate}T23:59:59`);
      }

      const queryString = params.toString();
      const url =
        `${API_URL}/recruiter/applications/job-postings/${selectedPosting}` +
        (queryString ? `?${queryString}` : "");

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to load applications.");
      }

      setApplications(data);
    } catch (error) {
      setMessage(error.message);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPosting) {
      loadApplications();
    }
  }, [selectedPosting]);

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      const response = await fetch(
        `${API_URL}/recruiter/applications/${applicationId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to update status.");
      }

      setApplications((current) =>
        current.map((application) =>
          application.application_id === applicationId
            ? { ...application, status: newStatus }
            : application
        )
      );

      setMessage("Application status updated successfully.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_role");
    navigate("/login");
  };

  return (
    <main className="recruiter-applications-page">
      <header className="applications-header">
        <div>
          <h1>CareerConnect</h1>
          <p>Application Review</p>
        </div>

        <nav>
          <button onClick={() => navigate("/recruiter/dashboard")}>
            My Postings
          </button>

          <button onClick={handleLogout}>
            Log out
          </button>
        </nav>
      </header>

      <section className="applications-content">
        <h2>Candidate Applications</h2>
        <p>Review candidates and manage their application status.</p>

        <div className="application-filters">
          <label>
            Job posting
            <select
              value={selectedPosting}
              onChange={(event) => setSelectedPosting(event.target.value)}
            >
              {postings.map((posting) => (
                <option key={posting.id} value={posting.id}>
                  {posting.title}
                </option>
              ))}
            </select>
          </label>

          <label>
            Application status
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="">All statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label>
            From date
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </label>

          <label>
            To date
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </label>

          <button
            className="filter-button"
            onClick={loadApplications}
            disabled={!selectedPosting || loading}
          >
            Apply Filters
          </button>
        </div>

        {message && (
          <p className="applications-message" role="alert">
            {message}
          </p>
        )}

        {loading ? (
          <p>Loading applications...</p>
        ) : applications.length === 0 ? (
          <p className="no-applications">
            No applications found for these filters.
          </p>
        ) : (
          <div className="candidate-list">
            {applications.map((application) => (
              <article
                className="candidate-card"
                key={application.application_id}
              >
                <div className="candidate-heading">
                  <div>
                    <h3>{application.candidate_name}</h3>
                    <p>{application.candidate_email}</p>
                  </div>

                  <span className="candidate-status">
                    {application.status}
                  </span>
                </div>

                <p>
                  <strong>Applied:</strong>{" "}
                  {new Date(application.application_date).toLocaleDateString()}
                </p>

                {application.profile && (
                  <div className="candidate-profile">
                    <h4>Candidate Profile</h4>
                    {application.profile.headline && (
                      <p><strong>Headline:</strong> {application.profile.headline}</p>
                    )}
                    {application.profile.location && (
                      <p><strong>Location:</strong> {application.profile.location}</p>
                    )}
                    {application.profile.bio && (
                      <p><strong>About:</strong> {application.profile.bio}</p>
                    )}
                    {application.profile.skills && (
                      <p><strong>Skills:</strong> {application.profile.skills}</p>
                    )}
                    {application.profile.education && (
                      <p><strong>Education:</strong> {application.profile.education}</p>
                    )}
                    {application.profile.experience && (
                      <p><strong>Experience:</strong> {application.profile.experience}</p>
                    )}
                  </div>
                )}

                {application.resume && (
                  <p>
                    <strong>Resume:</strong>{" "}
                    <a
                      href={application.resume.view_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View {application.resume.filename}
                    </a>
                  </p>
                )}

                {!application.resume && (
                  <p>No resume uploaded.</p>
                )}

                <label className="status-update">
                  Update application status
                  <select
                    value={application.status}
                    onChange={(event) =>
                      handleStatusChange(
                        application.application_id,
                        event.target.value
                      )
                    }
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default RecruiterApplications;