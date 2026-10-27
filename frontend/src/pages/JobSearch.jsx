import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./JobSearch.css";

function JobSearch() {
  // Store job search results
  const [jobs, setJobs] = useState([]);

  // Store search filters
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("Canada");
  const [category, setCategory] = useState("");

  // Store loading state and selected job
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  // Navigate between pages
  const navigate = useNavigate();

  // Fetch available jobs from the backend
  const fetchJobs = async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams();

      if (keyword) {
        params.append("keyword", keyword);
      }

      if (location) {
        params.append("location", location);
      }

      if (category) {
        params.append("category", category);
      }

      const response = await fetch(
        `http://127.0.0.1:8000/jobs/?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Unable to fetch jobs");
      }

      const data = await response.json();

      setJobs(data.jobs || []);
    } catch (error) {
      console.error("Unable to load jobs:", error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // Load jobs when the page opens
  useEffect(() => {
    fetchJobs();
  }, []);

  // Handle job search
  const handleSearch = (event) => {
    event.preventDefault();
    fetchJobs();
  };

  // Format job location
  const formatLocation = (job) => {
    const locations = job.locationRestrictions;

    if (!locations || locations.length === 0) {
      return "Remote";
    }

    if (locations.length > 3) {
      return `Remote — ${locations.length} eligible countries`;
    }

    return locations.join(", ");
  };

  // Display details of the selected job
  if (selectedJob) {
    return (
      <div className="job-search-page">
        <div className="job-details">

          {/* Return to job search results */}
          <button
            className="back-button"
            onClick={() => setSelectedJob(null)}
          >
            ← Back to jobs
          </button>

          <h1>{selectedJob.title}</h1>

          <h2>{selectedJob.companyName}</h2>

          <p>
            <strong>Employment Type:</strong>{" "}
            {selectedJob.employmentType || "Not specified"}
          </p>

          <p>
            <strong>Location:</strong>{" "}
            {formatLocation(selectedJob)}
          </p>

          {selectedJob.categories?.length > 0 && (
            <p>
              <strong>Category:</strong>{" "}
              {selectedJob.categories.slice(0, 3).join(", ")}
            </p>
          )}

          <hr />

          {/* Job description */}
          <div
            dangerouslySetInnerHTML={{
              __html: selectedJob.description,
            }}
          />

          {/* Navigate to internal Job Application page */}
          <button
            type="button"
            className="apply-button"
            onClick={() =>
              navigate("/apply", {
                state: {
                  job: {
                    id: String(selectedJob.guid),
                    title: selectedJob.title,
                    company: selectedJob.companyName,
                    location: formatLocation(selectedJob),
                    type:
                      selectedJob.employmentType ||
                      "Not specified",
                    description:
                      selectedJob.excerpt ||
                      "No description available.",
                  },
                },
              })
            }
          >
            Apply for this job
          </button>

        </div>
      </div>
    );
  }

  // Display job search page
  return (
    <div className="job-search-page">
      <div className="job-search-container">

        <div className="job-search-header">
          <h1>Find Your Next Opportunity</h1>

          <p>
            Search available job opportunities by keyword, location, or category.
          </p>
        </div>

        {/* Job search form */}
        <form
          className="search-form"
          onSubmit={handleSearch}
        >
          <input
            type="text"
            placeholder="Job title or keyword"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />

          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <button
            className="search-button"
            type="submit"
          >
            Search
          </button>
        </form>

        {/* Loading message */}
        {loading && <p>Loading jobs...</p>}

        {/* Number of search results */}
        {!loading && (
          <p className="results-count">
            {jobs.length}{" "}
            {jobs.length === 1 ? "job" : "jobs"} found
          </p>
        )}

        {/* Display available jobs */}
        <div className="job-list">
          {!loading &&
            jobs.map((job) => (
              <div
                className="job-card"
                key={job.guid}
              >
                <h2>{job.title}</h2>

                <p className="job-company">
                  {job.companyName}
                </p>

                <p className="job-location">
                  {formatLocation(job)}
                </p>

                <p className="job-description">
                  {job.excerpt ||
                    "No description available."}
                </p>

                <button
                  className="job-details-button"
                  onClick={() => setSelectedJob(job)}
                >
                  View Details
                </button>
              </div>
            ))}
        </div>

        {/* No results message */}
        {!loading && jobs.length === 0 && (
          <p>
            No jobs found. Try changing your search.
          </p>
        )}

      </div>
    </div>
  );
}

export default JobSearch;