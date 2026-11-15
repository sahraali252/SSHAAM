import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RecruiterDashboard.css";

const API_URL = "http://127.0.0.1:8000";

const emptyForm = {
  title: "",
  company_name: "",
  location: "",
  employment_type: "Full-time",
  description: "",
};

function RecruiterDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");
  const userEmail = localStorage.getItem("user_email");
  const userRole = localStorage.getItem("user_role");

  const [postings, setPostings] = useState([]);
  const [filter, setFilter] = useState("active");
  const [showForm, setShowForm] = useState(false);
  const [editingPosting, setEditingPosting] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
  }, [navigate, token, userRole]);

  const loadPostings = async () => {
    setLoading(true);

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
    } catch (error) {
      setMessage(error.message || "Unable to load job postings.");
    } finally {
      setLoading(false);
    }
  };

  const openCreateForm = () => {
    setEditingPosting(null);
    setFormData(emptyForm);
    setMessage("");
    setShowForm(true);
  };

  const openEditForm = (posting) => {
    setEditingPosting(posting);

    setFormData({
      title: posting.title,
      company_name: posting.company_name,
      location: posting.location,
      employment_type: posting.employment_type,
      description: posting.description,
    });

    setMessage("");
    setShowForm(true);
  };

  const closeForm = () => {
    setEditingPosting(null);
    setFormData(emptyForm);
    setShowForm(false);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const url = editingPosting
      ? `${API_URL}/recruiter/job-postings/${editingPosting.id}`
      : `${API_URL}/recruiter/job-postings/`;

    const method = editingPosting ? "PATCH" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to save the job posting."
        );
      }

      closeForm();
      await loadPostings();

      setMessage(
        editingPosting
          ? "Job posting updated successfully."
          : "Job posting created successfully."
      );
    } catch (error) {
      setMessage(
        error.message || "Unable to save the job posting."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleArchiveChange = async (posting) => {
    const nextStatus =
      posting.status === "active" ? "archived" : "active";

    try {
      const response = await fetch(
        `${API_URL}/recruiter/job-postings/${posting.id}/archive`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: nextStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to update the job posting."
        );
      }

      await loadPostings();

      setMessage(
        nextStatus === "archived"
          ? "Job posting archived."
          : "Job posting restored."
      );
    } catch (error) {
      setMessage(
        error.message || "Unable to update the job posting."
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_role");

    navigate("/login");
  };

  const scrollToPostings = () => {
    document.getElementById("my-postings")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const displayedPostings = postings.filter((posting) => {
    return filter === "all" || posting.status === filter;
  });

  return (
    <main className="recruiter-dashboard-page">
      <header className="recruiter-dashboard-header">
        <div className="recruiter-brand">
          <h1>CareerConnect</h1>
          <p>Recruiter workspace</p>
        </div>

        <nav className="recruiter-navigation">
          <button onClick={scrollToPostings}>
            My Postings
          </button>

          <button onClick={openCreateForm}>
            Create Posting
          </button>

          <button disabled title="Melissa will add this feature.">
            Applications
          </button>
        </nav>

        <div className="recruiter-header-actions">
          <span>{userEmail}</span>

          <button
            className="secondary-button"
            onClick={handleLogout}
          >
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

      {message && (
        <p className="recruiter-message" role="alert">
          {message}
        </p>
      )}

      {showForm && (
        <section className="posting-form-card">
          <div className="form-heading">
            <h3>
              {editingPosting
                ? "Edit Job Posting"
                : "Create Job Posting"}
            </h3>

            <button
              className="text-button"
              onClick={closeForm}
              type="button"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <label>
              Job title
              <input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </label>

            <label>
              Company name
              <input
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                required
              />
            </label>

            <div className="form-row">
              <label>
                Location
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Montreal, QC or Remote"
                  required
                />
              </label>

              <label>
                Employment type
                <select
                  name="employment_type"
                  value={formData.employment_type}
                  onChange={handleInputChange}
                >
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Internship</option>
                </select>
              </label>
            </div>

            <label>
              Job description
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="7"
                required
              />
            </label>

            <button
              className="primary-button"
              disabled={saving}
              type="submit"
            >
              {saving
                ? "Saving..."
                : editingPosting
                ? "Save Changes"
                : "Create Posting"}
            </button>
          </form>
        </section>
      )}

      <section className="postings-section" id="my-postings">
        <div className="posting-section-heading">
          <div>
            <h3>My Job Postings</h3>
            <p>Manage the opportunities you have published.</p>
          </div>

          <button
            className="primary-button"
            onClick={openCreateForm}
          >
            Create Job Posting
          </button>
        </div>

        <div className="posting-filters">
          <button
            className={filter === "active" ? "selected" : ""}
            onClick={() => setFilter("active")}
          >
            Active
          </button>

          <button
            className={filter === "archived" ? "selected" : ""}
            onClick={() => setFilter("archived")}
          >
            Archived
          </button>

          <button
            className={filter === "all" ? "selected" : ""}
            onClick={() => setFilter("all")}
          >
            All
          </button>
        </div>

        {loading ? (
          <p className="empty-state">Loading job postings...</p>
        ) : displayedPostings.length === 0 ? (
          <p className="empty-state">
            No {filter === "all" ? "" : filter} job postings yet.
          </p>
        ) : (
          <div className="posting-list">
            {displayedPostings.map((posting) => (
              <article className="posting-card" key={posting.id}>
                <div className="posting-card-top">
                  <div>
                    <span
                      className={`posting-status ${posting.status}`}
                    >
                      {posting.status}
                    </span>

                    <h4>{posting.title}</h4>

                    <p className="company-name">
                      {posting.company_name}
                    </p>
                  </div>

                  <span className="application-count">
                    {posting.application_count} application
                    {posting.application_count === 1 ? "" : "s"}
                  </span>
                </div>

                <p>
                  <strong>Location:</strong> {posting.location}
                </p>

                <p>
                  <strong>Type:</strong> {posting.employment_type}
                </p>

                <p className="posting-description">
                  {posting.description}
                </p>

                <div className="posting-actions">
                  <button
                    className="secondary-button"
                    onClick={() => openEditForm(posting)}
                  >
                    Edit
                  </button>

                  <button
                    className="secondary-button"
                    onClick={() => handleArchiveChange(posting)}
                  >
                    {posting.status === "active"
                      ? "Archive"
                      : "Restore"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default RecruiterDashboard;