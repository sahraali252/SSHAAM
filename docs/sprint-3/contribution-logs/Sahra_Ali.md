# Sprint 3 Contribution Log - Sahra Ali

## Feature 2: Application Analytics and History Dashboard / Group 2 Quality Assurance

**Sprint issue:** [#81 - Application Analytics and History Dashboard](https://github.com/sahraali252/SSHAAM/issues/81)

| Date | Activity | Evidence | Result |
|---|---|---|---|
| November 7, 2026 | Reviewed Sprint 3 requirements and planned the Application Analytics and History Dashboard work. Identified the required application history, status breakdown, total application metrics, and application activity features. | Sprint 3 issue #81; Sprint 3 planning discussions | Defined the scope of the Application Analytics and History Dashboard and identified the testing requirements for Sprint 3. |
| November 8, 2026 | Reviewed the existing Sprint 2 application tracking implementation and determined how existing application data could be reused for Sprint 3 analytics. | Existing `ApplicationTracking.jsx`; application backend endpoints | Confirmed that the existing application history workflow could be extended to support the Sprint 3 analytics dashboard without replacing the existing tracking functionality. |
| November 8, 2026 | Reviewed the Sprint 3 user stories and Group 2 Quality Assurance responsibilities. | Sprint 3 issues #80, #81, and #82 | Identified the required acceptance-test coverage for Recruiter Dashboard and Posting Management, Application Analytics and History Dashboard, and Notifications and Reminders. |
| November 9, 2026 | Worked on the Application Analytics and History Dashboard implementation and reviewed how application statistics should be calculated from existing application records. | `frontend/src/pages/ApplicationTracking.jsx`; application data structure | Prepared the analytics logic for total applications, application status counts, and applications submitted over time. |
| November 9, 2026 | Reviewed frontend and backend testing requirements for the Application Analytics and History Dashboard. | Frontend test structure; `backend/tests/` | Identified unit and integration test cases for analytics calculations, application history, authentication, user isolation, status updates, and empty application history. |
| November 10, 2026 | Implemented and validated the Application Analytics and History Dashboard. | `frontend/src/pages/ApplicationTracking.jsx`; `frontend/src/pages/Application.css`; `frontend/src/utils/applicationAnalytics.js` | Added total application counts, status breakdowns, application history, and monthly application submission activity while preserving the existing application tracking functionality. |
| November 10, 2026 | Added frontend tests for application analytics and the Application Tracking page. | `frontend/src/utils/applicationAnalytics.test.js`; `frontend/src/pages/ApplicationTracking.test.jsx` | Added tests covering analytics calculations, exact status counts, monthly activity, missing months, invalid dates, empty history, loading states, authentication, and API failures. |
| November 10, 2026 | Added backend application history tests. | `backend/tests/test_application_history.py` | Verified that users only see their own applications, application history is ordered correctly, authentication is required, empty history works correctly, and status changes preserve application submission dates. |
| November 10, 2026 | Submitted Application Analytics and History work through GitHub. | `sprint3/application-analytics` branch and related pull request | Reviewed the changes before staging, excluded unrelated lockfile changes, committed the feature and tests, pushed the branch, and submitted the work for review. |
| November 12, 2026 | Created and executed Sprint 3 acceptance tests for the three Sprint 3 user stories as part of Group 2 Quality Assurance. | Sprint 3 issues #80, #81, #82 and linked acceptance-test sub-issues | Acceptance tests were created for Recruiter Dashboard and Posting Management, Application Analytics and History Dashboard, and Notifications and Reminders. The test results were documented after validation. |
| November 12, 2026 | Validated Recruiter Dashboard and Posting Management. | [#80 - Recruiter Dashboard and Posting Management](https://github.com/sahraali252/SSHAAM/issues/80) | Logged in as a recruiter, created a job posting, confirmed it appeared in the recruiter dashboard, edited the posting title, saved the changes, and confirmed the updated information displayed correctly. |
| November 12, 2026 | Validated the Application Analytics and History Dashboard. | [#81 - Application Analytics and History Dashboard](https://github.com/sahraali252/SSHAAM/issues/81) | Confirmed total applications, application history, status breakdown, submission dates, and applications submitted over time using a job-seeker account. |
| November 12, 2026 | Validated Notifications and Reminders. | [#82 - Notifications and Reminders](https://github.com/sahraali252/SSHAAM/issues/82) | Confirmed application update notifications, interview invitations, unread notification counts, and mark-as-read behavior. |
| November 12, 2026 | Verified backend and frontend Continuous Integration and automated testing. | `.github/workflows/backend-tests.yml`; `.github/workflows/frontend-tests.yml`; GitHub Actions | Confirmed that both CI workflows automatically run the appropriate test suites. Backend tests passed with 39 tests and 0 failures, frontend tests passed, and the production frontend build completed successfully. |

## Validation Details

- Reviewed the existing Sprint 2 application tracking implementation before extending it for Sprint 3.
- Identified the required Sprint 3 analytics metrics: total applications, status breakdown, application history, and applications submitted over time.
- Implemented and reviewed the Application Analytics and History Dashboard.
- Added frontend unit tests and Application Tracking component tests.
- Added backend tests for application history and application status behavior.
- Ran the backend test suite successfully with **39 tests passed and 0 failed**.
- Ran the frontend test suite successfully.
- Ran the frontend production build successfully.
- Created acceptance tests for Sprint 3 user stories #80, #81, and #82.
- Manually validated all three Sprint 3 feature areas.
- Documented the actual test results and final Pass result for the acceptance tests.
- Verified that the latest backend and frontend GitHub Actions workflow runs passed.
- Reviewed Application Analytics code and test changes before committing and pushing the feature branch.