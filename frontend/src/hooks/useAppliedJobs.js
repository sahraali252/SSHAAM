import { useEffect, useState } from "react";
import { normalizeJobId } from "../utils/applications";

const API_URL = "http://127.0.0.1:8000";

// Loads the logged-in user's applications once and returns a Map of
// normalized job id -> application status, so Apply buttons can be replaced
// by "Already applied". Fails quietly (empty map): the apply page and the
// backend still block duplicates.
export default function useAppliedJobs() {
  const [appliedJobs, setAppliedJobs] = useState(() => new Map());

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return undefined;

    const controller = new AbortController();

    fetch(`${API_URL}/applications/my-applications`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : []))
      .then((applications) => {
        if (!Array.isArray(applications)) return;
        setAppliedJobs(new Map(
          applications.map((application) => [normalizeJobId(application.job_id), application.status])
        ));
      })
      .catch(() => {});

    return () => controller.abort();
  }, []);

  return appliedJobs;
}
