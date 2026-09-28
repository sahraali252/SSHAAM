# Meeting Minutes – Meeting 03

## Meeting Information

**Project:** CareerConnect  
**Date:** 2026-09-24  
**Time:** 6:30 PM - 8:10 PM

---

## Team Members

| First Name | Last Name | Student ID | Attendance |
|------------|-----------|------------|------------|
| Saara | Noori | 40224277 | Present |
| Sahra | Ali | 40328476 | Present |
| Hiba | Tyridini | 40348854 | Present |
| Aya | Lakhoitri | 40330319 | Present |
| Amine | Ait Yakoub | 40315369 | Present |
| Melissa | Luk | 40089387 | Present |

---

## Topics Discussed

1. Detailed Sprint 1 task assignment
2. Backend implementation planning
3. Frontend and backend responsibilities
4. GitHub organization and documentation
5. Sprint 1 demo features
6. Supabase and database setup
7. AI log responsibilities

---

## Decisions Made

- The team created a more detailed Sprint 1 work breakdown for all 6 members.
- Each member was assigned a main coding responsibility and an administrative/documentation responsibility.
- The work breakdown was created as an initial implementation plan and could be adjusted as development progressed.
- FastAPI was selected for the backend.
- Supabase PostgreSQL was selected for the database.
- Supabase Storage was planned for resume PDF uploads.
- The two Sprint 1 demo features were planned as:
  - User Registration/Login
  - Resume Upload
- Each member remained responsible for maintaining their own AI usage log.
- The team agreed to use separate branches and pull requests for development work.

---

## Member Work Breakdown

### Member 1 – Backend Foundation & FastAPI Core

**Administrative Tasks:**
- Create the `backend/` directory structure.
- Write local backend setup instructions in `README.md`.
- Review incoming pull requests before merging into `main`.

**Coding Tasks:**
- Create `backend/requirements.txt`.
- Add required dependencies:
  - FastAPI
  - Uvicorn
  - SQLAlchemy
  - psycopg2-binary
  - Supabase
  - python-dotenv
  - pydantic[email]
- Initialize `backend/app/main.py`.
- Configure FastAPI.
- Configure CORS.

---

### Member 2 – Supabase & Database Session Management

**Administrative Tasks:**
- Provision the Supabase project.
- Create the `resumes` storage bucket.
- Create the `.env.example` file structure.

**Coding Tasks:**
- Implement `backend/app/database.py`.
- Connect SQLAlchemy to Supabase PostgreSQL.
- Configure database sessions.
- Create the `get_db` session generator.

---

### Member 3 – Database Models & Schema Design

**Administrative Tasks:**
- Write the `Team-Generated User Stories and Features` section in `README.md`.

**Coding Tasks:**
- Create `backend/app/models.py`.
- Define the `User` model with:
  - id
  - email
  - password
  - full_name
  - role
  - created_at

---

### Member 4 – Data Validation & Submission Formatting

**Administrative Tasks:**
- Format the official Sprint 1 cover page.
- Verify that the GitHub repository URL is included in the Sprint 1 submission document.

**Coding Tasks:**
- Create `backend/app/schemas.py`.
- Create:
  - `UserCreate`
  - `UserResponse`
- Add request and response validation.

---

### Member 5 – Authentication API Implementation

**Administrative Tasks:**
- Build the Appendix A Sprint 1 Work Plan table.
- Include:
  - Issue number
  - Task
  - Responsible member
  - Priority
  - Status

**Coding Tasks:**
- Create `backend/app/routers/auth_router.py`.
- Implement:
  - `POST /auth/register`
  - `POST /auth/login`
- Connect authentication endpoints to the database.
- Check for duplicate email registration.
- Validate login credentials.

---

### Member 6 – Resume Upload & Supabase Storage API

**Administrative Tasks:**
- Audit the `AI_Log/` folder.
- Verify that all 6 members have their own AI log.
- Verify that required AI log fields are included.

**Coding Tasks:**
- Create `backend/app/routers/resume_router.py`.
- Implement:
  - `POST /resumes/upload`
- Accept PDF resume uploads.
- Validate file type.
- Upload resumes to the Supabase `resumes` storage bucket.
- Generate/store resume file information.

---

## Action Items

| Action Item | Responsible Team Member | Deadline | Status |
|-------------|-------------------------|----------|--------|
| Backend foundation and FastAPI setup | Member 1 | 2026-09-27 | Assigned |
| Supabase project and database connection | Member 2 | 2026-09-27 | Assigned |
| User database model and team-generated stories section | Member 3 | 2026-09-27 | Assigned |
| Pydantic schemas and Sprint 1 submission formatting | Member 4 | 2026-09-27 | Assigned |
| Registration/Login API and Appendix A work plan | Member 5 | 2026-09-27 | Assigned |
| Resume Upload API and AI log audit | Member 6 | 2026-09-27 | Assigned |

---

## Notes

- This work breakdown represented the team’s initial implementation plan for Sprint 1.
- Some responsibilities were later adjusted, shared, or completed by different members as development progressed.
- The team used this breakdown as a guide rather than a fixed final distribution of work.
- Members were expected to communicate if a task needed to be reassigned.
- Backend components needed to be integrated before the Sprint 1 demo.
- Registration/Login and Resume Upload needed to be tested before the final Sprint 1 submission.
- Each member remained responsible for completing their own AI usage log.

---

## Next Meeting

**Date:** 2026-10-01  
**Time:** 6:30 PM  

**Planned Topics:**

- Present Sprint 1 progress to the TA
- Demonstrate the completed Sprint 1 features
- Show the GitHub repository and project organization
- Review completed user stories and assigned tasks
- Show meeting minutes and Sprint 1 documentation
- Show individual AI usage logs
- Demonstrate Registration/Login
- Demonstrate Resume Upload
- Answer TA questions about implementation and team contributions
