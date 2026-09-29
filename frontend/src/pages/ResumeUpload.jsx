import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();

  const handleUpload = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!file) {
      setMessage("Please select a PDF file.");
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
        "http://localhost:8000/resumes/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Resume uploaded successfully!");
        console.log("Uploaded resume:", data);
      } else {
        setMessage(data.detail || "Resume upload failed.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("Unable to connect to the server.");
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_email");
    navigate("/login");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>CareerConnect</h1>
        <h2>Upload Resume</h2>

        <p>Select your resume as a PDF file.</p>

        <form onSubmit={handleUpload}>
          <label>Resume</label>

          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <button type="submit" disabled={uploading}>
            {uploading ? "Uploading..." : "Upload Resume"}
          </button>
        </form>

        {message && <p className="message">{message}</p>}

        <button type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default ResumeUpload;