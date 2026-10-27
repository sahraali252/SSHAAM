# Sprint 2 AI Usage Log — Amine Ait-Yakoub

## 1. AI Tools Used

| AI Tool | Purpose | Date |
|---|---|---|
| ChatGPT | Understanding Sprint 2 requirements for category filtering and job details | October 17, 2026 |
| ChatGPT | Category filtering implementation guidance | October 18, 2026 |
| ChatGPT | Job details interface and data display guidance | October 19, 2026 |
| ChatGPT | Debugging category filtering behavior | October 22, 2026 |
| ChatGPT | Acceptance testing and GitHub issue documentation | October 23, 2026 |

## 2. Prompts Used

### Prompt 1

**AI Tool:** ChatGPT

**Date:** October 17, 2026

**Prompt:**

> We are working on Sprint 2 of CareerConnect. My assigned part is category filtering and the job details portion of the Job Search and Job Listing Interface. What exactly needs to be implemented?

### Prompt 2

**AI Tool:** ChatGPT

**Date:** October 18, 2026

**Prompt:**

> How can I add category filtering to the Job Search feature so that users can narrow down job results based on a selected category?

### Prompt 3

**AI Tool:** ChatGPT

**Date:** October 19, 2026

**Prompt:**

> Help me implement the job details functionality in React. When a user selects a job, I want to display the job title, company, employment type, location, category, and full description.

### Prompt 4

**AI Tool:** ChatGPT

**Date:** October 22, 2026

**Prompt:**

> My category filter is returning some unrelated jobs. How can I make the filtering stricter so that the results actually match the category selected by the user?

### Prompt 5

**AI Tool:** ChatGPT

**Date:** October 23, 2026

**Prompt:**

> Help me test and document the category filter and job details functionality using acceptance tests. I need to verify category filtering, full job descriptions, and returning from job details back to the search results.

## 3. Generated Outputs

### Output 1

**Related Prompt:** Prompt 1

**Summary of AI-generated output:**

- Broke down the assigned Job Search work into category filtering and job details functionality.
- Identified the need to display detailed job information after a user selects a job.
- Identified category filtering as a separate filtering requirement.
- Suggested organizing the work using implementation tasks and acceptance tests.

### Output 2

**Related Prompt:** Prompt 2

**Summary of AI-generated output:**

- Suggested using a category input in the React search form.
- Suggested sending the selected category from the frontend to the FastAPI backend.
- Explained how the category could initially be included in the external API search request.
- Suggested validating the returned jobs against the category data when necessary.

### Output 3

**Related Prompt:** Prompt 3

**Summary of AI-generated output:**

- Suggested storing the selected job in React state.
- Suggested changing the displayed interface when a job is selected.
- Recommended showing the job title, company name, employment type, location, category, and full description.
- Suggested adding an external application link.
- Suggested adding a "Back to jobs" button so users could return to the search results.

### Output 4

**Related Prompt:** Prompt 4

**Summary of AI-generated output:**

- Helped identify that treating the selected category only as a general search keyword could return unrelated results.
- Suggested reviewing each job's `categories` field.
- Suggested comparing the selected category with the returned category values.
- Suggested filtering out jobs that did not match the selected category.
- Recommended retesting the feature after updating the filtering logic.

### Output 5

**Related Prompt:** Prompt 5

**Summary of AI-generated output:**

- Helped organize acceptance tests for:
  - AT-07.2: Filter Jobs by Category
  - AT-08.1: View Full Job Description
  - AT-08.2: View Job Details and Return to Results
- Suggested testing category filtering using "Engineering".
- Suggested verifying that unrelated results were removed after correcting the filter.
- Suggested checking that the full job description and relevant job information were visible.
- Suggested testing the "Back to jobs" navigation.
- Helped organize GitHub acceptance-test labels, statuses, milestones, and parent relationships.

## 4. Validation Activities

Describe how the AI-generated output was checked.

- [x] Reviewed the generated output
- [x] Compared against project requirements
- [x] Tested generated code/content, if applicable
- [x] Checked for errors
- [x] Verified information where necessary
- [x] Re-tested functionality after modifications
- [x] Documented results through GitHub acceptance-test issues

**Validation notes:**

- Reviewed the AI suggestions before applying them to the CareerConnect project.
- Compared the suggested functionality with the Sprint 2 Job Search requirements.
- Tested the category filter through the React frontend and FastAPI backend.
- Initially tested the category filter using "Engineering".
- The first results included some jobs that were not clearly related to the selected category.
- The filtering approach was modified to use the returned job category information.
- The category test was repeated and the updated results were reduced to relevant engineering-related jobs.
- Tested AT-07.2: Filter Jobs by Category.
- Tested AT-08.1: View Full Job Description.
- Verified that the selected job displayed its title, company, employment type, location, category, and full description.
- Tested AT-08.2: View Job Details and Return to Results.
- Verified that the "Back to jobs" button returned the user to the job search results.
- Documented the acceptance-test results in GitHub.
- Added the `type: acceptance test` label to the relevant test issues.
- Updated the issue statuses and Sprint 2 milestones after successful testing.

## 5. Final Decisions

| AI Suggestion/Output | Decision | Reason |
|---|---|---|
| Separate category filtering from keyword search | Used | This made the filtering behavior clearer and matched the Sprint 2 requirement. |
| Add a category input to the Job Search interface | Used | This allowed users to filter available job opportunities by category. |
| Send the category value to the backend | Used | This connected the frontend filter to the backend search logic. |
| Use general keyword matching for category filtering | Modified | It returned some unrelated job listings and was not strict enough. |
| Filter using each job's `categories` data | Used | This produced more relevant category-filtered results. |
| Store the selected job in React state | Used | This allowed the interface to show the selected job's details. |
| Display title, company, employment type, location, category, and description | Used | This satisfied the requirement to display detailed job information. |
| Add a "Back to jobs" button | Used | This allowed users to return to the search results after viewing a job. |
| Create separate acceptance-test issues | Used | This helped validate each part of the feature independently. |
| Retest the category filter after fixing it | Used | This confirmed that the updated filtering logic behaved correctly. |
| Use `type: acceptance test` labels | Used | This kept the GitHub testing documentation organized. |
