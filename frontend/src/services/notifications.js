const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function request(path, token, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status === 401 || response.status === 403) {
    const error = new Error("Your session has expired. Please log in again.");
    error.status = response.status;
    throw error;
  }
  if (!response.ok) {
    throw new Error("Unable to update notifications. Please try again.");
  }
  return response.json();
}

export function getUnreadCount(token, signal) {
  return request("/notifications/unread-count", token, { signal });
}

export function getNotifications(token, unreadOnly, limit, signal) {
  return request(`/notifications/?unread_only=${unreadOnly}&limit=${limit}`, token, { signal });
}

export function markNotificationRead(token, id) {
  return request(`/notifications/${id}/read`, token, { method: "PATCH" });
}

export function updateNotifiedApplication(token, id, status, message) {
  if (status === "Interview") {
    return request(`/recruiter/applications/${id}/interview`, token, {
      method: "POST",
      body: JSON.stringify({ message: message.trim() || "You have been invited to an interview." }),
    });
  }
  return request(`/recruiter/applications/${id}/status`, token, {
    method: "PATCH", body: JSON.stringify({ status }),
  });
}
