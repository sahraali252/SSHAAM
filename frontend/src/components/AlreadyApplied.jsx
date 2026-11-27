import "./AlreadyApplied.css";

// Shown instead of an Apply button when the user already applied to the job.
export default function AlreadyApplied({ status }) {
  return (
    <span className="already-applied">
      ✓ Already applied{status ? ` · ${status}` : ""}
    </span>
  );
}
