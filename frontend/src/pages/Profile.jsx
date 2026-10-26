import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const emptyProfile = {
  headline: "",
  location: "",
  bio: "",
  skills: "",
  education: "",
  experience: "",
};

function Profile() {
  const [profile, setProfile] = useState(emptyProfile);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    loadProfile();
  }, [userId, navigate]);

  const loadProfile = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/profiles/${userId}`
      );

      if (response.status === 404) {
        return;
      }

      if (!response.ok) {
        throw new Error("Could not load profile.");
      }

      const data = await response.json();

      setProfile({
        headline: data.headline || "",
        location: data.location || "",
        bio: data.bio || "",
        skills: data.skills || "",
        education: data.education || "",
        experience: data.experience || "",
      });
    } catch (error) {
      setMessage("Unable to load your profile.");
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((currentProfile) => ({
      ...currentProfile,
      [name]: value,
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setMessage("");
    setSaving(true);

    try {
      const response = await fetch(
        `http://localhost:8000/profiles/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(profile),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Unable to save your profile.");
        return;
      }

      setProfile({
        headline: data.headline || "",
        location: data.location || "",
        bio: data.bio || "",
        skills: data.skills || "",
        education: data.education || "",
        experience: data.experience || "",
      });

      setMessage("Profile saved successfully.");
    } catch (error) {
      setMessage("Unable to connect to the server.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_email");
    navigate("/login");
  };

  return (
    <main className="profile-page">
      <section className="profile-card">
        <div className="profile-header">
          <div>

            <button
  className="back-button"
  type="button"
  onClick={() => navigate("/dashboard")}
>
  ← Back to dashboard
</button>


            <h1>CareerConnect</h1>
            <p>Build your professional profile</p>
          </div>

          <button
            className="secondary-button"
            type="button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        <form onSubmit={handleSave}>
          <label htmlFor="headline">Professional headline</label>
          <input
            id="headline"
            name="headline"
            placeholder="Example: Junior Software Developer"
            value={profile.headline}
            onChange={handleChange}
          />

          <label htmlFor="location">Location</label>
          <input
            id="location"
            name="location"
            placeholder="Example: Montreal, Quebec"
            value={profile.location}
            onChange={handleChange}
          />

          <label htmlFor="bio">Professional summary</label>
          <textarea
            id="bio"
            name="bio"
            placeholder="Write a short summary about yourself."
            value={profile.bio}
            onChange={handleChange}
          />

          <label htmlFor="skills">Skills</label>
          <textarea
            id="skills"
            name="skills"
            placeholder="Example: React, Python, SQL, Git"
            value={profile.skills}
            onChange={handleChange}
          />

          <label htmlFor="education">Education</label>
          <textarea
            id="education"
            name="education"
            placeholder="Example: BEng in Software Engineering, Concordia University"
            value={profile.education}
            onChange={handleChange}
          />

          <label htmlFor="experience">Work experience</label>
          <textarea
            id="experience"
            name="experience"
            placeholder="Add relevant jobs, internships, or projects."
            value={profile.experience}
            onChange={handleChange}
          />

          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>

        {message && <p className="profile-message">{message}</p>}
      </section>
    </main>
  );
}

export default Profile;