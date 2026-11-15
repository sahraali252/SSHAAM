import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RecruiterOpportunities from "../components/RecruiterOpportunities";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const userId = localStorage.getItem("user_id");
  const userEmail = localStorage.getItem("user_email");
  const userRole = localStorage.getItem("user_role");
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (!userId || !token) {
      navigate("/login");
      return;
    }

    if (userRole === "recruiter") {
      navigate("/recruiter/dashboard");
    }
  }, [navigate, token, userId, userRole]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_role");

    navigate("/login");
  };

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div className="brand">
          <h1>CareerConnect</h1>
          <p>Your job-search workspace</p>
        </div>

        <nav className="dashboard-navigation">
          <button className="active-navigation-item">
            Opportunities
          </button>

          <button onClick={() => navigate("/profile")}>
            Profile
          </button>

          <button onClick={() => navigate("/resume-upload")}>
            Resume
          </button>

          <button onClick={() => navigate("/jobs")}>
            Browse Jobs
          </button>

          <button onClick={() => navigate("/applications")}>
            Applications
          </button>
        </nav>

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

      <section className="job-seeker-welcome">
        <p className="eyebrow">JOB OPPORTUNITIES</p>

        <h2>Find your next opportunity</h2>

        <p>
          Explore opportunities posted directly by recruiters on
          CareerConnect.
        </p>
      </section>

      <RecruiterOpportunities />
    </main>
  );
}

export default Dashboard;