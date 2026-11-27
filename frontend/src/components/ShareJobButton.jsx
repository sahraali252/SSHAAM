import { useEffect, useRef, useState } from "react";
import { getEmailHref, getLinkedInHref, getShareUrl } from "../utils/shareJob";
import "./ShareJobButton.css";

const COPY_MESSAGE_MS = 2000;

// US-17: share a job by copying its link, by email or on LinkedIn.
// Recruiter postings use their /jobs?posting=<id> link; pass `url` to share a
// ready-made link instead (e.g. an external Himalayas job page).
export default function ShareJobButton({ posting, url: shareUrl }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("");
  const wrapperRef = useRef(null);
  const triggerRef = useRef(null);
  const timerRef = useRef(null);
  const url = shareUrl || getShareUrl(posting);

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
