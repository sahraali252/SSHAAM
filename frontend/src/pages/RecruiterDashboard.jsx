import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./RecruiterDashboard.css";
//this adds a dashboard for the recruiter so that not every user who logs in logs in as a job seeker
function RecruiterDashboard() {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("user_email");
  const userRole = localStorage.getItem("user_role");

  useEffect(() => {
    if (!localStorage.getItem("access_token")) {
      navigate("/login");
      return;
    }

    if (userRole !== "recruiter") {
      navigate("/dashboard");
    }
  }, [navigate, userRole]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_role");

    navigate("/login");
  };

  return (
    <main className="recruiter-dashboard-page">
      <header className="recruiter-dashboard-header">
        <div>
          <h1>CareerConnect</h1>
          <p>Recruiter workspace</p>
        </div>

        <div className="recruiter-header-actions">
          <span>{userEmail}</span>

          <button onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      <section className="recruiter-welcome">
        <p className="recruiter-eyebrow">RECRUITER DASHBOARD</p>

        <h2>Manage your job postings</h2>

        <p>
          Create, update, archive, and review applications for
          your job postings in one place.
        </p>
      </section>

      <section className="recruiter-dashboard-card">
        <h3>My Job Postings</h3>

        <p>
          You have not created any job postings yet.
        </p>

        <button disabled>
          Create Job Posting
        </button>

        <p className="recruiter-coming-soon">
          Posting management will be added next.
        </p>
      </section>
    </main>
  );
}

export default RecruiterDashboard;