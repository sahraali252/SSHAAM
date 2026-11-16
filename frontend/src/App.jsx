
// Import React Router components for navigation
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Import recruiter pages
import RecruiterDashboard from "./pages/RecruiterDashboard";
import RecruiterApplications from "./pages/RecruiterApplications";

// Import authentication pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Import Dashboard and Profile pages
import Dashboard from "./pages/Dashboard";
import JobSeekerLayout from "./components/JobSeekerLayout";
import Profile from "./pages/Profile";

// Import Resume Management page
import ResumeUpload from "./pages/ResumeUpload";

// Import Job Search page
import JobSearch from "./pages/JobSearch";

// Import Sprint 2 Job Application pages
import JobApplication from "./pages/JobApplication";
import ApplicationTracking from "./pages/ApplicationTracking";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect the home page to Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Authentication pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard and Profile */}

        {/* Recruiter pages */}
        <Route
          path="/recruiter/dashboard"
          element={<RecruiterDashboard />}
        />
        <Route
          path="/recruiter/applications"
          element={<RecruiterApplications />}
        />

        {/* Resume Management */}

        {/* Job Search */}

        {/* Job Application Submission and Tracking */}
        <Route element={<JobSeekerLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/jobs" element={<JobSearch />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/resume-upload" element={<ResumeUpload />} />
          <Route path="/apply" element={<JobApplication />} />
          <Route path="/applications" element={<ApplicationTracking />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
