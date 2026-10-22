import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ResumeUpload.css";

function ResumeUpload() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("user_id");

  const [resume, setResume] = useState(null);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [inputKey, setInputKey] = useState(0);

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    loadResume();
  }, [userId, navigate]);

  const loadResume = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `http://localhost:8000/resumes/${userId}`
      );

      if (response.status === 404) {
        setResume(null);
        return;
      }

      if (!response.ok) {
        throw new Error("Could not load resume.");
      }

      const data = await response.json();
      setResume(data);
    } catch {
      setMessage("Unable to load your resume.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!file) {
      setMessage("Please choose a PDF file first.");
      return;
    }

    if (file.type !== "application/pdf") {
      setMessage("Only PDF files are allowed.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);

      const response = await fetch(
        `http://localhost:8000/resumes/${userId}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Resume upload failed.");
        return;
      }

      setResume(data);
      setFile(null);
      setInputKey((currentKey) => currentKey + 1);
      setMessage(
        resume
          ? "Your resume was replaced successfully."
          : "Your resume was uploaded successfully."
      );
    } catch {
      setMessage("Unable to connect to the server.");
    } finally {
      setUploading(false);
    }
  };

  const handleView = async () => {
    setMessage("");

    try {
      const response = await fetch(
        `http://localhost:8000/resumes/${userId}/view`
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Unable to open the resume.");
        return;
      }

      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch {
      setMessage("Unable to open the resume.");
    }
  };

  const handleDelete = async () => {
    const shouldDelete = window.confirm(
      "Delete your uploaded resume? This cannot be undone."
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setDeleting(true);
      setMessage("");

      const response = await fetch(
        `http://localhost:8000/resumes/${userId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        setMessage(data.detail || "Unable to delete the resume.");
        return;
      }

      setResume(null);
      setFile(null);
      setInputKey((currentKey) => currentKey + 1);
      setMessage("Your resume was deleted.");
    } catch {
      setMessage("Unable to connect to the server.");
    } finally {
      setDeleting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024 * 1024) {
      return `${Math.ceil(bytes / 1024)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <main className="resume-page">
      <section className="resume-card">
        <button
          className="back-link"
          type="button"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to dashboard
        </button>

        <p className="resume-eyebrow">RESUME MANAGEMENT</p>
        <h1>Your resume</h1>
        <p className="resume-introduction">
          Upload one PDF resume. You can view, replace, or delete it at any
          time.
        </p>

        {loading ? (
          <p className="resume-loading">Loading your resume…</p>
        ) : (
          <>
            {resume ? (
              <section className="current-resume">
                <div className="pdf-icon">PDF</div>

                <div className="resume-details">
                  <h2>{resume.original_filename}</h2>
                  <p>
                    Current resume · {formatFileSize(resume.file_size)}
                  </p>
                </div>

                <div className="resume-actions">
                  <button
                    className="outline-button"
                    type="button"
                    onClick={handleView}
                  >
                    View resume
                  </button>

                  <button
                    className="delete-button"
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </section>
            ) : (
              <section className="empty-resume">
                <span>📄</span>
                <h2>No resume uploaded yet</h2>
                <p>Choose a PDF below to add your first resume.</p>
              </section>
            )}

            <form className="resume-form" onSubmit={handleUpload}>
              <label htmlFor="resume-file">
                {resume ? "Replace with a new PDF" : "Choose a PDF resume"}
              </label>

              <input
                key={inputKey}
                id="resume-file"
                type="file"
                accept=".pdf,application/pdf"
                onChange={(event) => setFile(event.target.files[0])}
              />

              <p className="file-help">PDF only · Maximum file size: 5 MB</p>

              <button
                className="upload-button"
                type="submit"
                disabled={uploading}
              >
                {uploading
                  ? "Saving resume..."
                  : resume
                    ? "Replace resume"
                    : "Upload resume"}
              </button>
            </form>
          </>
        )}

        {message && <p className="resume-message">{message}</p>}
      </section>
    </main>
  );
}

export default ResumeUpload;