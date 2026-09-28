# Sprint 1 AI Usage Log — Hiba Tydrini

## 1. AI Tools Used

| AI Tool | Purpose | Date |
|---|---|---|
| ChatGPT | Understand my assigned backend authentication tasks and divide the implementation into smaller steps | September 26, 2026 |

## 2. Prompts Used

### Prompt 1

**AI Tool:** ChatGPT
**Date:** September 26, 2026

**Prompt:**
Explain my assigned backend tasks and divide them into smaller steps so I can understand exactly what I need to implement.


## 3. Generated Outputs

### Output 1

**Related Prompt:** Prompt 1

**Summary of AI-generated output:**
Explained the purpose of schemas.py and auth_router.py.
Broke the work into two main tasks: user schemas and authentication routes.
Explained what UserCreate and UserResponse should contain.
Explained the steps needed to implement user registration/login.
Explained how the authentication code connects to the existing database and FastAPI application.

## 4. Validation Activities

Describe how the AI-generated output was checked.

- [x] Reviewed the generated output
- [x] Compared against project requirements
- [ ] Tested generated code/content, if applicable
- [x] Checked for errors
- [x] Verified information where necessary
- [x] Reviewed with a team member

**Validation notes:**
Compared the suggested implementation with the assigned authentication tasks.
Checked the existing User model to make sure the schema fields matched the database fields.
Checked database.py to understand how the database session is accessed.
Checked main.py to confirm that the authentication router was already connected to the FastAPI application.
Reviewed the code before committing it to the feature/auth-backend branch.
The implementation was pushed to the branch for testing with the team's database setup.


## 5. Final Decisions

| AI Suggestion/Output | Decision | Reason |
|---|---|---|
| Divide the work into schemas and authentication routes | Used | Matched the two backend tasks that were assigned to me. |
| Create UserCreate and UserResponse schemas | Modified | Adapted them to match the existing User model and added basic validation. |
| Add validation for email, password, and full name | Used | Added basic validation to the registration data. |
| Implement the /auth/register endpoint | Modified | Adapted the suggested steps to the project's existing database structure. |
| Check for an existing email during registration | Used | Prevents duplicate accounts using the same email. |
| Implement the /auth/login endpoint | Modified | Adapted the login logic to the existing User model and database session. |
| Return an error for incorrect login credentials | Used | Allows invalid login attempts to be handled properly. |
| Check the existing backend files before implementation | Used | Helped make sure the new code worked with the existing project structure. |

