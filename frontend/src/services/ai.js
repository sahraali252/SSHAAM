const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const AI_UNAVAILABLE_MESSAGE = "AI service is unavailable, try again later.";

async function post(path, signal, body) {
  const token = localStorage.getItem("access_token");
  const headers = { Authorization: `Bearer ${token}` };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      signal,
      headers,
      ...(body !== undefined && { body: JSON.stringify(body) }),
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error("Unable to connect to the server.");
  }

  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    throw new Error("Your session has expired. Please log in again.");
  }
  if (!response.ok) {
    throw new Error(typeof data.detail === "string" ? data.detail : AI_UNAVAILABLE_MESSAGE);
  }

  return data;
}

export function getResumeFeedback(signal) {
  return post("/ai/resume-feedback", signal);
}

export function getJobMatches(signal) {
  return post("/ai/job-matches", signal);
}

// US-18: job details are only used by the backend for external (Himalayas) jobs;
// recruiter postings are loaded from the database.
export function getMockInterview(applicationId, jobDetails, signal) {
  return post(`/ai/mock-interview/${encodeURIComponent(applicationId)}`, signal, {
    title: jobDetails?.title || "",
    company: jobDetails?.company || "",
    description: jobDetails?.description || "",
  });
}
