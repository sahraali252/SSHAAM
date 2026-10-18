import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("user_id");
  const userEmail = localStorage.getItem("user_email");

  const [profileName, setProfileName] = useState("");
  const [resume, setResume] = useState(null);

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    const loadDashboard = async () => {
      try {
        const [profileResponse, resumeResponse] = await Promise.all([
          fetch(`http://localhost:8000/profiles/${userId}`),
          fetch(`http://localhost:8000/resumes/${userId}`),
        ]);

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setProfileName(profileData.headline || "");
        }

        if (resumeResponse.ok) {
          const resumeData = await resumeResponse.json();
          setResume(resumeData);
        }
      } catch {
        // The dashboard actions still remain available if the server is offline.
      }
    };

    loadDashboard();
  }, [userId, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_email");
    navigate("/login");
  };

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div className="brand">
          <h1>CareerConnect</h1>
          <p>Your job-search workspace</p>
        </div>

        <div className="header-actions">
          <span className="user-email">{userEmail}</span>
          <button className="logout-button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      <section className="welcome-section">
        <p className="eyebrow">DASHBOARD</p>
        <h2>Welcome back!</h2>
        <p>
          Keep your professional profile and resume ready before applying to
          jobs.
        </p>
      </section>

      <section className="dashboard-grid">
        <article className="dashboard-card">
          <div className="card-icon profile-icon">👤</div>

          <div>
            <p className="card-label">PROFESSIONAL PROFILE</p>
            <h3>{profileName || "Create your professional profile"}</h3>
            <p>
              Add your headline, skills, education, experience, and a short
              professional summary.
            </p>
          </div>

          <button
            className="primary-action"
            onClick={() => navigate("/profile")}
          >
            {profileName ? "Edit profile" : "Create profile"}
          </button>
        </article>

        <article className="dashboard-card">
          <div className="card-icon resume-icon">📄</div>

          <div>
            <p className="card-label">RESUME</p>
            <h3>
              {resume ? "Your resume is ready" : "Upload your resume"}
            </h3>
            <p>
              {resume
                ? `Current file: ${resume.original_filename}`
                : "Upload a PDF resume so it is ready when you apply to jobs."}
            </p>
          </div>

          <button
            className="primary-action"
            onClick={() => navigate("/resume-upload")}
          >
            {resume ? "Manage resume" : "Upload resume"}
          </button>
        </article>
      </section>
    </main>
  );
}

export default Dashboard;