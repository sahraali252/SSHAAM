# Sprint 3 AI Usage Log — Sahra Ali

## 1. AI Tools Used

| AI Tool | Purpose | Date |
|---|---|---|
| ChatGPT | Sprint 3 Application Analytics and History Dashboard planning and requirements | November 7, 2026 |
| ChatGPT | Review of existing application tracking functionality and Sprint 3 feature integration | November 8, 2026 |
| ChatGPT / Codex | Application analytics logic, dashboard implementation, and testing strategy | November 9, 2026 |
| Codex | Application Analytics and History Dashboard implementation, frontend/backend tests, and repository review | November 10, 2026 |
| ChatGPT / Codex | Acceptance testing, CI verification, Git/GitHub workflow, and final Sprint 3 validation | November 12, 2026 |

## 2. Prompts Used

### Prompt 1

**AI Tool:** ChatGPT

**Date:** November 7, 2026

**Prompt:**

> We are working on Sprint 3 of CareerConnect. My assigned feature is the Application Analytics and History Dashboard. What exactly needs to be implemented for application history, application status breakdown, and application activity over time?

### Prompt 2

**AI Tool:** ChatGPT

**Date:** November 8, 2026

**Prompt:**

> We already have an Application Tracking page from Sprint 2. Can we reuse the existing application history instead of creating a completely separate feature? Help me understand what needs to be added for Sprint 3.

### Prompt 3

**AI Tool:** ChatGPT / Codex

**Date:** November 9, 2026

**Prompt:**

> Review the existing application tracking implementation and determine what is missing for Sprint 3 Application Analytics and History. I need total applications, status counts, and applications submitted over time while keeping the existing application tracking functionality.

### Prompt 4

**AI Tool:** Codex

**Date:** November 10, 2026

**Prompt:**

> Inspect the repository and implement the missing Application Analytics and History Dashboard functionality. Add appropriate frontend and backend tests. Preserve the existing application tracking workflow, do not modify unrelated features, run the tests, and do not commit or push anything automatically.

### Prompt 5

**AI Tool:** ChatGPT / Codex

**Date:** November 12, 2026

**Prompt:**

> Help me create and execute acceptance tests for all three Sprint 3 user stories: Recruiter Dashboard and Posting Management, Application Analytics and History Dashboard, and Notifications and Reminders. Also verify that backend and frontend CI are configured correctly, that Sprint 3 tests are included automatically, and that the latest test suites and production build pass.

## 3. Generated Outputs

### Output 1

**Related Prompt:** Prompt 1

**Summary of AI-generated output:**

- Broke the Application Analytics and History Dashboard into smaller requirements.
- Identified application history as an existing feature that could be extended.
- Identified total application count as one of the required dashboard metrics.
- Identified application status breakdown as a required metric.
- Identified applications submitted over time as a useful analytics metric.
- Helped connect the feature to Sprint 3 issue #81 and the team's Sprint 3 responsibilities.
- Helped distinguish Feature 2 development responsibilities from Group 2 Quality Assurance responsibilities.

### Output 2

**Related Prompt:** Prompt 2

**Summary of AI-generated output:**

- Reviewed the existing Application Tracking page structure.
- Suggested keeping the existing application history rather than creating duplicate functionality.
- Suggested adding analytics above the existing application history.
- Identified the existing application data as sufficient for calculating several analytics metrics.
- Suggested keeping application status and submission date visible for each application.
- Helped plan the feature so it remained compatible with the existing React and FastAPI application.

### Output 3

**Related Prompt:** Prompt 3

**Summary of AI-generated output:**

- Identified the missing analytics functionality in the existing application tracking implementation.
- Suggested calculating the total number of applications.
- Suggested grouping applications by status.
- Suggested grouping applications by submission month.
- Suggested supporting months with no applications between active months.
- Suggested keeping the analytics calculations in a separate utility file for easier testing.
- Identified frontend component tests and backend application-history tests that should be added.
- Suggested testing authentication, empty history, user isolation, status changes, and invalid dates.

### Output 4

**Related Prompt:** Prompt 4

**Summary of AI-generated output:**

- Added application analytics functionality to the existing Application Tracking page.
- Added a reusable analytics utility for calculating totals, status counts, and monthly activity.
- Added frontend analytics unit tests.
- Added Application Tracking component tests.
- Added backend application-history tests.
- Preserved the existing application history workflow.
- Ran the backend and frontend test suites.
- Ran the frontend production build.
- Reported successful test results before the changes were committed.
- Helped identify an unrelated `package-lock.json` change so it could be excluded before committing.

### Output 5

**Related Prompt:** Prompt 5

**Summary of AI-generated output:**

- Helped create acceptance tests for:
  - AT-S3-01: Recruiter Can Create and Manage a Job Posting
  - AT-S3-02: Job Seeker Can View Application Analytics and History
  - AT-S3-03: User Receives and Views Notifications and Reminders
- Helped define test steps, expected results, and final result documentation.
- Helped validate job-posting creation and editing using a recruiter account.
- Helped validate application analytics using a job-seeker account.
- Helped validate application status update notifications and interview invitations.
- Helped document the actual result of each acceptance test.
- Suggested closing acceptance-test issues only after successful validation.
- Helped verify the backend GitHub Actions workflow.
- Helped verify the frontend GitHub Actions workflow.
- Verified that both workflows automatically discover and execute the relevant Sprint 3 tests.
- Verified that the latest GitHub Actions workflow runs passed.
- Verified backend tests passed with 39 tests and 0 failures.
- Verified frontend tests passed locally.
- Verified the frontend production build succeeded.
- Identified non-blocking warnings related to local runtime versions and dependency/deprecation issues.

## 4. Validation Activities

Describe how the AI-generated output was checked.

- [x] Reviewed the generated output
- [x] Compared against Sprint 3 project requirements
- [x] Tested generated code/content, if applicable
- [x] Checked for implementation and test errors
- [x] Verified information where necessary
- [x] Reviewed the implementation through GitHub issues and pull requests
- [x] Ran backend and frontend automated tests
- [x] Verified GitHub Actions workflow results
- [x] Manually executed acceptance tests
- [x] Re-prompted or corrected the AI when the generated output did not match the expected project behavior

**Validation notes:**

- Reviewed AI suggestions before applying them to the CareerConnect project.
- Compared the proposed Application Analytics functionality with the Sprint 3 requirements.
- Reviewed the existing Application Tracking page before adding new analytics functionality.
- Kept the existing application history instead of creating a duplicate history feature.
- Reviewed the analytics calculations for total applications, status breakdown, and monthly application activity.
- Reviewed the files changed by Codex before staging or committing them.
- Excluded unrelated `package-lock.json` changes from the Application Analytics commit.
- Ran the backend test suite using the project's backend virtual environment.
- Resolved a local pytest temporary-directory permission issue by using a repository-local temporary directory.
- Confirmed that the backend suite passed with **39 tests and 0 failures**.
- Ran the frontend test suite successfully.
- Ran the frontend production build successfully.
- Manually tested AT-S3-01 by creating a recruiter job posting and editing its title.
- Manually tested AT-S3-02 by confirming application history, total applications, status breakdown, submission dates, and application activity over time.
- Manually tested AT-S3-03 by confirming application update notifications, interview invitations, unread notification counts, and mark-as-read behavior.
- Documented the actual result and final Pass result for each acceptance test.
- Verified that the backend GitHub Actions workflow automatically runs the backend test suite.
- Verified that the frontend GitHub Actions workflow automatically runs the frontend test suite and production build.
- Confirmed that the latest backend and frontend GitHub Actions workflow runs passed.
- Reviewed the remaining CI warnings and determined that they were non-blocking for Sprint 3.
- Used Git status before committing to confirm that unrelated files were not included.
- Submitted Application Analytics and History work through a dedicated feature branch and pull request.

## 5. Final Decisions

| AI Suggestion/Output | Decision | Reason |
|---|---|---|
| Reuse the existing Application Tracking page | Used | This avoided duplicating application-history functionality and kept Sprint 3 integrated with the existing project. |
| Add analytics above the existing application history | Used | This allowed users to view both summary metrics and individual application records in the same place. |
| Add total application count | Used | This provided a simple summary metric for the job seeker. |
| Add application status breakdown | Used | This allowed users to understand how many applications were in each stage. |
| Add applications submitted over time | Used | This satisfied the analytics requirement and provided a simple view of application activity. |
| Place analytics calculations in a separate utility file | Used | This made the calculations easier to test independently from the React component. |
| Add frontend analytics unit tests | Used | This verified totals, status counts, date handling, and monthly activity calculations. |
| Add Application Tracking component tests | Used | This verified that analytics and application history were displayed correctly in the UI. |
| Add backend application-history tests | Used | This verified authentication, user isolation, ordering, status information, and application dates. |
| Preserve the existing application history workflow | Used | This prevented unnecessary changes to working Sprint 2 functionality. |
| Keep unrelated `package-lock.json` changes out of the feature commit | Used | This kept the pull request focused on Sprint 3 Application Analytics work. |
| Create separate acceptance-test issues for Sprint 3 user stories | Used | This provided traceable QA documentation for each Sprint 3 feature. |
| Test all three Sprint 3 user stories manually | Used | This confirmed the implemented features worked from the user's perspective. |
| Document actual acceptance-test results before closing issues | Used | This preserved evidence that the tests were actually executed and passed. |
| Verify backend and frontend CI workflows | Used | Group 2 was responsible for maintaining and monitoring CI during Sprint 3. |
| Run backend and frontend tests before finalizing work | Used | This confirmed that the new Sprint 3 work did not break the existing project. |
| Run the frontend production build | Used | This confirmed that the frontend could still compile successfully after Sprint 3 changes. |
| Change local Node and Python versions to match CI immediately | Not used | The existing GitHub Actions workflows passed successfully, so changing local runtimes was unnecessary for Sprint 3. |
| Modify CI because of non-blocking warnings | Not used | The warnings did not prevent the automated test suites or production build from passing. |
| Use a dedicated feature branch and pull request | Used | This kept the implementation reviewable and separated from unrelated work on `main`. |