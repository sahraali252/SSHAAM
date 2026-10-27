import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Application.css";

function ApplicationTracking() {
  // Applications retrieved from the backend
  const [applications, setApplications] = useState([]);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get locally saved job details for display
  const [jobDetails] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("careerconnect_job_details") || "{}"
      );

      return saved &&
        typeof saved === "object" &&
        !Array.isArray(saved)
        ? saved
        : {};
    } catch {
      return {};
    }
  });

  // Fetch applications from the backend
  useEffect(() => {
    const controller = new AbortController();

    const fetchApplications = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("Please log in to view your applications.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:8000/applications/my-applications",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error(
              "Your session has expired. Please log in again."
            );
          }

          throw new Error(
            "Unable to load applications. Please try again."
          );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Unexpected response from the server.");
        }

        setApplications(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Application tracking error:", err);

          setError(
            err.message || "Unable to load your applications."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchApplications();

    return () => controller.abort();
  }, []);

  // Return CSS class based on application status
  const getStatusClass = (status) => {
    switch (status) {
      case "Applied":
        return "status-applied";

      case "Under Review":
        return "status-review";

      case "Interview":
        return "status-interview";

      case "Offered":
        return "status-offered";

      case "Rejected":
        return "status-rejected";

      default:
        return "";
    }
  };

  // Format application submission date
  const formatDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleString();
  };

  return (
    <div className="application-page">
      <div className="tracking-container">

        {/* Page heading */}
        <h1>CareerConnect</h1>
        <h2>My Job Applications</h2>

        {/* Loading state */}
        {loading ? (
          <p>Loading applications...</p>

        ) : error ? (
          <div>
            <p className="application-message" role="alert">
              {error}
            </p>

            <div className="application-links">
              <Link to="/login">Go to Login</Link>
            </div>
          </div>

        ) : applications.length === 0 ? (
          <p>You have not applied for any jobs yet.</p>

        ) : (
          <div className="tracking-list">

            {applications.map((application) => {
              // Get saved job details, if available
              const job =
                jobDetails[application.job_id] ||
                (application.job_id ===
                "https://himalayas.app/companies/micro1/jobs/military-operations-expert"
                  ? {
                      title: "Military Operations Expert",
                      company: "micro1",
                      location: "Remote",
                    }
                  : null);

              return (
                <div
                  className="tracking-card"
                  key={application.id}
                >

                  {/* Job title */}
                  <h3>
                    {job?.title || "Job Application"}
                  </h3>

                  {/* Company name */}
                  {job?.company && (
                    <p>
                      <strong>Company:</strong>{" "}
                      {job.company}
                    </p>
                  )}

                  {/* Job location */}
                  {job?.location && (
                    <p>
                      <strong>Location:</strong>{" "}
                      {job.location}
                    </p>
                  )}

                  {/* Job identifier */}
                  <p className="job-id">
                    <strong>Job ID:</strong>{" "}
                    {application.job_id}
                  </p>

                  {/* Application ID */}
                  <p>
                    <strong>Application ID:</strong>{" "}
                    {application.id}
                  </p>

                  {/* Application submission date */}
                  <p>
                    <strong>Applied on:</strong>{" "}
                    {formatDate(application.applied_at)}
                  </p>

                  {/* Application status */}
                  <p>
                    <strong>Status: </strong>

                    <span
                      className={`status-badge ${getStatusClass(
                        application.status
                      )}`}
                    >
                      {application.status}
                    </span>
                  </p>

                </div>
              );
            })}

          </div>
        )}

        {/* Navigation links */}
        <div className="application-links">
          <Link to="/jobs">
            Browse Jobs
          </Link>

          <Link to="/dashboard">
            Dashboard
          </Link>
        </div>

      </div>
    </div>
  );
}

export default ApplicationTracking;