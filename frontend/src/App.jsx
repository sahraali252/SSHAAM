// Import React Router components used for navigation between pages
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Import the different pages of the application
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResumeUpload from "./pages/ResumeUpload";
import JobApplication from "./pages/JobApplication";
import ApplicationTracking from "./pages/ApplicationTracking";

function App() {
  // BrowserRouter enables navigation without refreshing the whole page
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect the home page to Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Authentication pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Resume management page */}
        <Route path="/resume-upload" element={<ResumeUpload />} />

        {/* Sprint 2: job application submission and tracking */}
        <Route path="/apply" element={<JobApplication />} />
        <Route path="/applications" element={<ApplicationTracking />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;