import { useState } from "react";
import { Link } from "react-router-dom";
import "./Application.css";

function ApplicationTracking() {
  // Temporary sample applications for frontend testing
  // TODO: Replace mock data with applications fetched from the backend
  const [applications] = useState([
    {
      id: 1,
      title: "Software Engineer Intern",
      company: "Tech Solutions",
      location: "Montreal, QC",
      status: "Applied",
    },
    {
      id: 2,
      title: "Frontend Developer",
      company: "Web Solutions",
      location: "Toronto, ON",
      status: "Under Review",
    },
    {
      id: 3,
      title: "Junior Developer",
      company: "Digital Systems",
      location: "Ottawa, ON",
      status: "Interview",
    },
    {
      id: 4,
      title: "Software Developer",
      company: "Tech Innovations",
      location: "Vancouver, BC",
      status: "Offered",
    },
    {
      id: 5,
      title: "Backend Developer",
      company: "Cloud Technologies",
      location: "Montreal, QC",
      status: "Rejected",
    },
  ]);

  // Returns a CSS class based on the application status
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

  return (
    <div className="application-page">
      <div className="tracking-container">

        {/* Page heading */}
        <h1>CareerConnect</h1>
        <h2>My Job Applications</h2>

        {/* Show a message if the user has no applications */}
        {applications.length === 0 ? (
          <p>You have not applied for any jobs yet.</p>
        ) : (
          <div className="tracking-list">

            {/* Display each application as a separate card */}
            {applications.map((application) => (
              <div className="tracking-card" key={application.id}>

                <h3>{application.title}</h3>

                <p>
                  <strong>Company:</strong> {application.company}
                </p>

                <p>
                  <strong>Location:</strong> {application.location}
                </p>

                {/* Display the current application status */}
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
            ))}

          </div>
        )}

        {/* Navigate back to the job application page */}
        <div className="application-links">
          <Link to="/apply">Apply for a Job</Link>
        </div>

      </div>
    </div>
  );
}

export default ApplicationTracking;