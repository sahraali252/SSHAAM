const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const AI_UNAVAILABLE_MESSAGE = "AI service is unavailable, try again later.";

async function post(path, signal) {
  const token = localStorage.getItem("access_token");
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      signal,
      headers: { Authorization: `Bearer ${token}` },
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
