import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./JobSearch.css";
import { parseApiDate } from "../utils/dates";
import ShareJobButton from "../components/ShareJobButton";

function JobSearch() {
  // Store job search results
  const [jobs, setJobs] = useState([]);
  const [postings, setPostings] = useState([]);
  const [postingsLoading, setPostingsLoading] = useState(true);
  const [postingsError, setPostingsError] = useState("");
  const [jobsError, setJobsError] = useState("");
  const [filters, setFilters] = useState({ keyword: "", location: "", category: "" });

  // Store search filters
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");

  // Store loading state and selected job
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  // Navigate between pages
  const navigate = useNavigate();

  // Fetch available jobs from the backend
  const fetchJobs = async () => {
    setLoading(true);
    setJobsError("");
    setFilters({ keyword, location, category });

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
      setJobsError("External listings are temporarily unavailable. You can still browse direct postings.");
    } finally {
      setLoading(false);
    }
  };

  // Load jobs when the page opens
  useEffect(() => {
    fetchJobs();
    const controller = new AbortController();
    const loadPostings = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/job-postings/", { signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || "Unable to load direct postings.");
        setPostings(data);
      } catch (error) {
        if (error.name !== "AbortError") setPostingsError("Direct postings are temporarily unavailable. You can still browse external listings.");
      } finally {
        if (!controller.signal.aborted) setPostingsLoading(false);
      }
    };
    loadPostings();
    return () => controller.abort();
  }, []);

  // Direct postings use the same submitted filters as the external search.
  // Their API has no category field, so employment type is searchable here.
  const directJobs = postings.filter(posting =>
    `${posting.title} ${posting.company_name} ${posting.description}`.toLowerCase().includes(filters.keyword.trim().toLowerCase()) &&
    (posting.location || "").toLowerCase().includes(filters.location.trim().toLowerCase()) &&
    `${posting.employment_type} ${posting.title} ${posting.description}`.toLowerCase().includes(filters.category.trim().toLowerCase())
  ).map(posting => ({
    ...posting,
    direct: true,
    guid: posting.id,
    companyName: posting.company_name,
    employmentType: posting.employment_type,
    locationRestrictions: [posting.location],
    excerpt: posting.description,
  }));
  const visibleJobs = [...jobs, ...directJobs];

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
          {selectedJob.direct ? (
            <div className="direct-job-description">{selectedJob.description}</div>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: selectedJob.description }} />
          )}
          {selectedJob.deadline && <p><strong>Deadline:</strong> {parseApiDate(selectedJob.deadline)?.toLocaleString()}</p>}

          <div className="job-detail-actions">
            {/* Navigate to internal Job Application page */}
            <button
              type="button"
              className="apply-button"
              onClick={() =>
                navigate("/apply", {
                  state: {
                    job: {
                      id: selectedJob.direct ? selectedJob.id : String(selectedJob.guid),
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
            {/* US-17: only CareerConnect recruiter postings can be shared */}
            {selectedJob.direct && <ShareJobButton posting={selectedJob} />}
          </div>

        </div>
      </div>
    );
  }

  // Display job search page
  return (
    <div className="job-search-page">
      <div className="job-search-container">

        <div className="job-search-header">
          <p className="eyebrow">YOUR NEXT CHAPTER</p>
          <h1>Find Your Next Opportunity</h1>

          <p>
            Direct connections. More possibilities. Find your next role in one place.
          </p>
        </div>

        {/* Job search form */}
        <form
          className="search-form"
          onSubmit={handleSearch}
        >
          <input
            aria-label="Job title or keyword"
            type="text"
            placeholder="Job title or keyword"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />

          <input
            aria-label="Location"
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <input
            aria-label="Category"
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
        {postingsLoading && <p role="status">Loading direct postings...</p>}
        {jobsError && <p role="alert">{jobsError}</p>}
        {postingsError && <p role="alert">{postingsError}</p>}

        {/* Number of search results */}
        {!loading && !postingsLoading && (
          <p className="results-count">
            {visibleJobs.length}{" "}
            {visibleJobs.length === 1 ? "job" : "jobs"} found
          </p>
        )}

        {/* Display available jobs */}
        <div className="job-list">
          {visibleJobs.map((job) => (
              <div
                className="job-card"
                key={`${job.direct ? "direct" : "external"}-${job.guid}`}
              >
                <span className={`job-source ${job.direct ? "job-source-direct" : ""}`}>{job.direct ? "CareerConnect / Direct posting" : "Himalayas / External listing"}</span>
                <h2>{job.title}</h2>

                <p className="job-company">
                  {job.companyName}
                </p>

                <p className="job-location">
                  {formatLocation(job)}
                </p>
                {job.employmentType && <p className="job-location">{job.employmentType}</p>}
                {job.deadline && <p className="job-location">Deadline: {parseApiDate(job.deadline)?.toLocaleString()}</p>}

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
          {!loading && !postingsLoading && !jobsError && !postingsError && visibleJobs.length === 0 && (
          <p>
            No jobs found. Try changing your search.
          </p>
        )}

      </div>
    </div>
  );
}

export default JobSearch;
