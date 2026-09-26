# CareerConnect

## Project Description

CareerConnect is a web-based platform designed to help job seekers manage their job search activities in one centralized location. The platform allows users to create profiles, manage resumes, search for job opportunities, submit applications, and track the progress of their applications.

## Identified Problem

Job seekers often use multiple platforms and tools to manage resumes, job applications, deadlines, and application statuses. This can make the job search process difficult to organize and track.

## Proposed Solution

CareerConnect provides a centralized platform where job seekers can organize and manage their job search activities. Users can manage their profiles and resumes, search for job opportunities, submit applications, and monitor the status of their applications.

## Team Members

| Name | Student ID |
|------|------------|
| Sara Noori | 40224277 |
| Sahra Ali | 40328476 |
| Hiba Tydrini | 40348854 |
| Aya Lakhoitri | 40330319 |
| Amine Ait Yakoub | TBD |
| Melissa Luk | 40089387 |

## Technologies

### Frontend
- React
- JavaScript
- HTML
- CSS

### Backend
- Python
- FastAPI
- SQLAlchemy
- Pydantic

### Database and Storage
- PostgreSQL
- Supabase
- Supabase Storage

### Development Tools
- Git
- GitHub

## Team-Generated User Stories and Features

### Features

- User registration and authentication
- User profile management
- Resume upload and management
- Job posting management for recruiters
- Job search and filtering
- Job application submission
- Application status tracking
- Application history dashboard
- Notifications and reminders for application deadlines
- Saved jobs and favourites
- Generative AI feature
- Additional original team feature

### User Stories

- **US-01 — User Registration:** As a job seeker, I want to create an account so that I can access CareerConnect platform features.
- **US-02 — User Login:** As a registered user, I want to log in securely so that I can access my CareerConnect account.
- **US-03 — Manage User Profile:** As a job seeker, I want to create and update my profile so that I can maintain accurate career information.
- **US-04 — Upload Resume:** As a job seeker, I want to upload my resume so that I can manage my application materials on CareerConnect.
- **US-05 — Manage Resume:** As a job seeker, I want to manage my uploaded resume so that I can keep my application materials up to date.
- **US-06 — Search for Jobs:** As a job seeker, I want to search for job opportunities so that I can find positions relevant to my career goals.
- **US-07 — Filter Job Search Results:** As a job seeker, I want to filter job search results so that I can narrow down opportunities that match my preferences.
- **US-08 — View Job Details:** As a job seeker, I want to view detailed information about a job so that I can decide whether to apply.
- **US-09 — Submit Job Application:** As a job seeker, I want to submit a job application so that I can apply for opportunities through CareerConnect.
- **US-10 — Track Application Status:** As a job seeker, I want to track my application status so that I can monitor the progress of my job applications.
- **US-11 — View Application History:** As a job seeker, I want to view my application history so that I can keep track of jobs I have applied for.
- **US-12 — Receive Application Notifications:** As a job seeker, I want to receive notifications about my applications so that I can stay informed about important updates.
- **US-13 — Save Favorite Jobs:** As a job seeker, I want to save jobs as favourites so that I can easily return to opportunities I am interested in.
- **US-14 — Create Job Posting:** As a recruiter, I want to create a job posting so that I can advertise an available position to job seekers.
- **US-15 — AI-Assisted Resume Feedback:** As a job seeker, I want to receive AI-assisted feedback on my resume so that I can identify areas for improvement.

## Local Setup

1. Clone the repository and open the backend folder:

   ```bash
   git clone https://github.com/sahraali252/SSHAAM.git
   cd SSHAAM/backend
   ```

2. Create a Python virtual environment:

   ```bash
   python3 -m venv venv
   ```

3. Activate the virtual environment:

   ```bash
   source venv/bin/activate
   ```

4. Install the required backend packages:

   ```bash
   pip install -r requirements.txt
   ```

5. Create your local environment file:

   ```bash
   cp .env.example .env
   ```

   Ask the team for the required `DATABASE_URL`, `SUPABASE_URL`, and `SUPABASE_KEY` values, then add them to `.env`. Never upload the `.env` file to GitHub.

6. Start the backend server:

   ```bash
   uvicorn app.main:app --reload
   ```

7. Open the API documentation in your browser:

   ```text
   http://127.0.0.1:8000/docs
   ```