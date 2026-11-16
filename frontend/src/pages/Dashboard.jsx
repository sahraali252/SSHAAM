import { Navigate } from "react-router-dom";

// Preserve old bookmarks and return links with one job-seeker home.
export default function Dashboard() {
  return <Navigate to="/jobs" replace />;
}
