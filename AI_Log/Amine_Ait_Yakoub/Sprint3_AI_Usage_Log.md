# Sprint 3 AI Usage Log — Amine Ait Yakoub

## 1. AI Tools Used

| AI Tool | Purpose | Date |
|---|---|---|
| ChatGPT | Review Sprint 3 Application Analytics and History Dashboard requirements | November 7, 2026 |
| ChatGPT | Review existing application tracking functionality and Feature 2 integration | November 8, 2026 |
| ChatGPT / Codex | Plan application analytics calculations and dashboard structure | November 9, 2026 |
| Codex | Review Feature 2 implementation and related frontend/backend tests | November 10, 2026 |
| ChatGPT | Review completed Application Analytics and History Dashboard and validation results | November 12, 2026 |

## 2. Prompts Used

### Prompt 1

**AI Tool:** ChatGPT

**Date:** November 7, 2026

**Prompt:**

> We are working on Sprint 3 of CareerConnect. Our assigned feature is the Application Analytics and History Dashboard. What functionality should be included for application history, status breakdown, and application activity?

### Prompt 2

**AI Tool:** ChatGPT

**Date:** November 8, 2026

**Prompt:**

> Review the existing Application Tracking functionality from Sprint 2. How can we extend it for Sprint 3 instead of creating a second application history page?

### Prompt 3

**AI Tool:** ChatGPT / Codex

**Date:** November 9, 2026

**Prompt:**

> Help us plan the Application Analytics and History Dashboard. We need to calculate total applications, application counts by status, and applications submitted over time using the existing application records.

### Prompt 4

**AI Tool:** Codex

**Date:** November 10, 2026

**Prompt:**

> Review the Application Analytics and History Dashboard implementation and its tests. Check that the existing Application Tracking functionality is preserved and that the frontend and backend tests cover the new Sprint 3 functionality.

### Prompt 5

**AI Tool:** ChatGPT

**Date:** November 12, 2026

**Prompt:**

> Help review the completed Application Analytics and History Dashboard. Confirm what should be checked to verify that application history, status breakdown, total applications, and applications submitted over time are working correctly.

## 3. Generated Outputs

### Output 1

**Related Prompt:** Prompt 1

**Summary of AI-generated output:**

- Identified the main requirements of the Application Analytics and History Dashboard.
- Suggested keeping application history visible to the job seeker.
- Identified total application count as a useful summary metric.
- Identified application status breakdown as a required dashboard metric.
- Identified application activity over time as an analytics requirement.
- Helped divide Feature 2 into smaller development and testing tasks.

### Output 2

**Related Prompt:** Prompt 2

**Summary of AI-generated output:**

- Reviewed the existing Application Tracking page concept.
- Suggested extending the existing page rather than duplicating application history.
- Suggested placing analytics information alongside the existing history.
- Identified existing application records as reusable data for the new Sprint 3 metrics.
- Helped preserve the existing job-seeker application tracking workflow.

### Output 3

**Related Prompt:** Prompt 3

**Summary of AI-generated output:**

- Suggested calculating the total number of applications from the existing application list.
- Suggested grouping applications by current status.
- Suggested grouping applications by submission month.
- Suggested displaying application activity chronologically.
- Helped review how application dates and statuses should be handled.
- Suggested separating analytics calculations from the main React component to make them easier to test.

### Output 4

**Related Prompt:** Prompt 4

**Summary of AI-generated output:**

- Reviewed the Application Analytics implementation.
- Reviewed frontend analytics calculations.
- Reviewed the Application Tracking component tests.
- Reviewed backend application-history tests.
- Identified tests for authentication, user isolation, status information, application dates, and empty application history.
- Helped confirm that the new analytics functionality did not remove the existing application tracking behavior.

### Output 5

**Related Prompt:** Prompt 5

**Summary of AI-generated output:**

- Suggested verifying that all previous applications were displayed.
- Suggested checking that the total application count matched the application history.
- Suggested checking application counts for each status.
- Suggested verifying submission dates.
- Suggested verifying applications submitted over time.
- Helped review the final Feature 2 results before Sprint 3 completion.

## 4. Validation Activities

Describe how the AI-generated output was checked.

- [x] Reviewed the generated output
- [x] Compared against Sprint 3 project requirements
- [x] Reviewed generated code/content where applicable
- [x] Checked for errors
- [x] Reviewed frontend and backend test coverage
- [x] Reviewed the completed Application Analytics and History Dashboard
- [x] Compared the implementation with the existing Application Tracking functionality
- [x] Verified that the expected analytics information was displayed

**Validation notes:**

- Reviewed the Sprint 3 Application Analytics and History Dashboard requirements before development.
- Reviewed the existing Application Tracking functionality from Sprint 2.
- Confirmed that the existing application history could be extended rather than duplicated.
- Reviewed the analytics for total applications, status breakdown, and applications submitted over time.
- Reviewed the Feature 2 implementation with Sahra.
- Reviewed frontend tests related to analytics calculations and Application Tracking.
- Reviewed backend tests related to application history and status information.
- Helped verify that the completed dashboard displayed the expected application information.
- Confirmed that the new Sprint 3 analytics did not remove the existing application tracking functionality.

## 5. Final Decisions

| AI Suggestion/Output | Decision | Reason |
|---|---|---|
| Reuse the existing Application Tracking page | Used | This avoided creating duplicate application-history functionality. |
| Add analytics to the existing application history experience | Used | This kept the Sprint 3 feature integrated with the existing job-seeker workflow. |
| Display total applications | Used | This provided a simple overview of application activity. |
| Display application status breakdown | Used | This allowed users to see how many applications were in each stage. |
| Display applications submitted over time | Used | This added the analytics component required for Sprint 3. |
| Use existing application records as the analytics data source | Used | The required information was already available through the application tracking functionality. |
| Separate analytics calculations from the main component | Used | This made the logic easier to review and test. |
| Preserve existing Application Tracking functionality | Used | Existing Sprint 2 functionality should remain working while Sprint 3 features are added. |
| Add frontend tests for analytics calculations | Used | This helped verify that application totals, statuses, and monthly activity were calculated correctly. |
| Add backend tests for application history | Used | This helped verify application data, authentication, isolation, and status behavior. |
| Review Feature 2 before final Sprint validation | Used | This helped confirm that the completed dashboard matched the Sprint 3 requirements. |