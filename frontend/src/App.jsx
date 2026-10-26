// Import React Router components for navigation
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Import authentication pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Import Dashboard and Profile pages
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";

// Import Resume Management page
import ResumeUpload from "./pages/ResumeUpload";

// Import Job Search page
import JobSearch from "./pages/JobSearch";

// Import Sprint 2 Job Application pages
import JobApplication from "./pages/JobApplication";
import ApplicationTracking from "./pages/ApplicationTracking";

function App() {
  // BrowserRouter enables navigation without refreshing the page
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect the home page to Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Authentication pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard and Profile */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />

        {/* Resume Management */}
        <Route path="/resume-upload" element={<ResumeUpload />} />

        {/* Job Search */}
        <Route path="/jobs" element={<JobSearch />} />

        {/* Sprint 2: Job Application Submission and Tracking */}
        <Route path="/apply" element={<JobApplication />} />
        <Route path="/applications" element={<ApplicationTracking />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;