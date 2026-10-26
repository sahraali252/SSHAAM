import { useState } from "react";
import { Link } from "react-router-dom";
import "./Application.css";

function JobApplication() {

  // Example job information (temporary mock data)
  // Later, this data will come from the backend
  const job = {
    id: 1,
    title: "Software Engineer Intern",
    company: "Tech Solutions",
    location: "Montreal, QC",
    type: "Internship",
    description:
      "We are looking for a motivated Software Engineering student to join our development team.",
  };

  // Stores the current application status
  const [applicationStatus, setApplicationStatus] = useState("");

  // Stores success or error messages
  const [message, setMessage] = useState("");

  // Prevents the user from submitting multiple times
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Runs when the user clicks the Apply Now button
  const handleApply = () => {

    // Prevent duplicate applications in the current page session
    if (isSubmitted) {
      setMessage("You have already applied for this job.");
      return;
    }

    // Simulate a successful application submission
    // TODO: Replace with a POST request to the backend API
    setApplicationStatus("Applied");

    // Display confirmation message
    setMessage("Application submitted successfully!");

    // Disable the Apply button after submission
    setIsSubmitted(true);
  };

  return (
    <div className="application-page">

      <div className="application-card">

        {/* Application title */}
        <h1>CareerConnect</h1>
        <h2>Job Application</h2>

        {/* Display selected job information */}
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
          <p>{job.description}</p>
        </div>

        {/* Button used to submit a job application */}
        <button
          className="apply-button"
          onClick={handleApply}
          disabled={isSubmitted}
        >
          {isSubmitted ? "Already Applied" : "Apply Now"}
        </button>

        {/* Display application confirmation */}
        {message && (
          <p className="application-message">
            {message}
          </p>
        )}

        {/* Display the current application status */}
        {applicationStatus && (
          <p className="application-status">
            <strong>Status:</strong> {applicationStatus}
          </p>
        )}

        {/* Navigate to the Application Tracking page */}
        <div className="application-links">
          <Link to="/applications">
            View My Applications
          </Link>
        </div>

      </div>
    </div>
  );
}

export default JobApplication;