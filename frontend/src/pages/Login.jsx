import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

function Login() {
     // Store the values entered in the login form and any message shown to the user
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  // Used to move the user to another page after a successful login
  const navigate = useNavigate();
  // Runs when the Login form is submitted
  const handleSubmit = async (e) => {    // Prevent the browser from refreshing the page when the form is submitted
    e.preventDefault();
    setMessage("");
    // Basic validation: both email and password are required
    if (!email || !password) {
      setMessage("Please enter your email and password.");
      return;
    }

    try {      // Prepare the email and password as query parameters for the backend
      const params = new URLSearchParams({
        email,
        password,
      });      // Convert the backend response to JSON

      const response = await fetch(
        `http://localhost:8000/auth/login?${params.toString()}`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log("Logged in user:", data);

        // Save user information if returned by the backend
        if (data.user_id) {
          localStorage.setItem("user_id", data.user_id);
        }

        if (data.email) {
          localStorage.setItem("user_email", data.email);
        }

        // Go to resume upload page
        navigate("/resume-upload");
      } else {
        setMessage(data.detail || "Invalid email or password.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Unable to connect to the server.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>CareerConnect</h1>
        <h2>Welcome Back</h2>

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Login</button>
        </form>

        {message && <p className="message">{message}</p>}

        <p className="switch-page">
          Don't have an account?{" "}
          <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;