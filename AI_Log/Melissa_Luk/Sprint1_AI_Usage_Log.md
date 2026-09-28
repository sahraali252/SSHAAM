# Sprint 1 AI Usage Log — Sahra Ali

## 1. AI Tools Used

| AI Tool | Purpose | Date |
|---|---|---|
| ChatGPT | Backend architecture and project setup | September 19, 2026 |
| ChatGPT | Supabase/PostgreSQL database configuration | September 20, 2026 |
| ChatGPT | User schemas and database models | September 21, 2026 |
| ChatGPT | User registration implementation | September 22, 2026 |
| ChatGPT | User login implementation | September 23, 2026 |
| ChatGPT | Resume upload implementation | September 24, 2026 |
| ChatGPT | Backend debugging and API integration | September 25, 2026 |
| ChatGPT | Authentication review and backend testing | September 28, 2026 |

## 2. Prompts Used

### Prompt 1

**AI Tool:** ChatGPT

**Date:** September 19, 2026

**Prompt:**

> We are building CareerConnect for our SOEN 341 project. I am working on the backend using Python and FastAPI. How should I organize the backend structure for the database, models, schemas, routers, and main application?

### Prompt 2

**AI Tool:** ChatGPT

**Date:** September 20, 2026

**Prompt:**

> How can I connect our FastAPI backend to a PostgreSQL database hosted on Supabase using SQLAlchemy? I need help creating the database engine, session, and get_db dependency.

### Prompt 3

**AI Tool:** ChatGPT

**Date:** September 21, 2026

**Prompt:**

> Help me create the User model and Pydantic schemas for CareerConnect. A user should have an id, email, password, full name, role, and created_at date. I also want separate schemas for creating a user and returning user information.

### Prompt 4

**AI Tool:** ChatGPT

**Date:** September 22, 2026

**Prompt:**

> Help me create a FastAPI registration endpoint using SQLAlchemy. It should check whether the email already exists, return an error for duplicate emails, create the user in the database, and return the new user.

### Prompt 5

**AI Tool:** ChatGPT

**Date:** September 23, 2026

**Prompt:**

> How do I create a login endpoint in FastAPI that searches for the user by email, checks the password, returns an error for incorrect credentials, and returns user information when login is successful?

### Prompt 6

**AI Tool:** ChatGPT

**Date:** September 24, 2026

**Prompt:**

> How can I create a resume upload endpoint in FastAPI? I want the user to upload a PDF resume, validate that the file is a PDF, generate a unique filename, and store the resume using our backend and Supabase setup.

### Prompt 7

**AI Tool:** ChatGPT

**Date:** September 25, 2026

**Prompt:**

> Help me debug and organize my FastAPI backend. I need to make sure the authentication and resume routers are connected to the main application, all required packages are in requirements.txt, and the endpoints appear correctly in Swagger.

### Prompt 8

**AI Tool:** ChatGPT

**Date:** September 28, 2026

**Prompt:**

> Review my FastAPI registration and login implementation and tell me what should be improved. I currently check the database for duplicate emails and compare passwords during login. I also want to know what test cases I should use for registration, login, and resume upload.

## 3. Generated Outputs

### Output 1

**Related Prompt:** Prompt 1

**Summary of AI-generated output:**

- Suggested organizing the backend into separate files for database configuration, models, schemas, routers, and the main FastAPI application.
- Explained the role of each backend component.
- Suggested using FastAPI routers to organize different features.

### Output 2

**Related Prompt:** Prompt 2

**Summary of AI-generated output:**

- Suggested using SQLAlchemy to connect FastAPI to PostgreSQL/Supabase.
- Explained how to configure the database engine.
- Suggested creating a session factory.
- Suggested creating a `get_db` dependency for database access inside API routes.

### Output 3

**Related Prompt:** Prompt 3

**Summary of AI-generated output:**

- Suggested creating a SQLAlchemy `User` model.
- Suggested separate `UserCreate` and `UserResponse` Pydantic schemas.
- Recommended using `EmailStr` and field validation.
- Recommended excluding passwords from returned API responses.

### Output 4

**Related Prompt:** Prompt 4

**Summary of AI-generated output:**

- Suggested checking the database for an existing email before registration.
- Recommended returning HTTP 409 Conflict for duplicate accounts.
- Suggested creating the user object and using `db.add()`, `db.commit()`, and `db.refresh()` to store the new user.

### Output 5

**Related Prompt:** Prompt 5

**Summary of AI-generated output:**

- Suggested finding the user by email.
- Suggested checking the submitted password against the stored password.
- Recommended returning HTTP 401 Unauthorized when the credentials are incorrect.
- Suggested returning basic user information after a successful login.

### Output 6

**Related Prompt:** Prompt 6

**Summary of AI-generated output:**

- Suggested using FastAPI file upload functionality.
- Recommended validating that uploaded resumes are PDF files.
- Suggested generating a unique filename to avoid filename conflicts.
- Explained how uploaded files could be stored using the project storage configuration.

### Output 7

**Related Prompt:** Prompt 7

**Summary of AI-generated output:**

- Suggested separating authentication and resume functionality into different routers.
- Explained how to connect the routers to the main FastAPI application.
- Suggested checking that required dependencies were included in `requirements.txt`.
- Recommended using Swagger to verify that the API endpoints were available.

### Output 8

**Related Prompt:** Prompt 8

**Summary of AI-generated output:**

- Reviewed the current registration and login implementation.
- Identified plain-text password storage/comparison as a security weakness.
- Recommended password hashing as a future improvement.
- Suggested JWT authentication as a possible future improvement.
- Suggested test cases for registration, login, duplicate email handling, and resume upload.

## 4. Validation Activities

Describe how the AI-generated output was checked.

- [x] Reviewed the generated output
- [x] Compared against project requirements
- [x] Tested generated code/content, if applicable
- [x] Checked for errors
- [x] Verified information where necessary
- [x] Reviewed with a team member

**Validation notes:**

- Reviewed the AI-generated suggestions before using them in the backend.
- Compared the proposed backend functionality with the Sprint 1 requirements.
- Modified suggested code and structure to fit the existing CareerConnect repository.
- Ran the FastAPI backend locally.
- Used Swagger to verify that the API endpoints were available.
- Tested successful user registration.
- Tested duplicate email handling.
- Tested successful login.
- Tested unsuccessful login with incorrect credentials.
- Tested PDF resume upload.
- Verified that user information was stored in Supabase/PostgreSQL.
- Reviewed the backend changes through the team's GitHub pull request process.
- The current Sprint 1 login implementation used direct password comparison.
- Password hashing and JWT authentication were discussed as future improvements but were not implemented during the initial Sprint 1 backend work.

## 5. Final Decisions

| AI Suggestion/Output | Decision | Reason |
|---|---|---|
| Organize backend into database, models, schemas, routers, and main application | Modified | The suggested structure was useful but was adapted to the existing repository. |
| Use SQLAlchemy with Supabase/PostgreSQL | Used | It allowed the FastAPI backend to interact with the project database. |
| Use a `get_db` database dependency | Used | It provided database sessions to the FastAPI routes. |
| Create separate `UserCreate` and `UserResponse` schemas | Used | This improved request validation and prevented the password from being returned in API responses. |
| Check for duplicate emails during registration | Used | This prevents multiple accounts from being created with the same email. |
| Return HTTP 409 for duplicate registration | Used | This clearly communicates that the email is already associated with an account. |
| Implement login by looking up the user by email | Used | This allowed the backend to identify the account attempting to log in. |
| Compare the submitted password with the stored password | Used for initial Sprint 1 implementation | This was the basic implementation used for the initial login functionality. |
| Validate resume uploads as PDFs | Used | This matched the Sprint 1 resume upload functionality. |
| Generate unique filenames for uploaded resumes | Used | This reduces filename conflicts when storing uploaded files. |
| Organize authentication and resume functionality using routers | Used | This kept backend functionality separated and easier to maintain. |
| Use Swagger to test backend endpoints | Used | This helped verify registration, login, and resume upload functionality. |
| Password hashing | Not implemented yet | It was identified as an important security improvement for future work. |
| JWT authentication | Not implemented yet | It was identified as a possible future improvement for authenticated/protected routes. |
