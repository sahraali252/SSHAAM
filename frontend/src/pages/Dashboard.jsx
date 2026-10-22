import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("user_id");
  const userEmail = localStorage.getItem("user_email");

  const [profile, setProfile] = useState(null);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    const loadDashboard = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const [profileResponse, resumeResponse] = await Promise.all([
          fetch(`http://localhost:8000/profiles/${userId}`),
          fetch(`http://localhost:8000/resumes/${userId}`),
        ]);

        if (profileResponse.ok) {
          setProfile(await profileResponse.json());
        } else if (profileResponse.status !== 404) {
          throw new Error("Unable to load your professional profile.");
        }

        if (resumeResponse.ok) {
          setResume(await resumeResponse.json());
        } else if (resumeResponse.status !== 404) {
          throw new Error("Unable to load your resume.");
        }
      } catch (error) {
        setLoadError(
          error.message || "Unable to connect to the server."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [userId, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_email");
    navigate("/login");
  };

  const profileFields = [
    { label: "Professional headline", value: profile?.headline },
    { label: "Location", value: profile?.location },
    { label: "Professional summary", value: profile?.bio },
    { label: "Skills", value: profile?.skills },
    { label: "Education", value: profile?.education },
    { label: "Work experience", value: profile?.experience },
  ];

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div className="brand">
          <h1>CareerConnect</h1>
          <p>Your job-search workspace</p>
        </div>

        <div className="header-actions">
          <span className="user-email">{userEmail}</span>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      </header>

      <section className="welcome-section">
        <p className="eyebrow">DASHBOARD</p>

        <h2>Welcome back!</h2>

        <p>
          Manage your professional profile, resume, and job search
          in one place.
        </p>
      </section>

      {loadError && (
        <p className="dashboard-message" role="alert">
          {loadError}
        </p>
      )}

      {loading ? (
        <p className="dashboard-message">
          Loading your information...
        </p>
      ) : (
        <section className="dashboard-grid">

          {/* PROFILE CARD */}

          <article className="dashboard-card">
            <div className="card-icon profile-icon"></div>

            <p className="card-label">
              PROFESSIONAL PROFILE
            </p>

            <h3>
              {profile?.headline || "Your professional profile"}
            </h3>

            <div className="profile-display">
              {profile ? (
                profileFields.map(({ label, value }) => (
                  <div
                    className="profile-display-field"
                    key={label}
                  >
                    <h4>{label}</h4>

                    <p>
                      {value?.trim()
                        ? value
                        : "Not provided yet"}
                    </p>
                  </div>
                ))
              ) : (
                <p>
                  You have not created a professional profile yet.
                </p>
              )}
            </div>

            <button
              className="primary-action"
              onClick={() => navigate("/profile")}
            >
              {profile ? "Edit profile" : "Create profile"}
            </button>
          </article>

          {/* RESUME CARD */}

          <article className="dashboard-card">
            <div className="card-icon resume-icon"></div>

            <p className="card-label">
              RESUME MANAGEMENT
            </p>

            <h3>
              {resume
                ? "Uploaded resume"
                : "No resume uploaded"}
            </h3>

            {resume ? (
              <div className="resume-display">
                <p className="resume-filename">
                  <strong>File name:</strong>{" "}
                  {resume.original_filename}
                </p>

                <p>
                  <strong>File size:</strong>{" "}
                  {resume.file_size < 1024 * 1024
                    ? `${Math.ceil(
                        resume.file_size / 1024
                      )} KB`
                    : `${(
                        resume.file_size /
                        (1024 * 1024)
                      ).toFixed(1)} MB`}
                </p>

                <p>
                  Your saved PDF resume is available to view.
                </p>
              </div>
            ) : (
              <p>
                Upload a PDF resume to keep it ready for job
                applications.
              </p>
            )}

            <button
              className="primary-action"
              onClick={() => navigate("/resume-upload")}
            >
              {resume
                ? "View or manage resume"
                : "Upload resume"}
            </button>
          </article>

          {/* JOB SEARCH CARD */}

          <article className="dashboard-card">
            <div className="card-icon jobs-icon"></div>

            <p className="card-label">
              JOB SEARCH
            </p>

            <h3>
              Find your next opportunity
            </h3>

            <p>
              Browse real job opportunities and search by keyword,
              location, or category.
            </p>

            <button
              className="primary-action"
              onClick={() => navigate("/jobs")}
            >
              Find jobs
            </button>
          </article>

        </section>
      )}
    </main>
  );
}

export default Dashboard;