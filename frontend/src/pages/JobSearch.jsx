import { useEffect, useState } from "react";
import "./JobSearch.css";

function JobSearch() {
  const [jobs, setJobs] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("Canada");
  const [category, setCategory] = useState("");  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

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

      const data = await response.json();

      setJobs(data.jobs || []);
    } catch (error) {
      console.error("Unable to load jobs:", error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    fetchJobs();
  };

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

  if (selectedJob) {
    return (
      <div className="job-search-page">
        <div className="job-details">
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
            <strong>Location:</strong> {formatLocation(selectedJob)}
          </p>

          {selectedJob.categories?.length > 0 && (
            <p>
              <strong>Category:</strong>{" "}
              {selectedJob.categories.slice(0, 3).join(", ")}
            </p>
          )}

          <hr />

          <div
            dangerouslySetInnerHTML={{
              __html: selectedJob.description,
            }}
          />

          <a
            className="apply-button"
            href={selectedJob.applicationLink}
            target="_blank"
            rel="noreferrer"
          >
            Apply for this job
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="job-search-page">
      <div className="job-search-container">
        <div className="job-search-header">
          <h1>Find Your Next Opportunity</h1>

          <p>
            Search available job opportunities by keyword, location, or
            category.
          </p>
        </div>

        <form className="search-form" onSubmit={handleSearch}>
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

          <button className="search-button" type="submit">
            Search
          </button>
        </form>

        {loading && <p>Loading jobs...</p>}

        {!loading && (
          <p className="results-count">
            {jobs.length} {jobs.length === 1 ? "job" : "jobs"} found
          </p>
        )}

        <div className="job-list">
          {!loading &&
            jobs.map((job) => (
              <div className="job-card" key={job.guid}>
                <h2>{job.title}</h2>

                <p className="job-company">{job.companyName}</p>

                <p className="job-location">{formatLocation(job)}</p>

                <p className="job-description">
                  {job.excerpt || "No description available."}
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

        {!loading && jobs.length === 0 && (
          <p>No jobs found. Try changing your search.</p>
        )}
      </div>
    </div>
  );
}

export default JobSearch;