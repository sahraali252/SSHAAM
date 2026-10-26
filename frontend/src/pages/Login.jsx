import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

function Login() {
  // Store the email and password entered by the user
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Store success or error messages
  const [message, setMessage] = useState("");

  // Navigate to another page after successful login
  const navigate = useNavigate();

  // Handle login form submission
  const handleSubmit = async (e) => {
    // Prevent the browser from refreshing the page
    e.preventDefault();

    // Clear previous messages
    setMessage("");

    // Validate required fields
    if (!email || !password) {
      setMessage("Please enter your email and password.");
      return;
    }

    try {
      // Send login credentials to the backend API
      const response = await fetch(
        "http://localhost:8000/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      // Convert the backend response to JSON
      const data = await response.json();

      if (response.ok) {
        // Save the JWT token for authenticated API requests
        if (data.access_token) {
          localStorage.setItem("access_token", data.access_token);
        }

        // Save user information if returned by the backend
        if (data.user_id != null) {
          localStorage.setItem("user_id", String(data.user_id));
        }

        if (data.email) {
          localStorage.setItem("user_email", data.email);
        }

        // Redirect the user to the dashboard
        navigate("/dashboard");
      } else {
        // Display the error returned by the backend
        setMessage(data.detail || "Invalid email or password.");
      }
    } catch (error) {
      // Handle network or server connection errors
      console.error("Login error:", error);
      setMessage("Unable to connect to the server.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>CareerConnect</h1>
        <h2>Welcome Back</h2>

        {/* Login form */}
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

        {/* Display login errors */}
        {message && <p className="message">{message}</p>}

        {/* Registration link */}
        <p className="switch-page">
          Don't have an account?{" "}
          <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;