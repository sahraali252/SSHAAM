import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Application.css";
import AlreadyApplied from "../components/AlreadyApplied";
import { normalizeJobId } from "../utils/applications";

function JobApplication() {
  // Get the selected job from Job Search
  const location = useLocation();
  const job = location.state?.job;
  // Same id format as every Apply entry point and the backend duplicate check
  const jobId = job?.id ? normalizeJobId(job.id) : "";

  // Application states
  const [applicationStatus, setApplicationStatus] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Save job details for display in Application Tracking
  const saveJobDetails = () => {
    if (!jobId) return;

    try {
      const saved = JSON.parse(
        localStorage.getItem("careerconnect_job_details") || "{}"
      );

      const jobDetails =
        saved && typeof saved === "object" && !Array.isArray(saved)
          ? saved
          : {};

      jobDetails[jobId] = {
        title: job.title,
        company: job.company,
        location: job.location,
        // Used by the AI mock interview for external jobs (US-18)
        description: (job.description || "").slice(0, 4000),
      };

      localStorage.setItem(
        "careerconnect_job_details",
        JSON.stringify(jobDetails)
      );
    } catch (error) {
      console.warn("Unable to save job details:", error);
    }
  };

  // Check if the user has already applied for this job
  useEffect(() => {
    if (!jobId) {
      setIsChecking(false);
      return;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
      setIsChecking(false);
      return;
    }

    const controller = new AbortController();

    const checkExistingApplication = async () => {
      setIsChecking(true);
      setIsSubmitted(false);
      setApplicationStatus("");
      setMessage("");

      try {
        const response = await fetch(
          "http://127.0.0.1:8000/applications/my-applications",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            setMessage(
              "Your session has expired. Please log in again."
            );
          } else {
            setMessage(
              "Unable to check existing applications. Please try again."
            );
          }
          return;
        }

        const applications = await response.json();

        const existing = applications.find(
          (application) =>
            normalizeJobId(application.job_id) === jobId
        );

        if (existing) {
          setIsSubmitted(true);
          setApplicationStatus(existing.status);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Unable to check applications:", error);
          setMessage(
            "Unable to check existing applications. Please try again."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsChecking(false);
        }
      }
    };

    checkExistingApplication();

    return () => controller.abort();
  }, [jobId]);

  // Submit application to the backend
  const handleApply = async () => {
    if (!jobId || isSubmitted || isSubmitting || isChecking) {
      return;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
      setMessage("Please log in before applying for a job.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/applications/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            job_id: jobId,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Save display information locally
        saveJobDetails();

        // Update application status
        setApplicationStatus(data.status || "Applied");

        // Prevent duplicate submissions
        setIsSubmitted(true);

        // Display confirmation message
        setMessage("Application submitted successfully!");
      } else {
        // Handle duplicate applications (409: two submissions at the same moment)
        if (
          response.status === 409 ||
          (response.status === 400 &&
            data.detail === "You already applied to this job")
        ) {
          saveJobDetails();

          setIsSubmitted(true);
          setApplicationStatus((current) => current || "Applied");
          setMessage("You already applied to this job.");
          return;
        }

        if (response.status === 401) {
          setMessage(
            "Your session has expired. Please log in again."
          );
        } else {
          setMessage(
            typeof data.detail === "string"
              ? data.detail
              : "Unable to submit your application."
          );
        }
      }
    } catch (error) {
      console.error("Application submission error:", error);

      setMessage(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="application-page">
      <div className="application-card">

        {/* Page heading */}
        <h1>CareerConnect</h1>
        <h2>Job Application</h2>

        {!jobId ? (
          <>
            <p>
              Please select a job from Job Search before applying.
            </p>

            <div className="application-links">
              <Link to="/jobs">Browse Jobs</Link>
            </div>
          </>
        ) : (
          <>
            {/* Selected job information */}
            <div className="job-details">
              <h3>{job.title}</h3>

              <p>
                <strong>Company:</strong> {job.company}
              </p>

              <p>
                <strong>Location:</strong> {job.location}
              </p>

              <p>
                <strong>Job Type:</strong> {job.type}
              </p>

              <h4>Job Description</h4>

              <p>
                {job.description || "No description available."}
              </p>
            </div>

            {/* Apply button, or "Already applied" with the status */}
            {isSubmitted ? (
              <AlreadyApplied status={applicationStatus} />
            ) : (
              <button
                className="apply-button"
                onClick={handleApply}
                disabled={isSubmitting || isChecking}
              >
                {isChecking
                  ? "Checking..."
                  : isSubmitting
                  ? "Submitting..."
                  : "Apply Now"}
              </button>
            )}

            {/* Success or error message */}
            {message && (
              <p className="application-message">
                {message}
              </p>
            )}

            {/* Navigation links */}
            <div className="application-links">
              <Link to="/applications">
                View My Applications
              </Link>

              <Link to="/jobs">
                Browse Jobs
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default JobApplication;