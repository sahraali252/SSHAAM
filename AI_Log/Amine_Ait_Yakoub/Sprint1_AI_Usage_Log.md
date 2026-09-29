# Sprint 1 AI Usage Log — Sahra Ali

## 1. AI Tools Used

| AI Tool | Purpose | Date |
|---|---|---|
| ChatGPT | Backend architecture and directory structure | September 19, 2026 |
| ChatGPT | Backend dependency setup | September 19, 2026 |
| ChatGPT | FastAPI application initialization | September 20, 2026 |
| ChatGPT | CORS configuration for frontend/backend communication | September 20, 2026 |
| ChatGPT | User database model design | September 21, 2026 |
| ChatGPT | Backend local setup documentation | September 21, 2026 |

## 2. Prompts Used

### Prompt 1

**AI Tool:** ChatGPT

**Date:** September 19, 2026

**Prompt:**

> We are building CareerConnect for our SOEN 341 project using FastAPI for the backend. How should I organize the backend directory structure for the main application, database, models, schemas, and routers?

### Prompt 2

**AI Tool:** ChatGPT

**Date:** September 19, 2026

**Prompt:**

> What dependencies should I include in backend/requirements.txt for a FastAPI project using Uvicorn, SQLAlchemy, PostgreSQL, Supabase, python-dotenv, and Pydantic email validation?

### Prompt 3

**AI Tool:** ChatGPT

**Date:** September 20, 2026

**Prompt:**

> How do I create the basic backend/app/main.py file for CareerConnect using FastAPI and make sure the application can run with Uvicorn?

### Prompt 4

**AI Tool:** ChatGPT

**Date:** September 20, 2026

**Prompt:**

> How do I configure CORS in FastAPI so that our React frontend running on localhost can send requests to the backend?

### Prompt 5

**AI Tool:** ChatGPT

**Date:** September 21, 2026

**Prompt:**

> Help me create a SQLAlchemy User model for CareerConnect. The model should contain id, email, password, full_name, role, and created_at.

### Prompt 6

**AI Tool:** ChatGPT

**Date:** September 21, 2026

**Prompt:**

> What local backend setup instructions should I add to the README so another team member can create a virtual environment, install requirements.txt, configure the .env file, and run the FastAPI server?

## 3. Generated Outputs

### Output 1

**Related Prompt:** Prompt 1

**Summary of AI-generated output:**

- Suggested creating a `backend/` directory with an `app/` package.
- Recommended separating backend responsibilities into `main.py`, `database.py`, `models.py`, `schemas.py`, and a `routers/` directory.
- Explained how this structure keeps the backend organized as the project grows.

### Output 2

**Related Prompt:** Prompt 2

**Summary of AI-generated output:**

- Suggested including FastAPI and Uvicorn for the API server.
- Suggested SQLAlchemy and `psycopg2-binary` for PostgreSQL access.
- Suggested the Supabase Python package for Supabase integration.
- Suggested `python-dotenv` for loading environment variables.
- Suggested `pydantic[email]` for request validation and email validation.

### Output 3

**Related Prompt:** Prompt 3

**Summary of AI-generated output:**

- Suggested importing and initializing the FastAPI application.
- Explained how `main.py` acts as the entry point for the backend.
- Suggested using Uvicorn to run the application locally.

### Output 4

**Related Prompt:** Prompt 4

**Summary of AI-generated output:**

- Suggested using FastAPI's `CORSMiddleware`.
- Explained that CORS is required because the React frontend and FastAPI backend run on different localhost ports.
- Suggested configuring allowed origins, methods, and headers for development.

### Output 5

**Related Prompt:** Prompt 5

**Summary of AI-generated output:**

- Suggested creating a SQLAlchemy `User` model.
- Suggested fields for `id`, `email`, `password`, `full_name`, `role`, and `created_at`.
- Suggested making the email unique.
- Suggested automatically generating the creation timestamp.

### Output 6

**Related Prompt:** Prompt 6

**Summary of AI-generated output:**

- Suggested documenting how to create and activate a Python virtual environment.
- Suggested including the command to install dependencies from `requirements.txt`.
- Recommended using a `.env.example` file instead of uploading real credentials.
- Suggested documenting how to start the backend using Uvicorn.
- Suggested including the Swagger `/docs` URL for testing.

## 4. Validation Activities

Describe how the AI-generated output was checked.

- [x] Reviewed the generated output
- [x] Compared against project requirements
- [x] Tested generated code/content, if applicable
- [x] Checked for errors
- [x] Verified information where necessary
- [x] Reviewed with a team member

**Validation notes:**

- Reviewed the suggested backend structure before applying it to the CareerConnect repository.
- Confirmed that the required backend files were created in the appropriate folders.
- Installed the dependencies from `requirements.txt` and confirmed that the installation completed.
- Ran the FastAPI application locally using Uvicorn.
- Verified that the FastAPI Swagger documentation loaded successfully at `/docs`.
- Confirmed that the CORS configuration allowed the React frontend and FastAPI backend to communicate during local testing.
- Reviewed the User model fields to ensure they matched the Sprint 1 account requirements.
- Checked the README setup instructions against the actual steps needed to run the backend locally.
- Confirmed that real environment credentials were kept outside the GitHub repository.

## 5. Final Decisions

| AI Suggestion/Output | Decision | Reason |
|---|---|---|
| Organize backend into `main.py`, `database.py`, `models.py`, `schemas.py`, and routers | Modified | The suggested architecture was adapted to the existing CareerConnect repository structure. |
| Include FastAPI and Uvicorn in `requirements.txt` | Used | These packages were required to create and run the API server. |
| Include SQLAlchemy and `psycopg2-binary` | Used | These packages were required for PostgreSQL database access. |
| Include Supabase and `python-dotenv` | Used | These were needed for Supabase integration and environment configuration. |
| Include `pydantic[email]` | Used | It provided request validation and email validation support. |
| Initialize the application with FastAPI in `main.py` | Used | This created the main backend application entry point. |
| Configure `CORSMiddleware` | Used | It allowed the frontend and backend to communicate during development. |
| Create a SQLAlchemy User model | Modified | The model was adapted to the CareerConnect fields and project database structure. |
| Add `id`, `email`, `password`, `full_name`, `role`, and `created_at` to the User model | Used | These fields matched the Sprint 1 user account requirements. |
| Add local backend setup instructions to the README | Modified | The suggested instructions were adjusted to match the team's actual setup process. |
| Use `.env.example` instead of committing `.env` | Used | This documented the required environment variables without exposing credentials. |
| Use Swagger `/docs` for backend verification | Used | This provided a simple way to confirm that the FastAPI application was running correctly. |
