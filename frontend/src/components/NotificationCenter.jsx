import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getNotifications, getUnreadCount, markNotificationRead, updateNotifiedApplication } from "../services/notifications";
import { parseApiDate } from "../utils/dates";
import "./NotificationCenter.css";

const titles = {
  application_status: "Application update",
  interview_invitation: "Interview invitation",
  deadline_reminder: "Deadline approaching",
  new_application: "New application",
};

function ApplicationActions({ token, applicationId }) {
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setResult("");
    setError("");
    try {
      await updateNotifiedApplication(token, applicationId, status, message);
      setResult(status === "Interview" ? "Interview invitation sent." : `Application updated to ${status}.`);
    } catch (error) {
      setError(error.message || "Unable to update the application.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="cc-notification-actions" onSubmit={submit}>
      <label>
        Change application status
        <select value={status} onChange={(event) => setStatus(event.target.value)} required disabled={saving}>
          <option value="">Choose a status</option>
          {["Under Review", "Interview", "Offered", "Rejected"].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label>
      {status === "Interview" && (
        <label>
          Invitation message (optional)
          <textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength={2000} rows={3}
            placeholder="Include the interview time and meeting details." disabled={saving} />
        </label>
      )}
      <button type="submit" disabled={saving || !status}>
        {saving ? "Sending..." : status === "Interview" ? "Send interview invitation" : "Update application"}
      </button>
      {result && <p role="status">{result}</p>}
      {error && <p role="alert">{error}</p>}
    </form>
  );
}

export default function NotificationCenter() {
  const token = localStorage.getItem("access_token");
  const role = localStorage.getItem("user_role");
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(null);
  const [items, setItems] = useState([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expired, setExpired] = useState(false);
  const [marking, setMarking] = useState(null);
  const [revision, setRevision] = useState(0);
  const dialog = useRef(null);
  const trigger = useRef(null);
  const headingId = useId();

  useEffect(() => {
    if (!token || expired) return;
    let active = true;
    let controller;
    async function refresh() {
      controller?.abort();
      controller = new AbortController();
      const signal = controller.signal;
      if (open) setLoading(true);
      try {
        const [total, notifications] = await Promise.all([
          getUnreadCount(token, signal),
          open ? getNotifications(token, unreadOnly, limit, signal) : Promise.resolve(null),
        ]);
        if (!active || signal.aborted) return;
        setCount(total.unread_count);
        if (notifications) setItems(notifications);
        setError("");
      } catch (error) {
        if (!active || signal.aborted) return;
        setError(error.message || "Unable to load notifications. Please try again.");
        if (error.status === 401 || error.status === 403) setExpired(true);
      } finally {
        if (active && !signal.aborted) setLoading(false);
      }
    }
    refresh();
    const timer = window.setInterval(refresh, 30000);
    window.addEventListener("focus", refresh);
    return () => {
      active = false;
      controller?.abort();
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [token, open, unreadOnly, limit, revision, expired]);

  useEffect(() => {
    const panel = dialog.current;
    if (!panel) return;
    if (open && !panel.open) panel.showModal();
    if (!open && panel.open) {
      panel.close();
      trigger.current?.focus();
    }
  }, [open]);

  async function markRead(id) {
    setMarking(id);
    setError("");
    try {
      await markNotificationRead(token, id);
      setRevision((value) => value + 1);
    } catch (error) {
      setError(error.message || "Unable to mark the notification as read.");
      if (error.status === 401 || error.status === 403) setExpired(true);
    } finally {
      setMarking(null);
    }
  }

  if (!token) return null;

  return (
    <div className="cc-notifications">
      <button className="cc-notification-trigger" ref={trigger} onClick={() => setOpen(true)}
        aria-label={`Notifications${count === null ? "" : `, ${count} unread`}`}
        aria-haspopup="dialog" aria-expanded={open} title={error || "Notifications"}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z" />
          <path d="M10 21h4" />
        </svg>
        <span>Notifications</span>
        {count > 0 && <span className="cc-notification-badge" aria-hidden="true">{count > 99 ? "99+" : count}</span>}
        {error && <span aria-hidden="true">!</span>}
      </button>
      <dialog ref={dialog} className="cc-notification-dialog" aria-labelledby={headingId}
        onCancel={(event) => { event.preventDefault(); setOpen(false); }}
        onClick={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
        <div className="cc-notification-panel">
          <header className="cc-notification-heading">
            <div><h2 id={headingId}>Notifications</h2><p>{count === null ? "Your latest updates" : `${count} unread`}</p></div>
            <button onClick={() => setOpen(false)} aria-label="Close notifications">✕</button>
          </header>
          <div className="cc-notification-toolbar">
            <label><input type="checkbox" checked={unreadOnly} onChange={(event) => {
              setUnreadOnly(event.target.checked); setLimit(20); setItems([]);
            }} /> Unread only</label>
            <button disabled={loading} onClick={() => { setExpired(false); setRevision((value) => value + 1); }}>Refresh</button>
          </div>
          <div className="cc-notification-list" aria-busy={loading}>
            {error && <p className="cc-notification-error" role="alert">{error}{expired && <> <Link to="/login">Log in</Link></>}</p>}
            {loading && <p role="status">Loading notifications...</p>}
            {!loading && !error && items.length === 0 && <p className="cc-notification-empty">{unreadOnly ? "You're all caught up. No unread notifications." : "No notifications yet. Your updates will appear here."}</p>}
            {items.map((item) => {
              const created = parseApiDate(item.created_at);
              return (
                <article key={item.id} className={`cc-notification-item${item.is_read ? "" : " cc-notification-unread"}`}>
                  <div className="cc-notification-item-heading"><h3>{titles[item.kind] || "Update"}</h3>{!item.is_read && <span className="cc-unread-dot" aria-label="Unread" />}</div>
                  <p>{item.message}</p>
                  {created && <time dateTime={created.toISOString()}>{created.toLocaleString()}</time>}
                  {!item.is_read && <button className="cc-mark-read" disabled={marking !== null} onClick={() => markRead(item.id)}>{marking === item.id ? "Saving..." : "Mark as read"}</button>}
                  {role === "recruiter" && item.kind === "new_application" && item.application_id && (
                    <ApplicationActions token={token} applicationId={item.application_id} />
                  )}
                </article>
              );
            })}
            {items.length === limit && limit < 100 && <button className="cc-load-more" disabled={loading} onClick={() => setLimit((value) => value + 20)}>Load more</button>}
            {items.length === 100 && <p>Showing your 100 most recent notifications. Use Unread only to find unread updates.</p>}
          </div>
          <footer className="cc-notification-footer">Updates refresh automatically every 30 seconds.</footer>
        </div>
      </dialog>
    </div>
  );
}
