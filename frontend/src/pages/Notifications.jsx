import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Notifications.css";

const STORAGE_KEY = "careerconnect_demo_notifications";

const sampleNotifications = [
  {
    id: 1,
    type: "status",
    title: "Application Status Updated",
    message: "Your application status has changed to Interview.",
    date: "2026-11-09",
    read: false,
  },
  {
    id: 2,
    type: "interview",
    title: "Interview Invitation",
    message: "You have received an interview invitation.",
    date: "2026-11-08",
    read: false,
  },
  {
    id: 3,
    type: "deadline",
    title: "Upcoming Deadline",
    message: "An application deadline is approaching.",
    date: "2026-11-07",
    read: true,
  },
  {
    id: 4,
    type: "application",
    title: "New Application Received",
    message: "A candidate has applied to your job posting.",
    date: "2026-11-06",
    read: true,
  },
];

function loadNotifications() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Unable to load notifications:", error);
  }

  return sampleNotifications;
}

function Notifications() {
  const [notifications, setNotifications] = useState(loadNotifications);
  const [filter, setFilter] = useState("all");

  // Save notification changes to localStorage
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(notifications)
    );

    // Inform other components about the update
    window.dispatchEvent(new Event("notificationsUpdated"));
  }, [notifications]);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") {
      return !notification.read;
    }

    return true;
  });

  const markAsRead = (id) => {
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  return (
    <div className="notifications-page">
      <div className="notifications-container">
        <div className="notifications-header">
          <div>
            <h1>Notifications & Reminders</h1>
            <p>Stay updated on your job applications and activities.</p>
          </div>

          <Link to="/dashboard" className="notifications-back-button">
            Back to Dashboard
          </Link>
        </div>

        <div className="notifications-toolbar">
          <div className="notifications-tabs">
            <button
              type="button"
              className={filter === "all" ? "active" : ""}
              onClick={() => setFilter("all")}
            >
              All ({notifications.length})
            </button>

            <button
              type="button"
              className={filter === "unread" ? "active" : ""}
              onClick={() => setFilter("unread")}
            >
              Unread ({unreadCount})
            </button>
          </div>

          <button
            type="button"
            className="mark-all-button"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            Mark All as Read
          </button>
        </div>

        <div className="notifications-list">
          {filteredNotifications.length === 0 ? (
            <div className="notifications-empty">
              <h2>No notifications</h2>
              <p>You are all caught up!</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-card ${
                  notification.read ? "read" : "unread"
                }`}
              >
                <div className="notification-content">
                  <div className="notification-title-row">
                    <h3>{notification.title}</h3>

                    {!notification.read && (
                      <span className="notification-unread-dot" />
                    )}
                  </div>

                  <p>{notification.message}</p>

                  <span className="notification-date">
                    {notification.date}
                  </span>
                </div>

                {!notification.read && (
                  <button
                    type="button"
                    className="mark-read-button"
                    onClick={() => markAsRead(notification.id)}
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Notifications;