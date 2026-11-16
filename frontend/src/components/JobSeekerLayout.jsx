import { Navigate, NavLink, Outlet, useNavigate } from "react-router-dom";
import NotificationCenter from "./NotificationCenter";

export default function JobSeekerLayout() {
  const navigate = useNavigate();
  if (!localStorage.getItem("access_token") || !localStorage.getItem("user_id")) {
    return <Navigate to="/login" replace />;
  }
  if (localStorage.getItem("user_role") === "recruiter") {
    return <Navigate to="/recruiter/dashboard" replace />;
  }
  const logout = () => {
    ["access_token", "user_id", "user_email", "user_role"].forEach(key => localStorage.removeItem(key));
    navigate("/login", { replace: true });
  };
  return <>
    <header className="seeker-header"><div className="seeker-header-inner">
      <NavLink className="seeker-brand" to="/jobs">CareerConnect</NavLink>
      <nav className="seeker-navigation" aria-label="Main navigation">
        <NavLink to="/jobs">Browse Jobs</NavLink>
        <NavLink to="/applications">Applications</NavLink>
        <NavLink to="/profile">Profile</NavLink>
        <NavLink to="/resume-upload">Resume</NavLink>
      </nav>
      <div className="seeker-actions"><NotificationCenter /><button className="logout-button" onClick={logout}>Log out</button></div>
    </div></header>
    <Outlet />
  </>;
}
