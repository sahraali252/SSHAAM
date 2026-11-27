import { useEffect, useRef, useState } from "react";
import "./ShareJobButton.css";

const COPY_MESSAGE_MS = 2000;

// The job seeker jobs page opens this posting directly (US-17).
export function getShareUrl(posting) {
  return `${window.location.origin}/jobs?posting=${encodeURIComponent(posting.id)}`;
}

export function getEmailHref(posting, url) {
  const subject = `Job opportunity: ${posting.title} at ${posting.company_name}`;
  const body = [
    "I found this job on CareerConnect and thought you might be interested:",
    "",
    `Title: ${posting.title}`,
    `Company: ${posting.company_name}`,
    `Location: ${posting.location}`,
    "",
    url,
  ].join("\n");
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function getLinkedInHref(url) {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
}

// US-17: share a recruiter posting by copying its link, by email or on LinkedIn
export default function ShareJobButton({ posting }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("");
  const wrapperRef = useRef(null);
  const triggerRef = useRef(null);
  const timerRef = useRef(null);
  const url = getShareUrl(posting);

  // Close on outside click or Escape while the menu is open.
  useEffect(() => {
    if (!open) return undefined;

    const handleClick = (event) => {
      if (!wrapperRef.current?.contains(event.target)) setOpen(false);
    };
    const handleKey = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const showStatus = (text) => {
    setStatus(text);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setStatus(""), COPY_MESSAGE_MS);
  };

  const copyLink = async () => {
    setOpen(false);
    try {
      await navigator.clipboard.writeText(url);
      showStatus("Link copied!");
    } catch {
      showStatus("Could not copy the link.");
    }
  };

  return (
    <div className="share-job" ref={wrapperRef}>
      <button
        ref={triggerRef}
        className="secondary-button share-job-trigger"
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((isOpen) => !isOpen)}
      >
        Share
      </button>

      {open && (
        <div className="share-job-menu" role="menu" aria-label={`Share ${posting.title}`}>
          <button type="button" role="menuitem" onClick={copyLink}>
            Copy link
          </button>
          <a role="menuitem" href={getEmailHref(posting, url)} onClick={() => setOpen(false)}>
            Email
          </a>
          <a
            role="menuitem"
            href={getLinkedInHref(url)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
          >
            LinkedIn
          </a>
        </div>
      )}

      {status && (
        <span className="share-job-status" role="status">
          {status}
        </span>
      )}
    </div>
  );
}
