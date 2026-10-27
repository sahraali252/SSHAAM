# Sprint 2 AI Usage Log — Sahra Ali

## 1. AI Tools Used

| AI Tool | Purpose | Date |
|---|---|---|
| ChatGPT | Sprint 2 Job Search and Job Listing Interface requirements | October 17, 2026 |
| ChatGPT | Himalayas Jobs API integration and backend job-search setup | October 18, 2026 |
| ChatGPT | React job listing display and keyword search implementation | October 19, 2026 |
| ChatGPT | Location filtering logic and debugging | October 22, 2026 |
| ChatGPT | Acceptance testing, Git/GitHub workflow, and final integration | October 23, 2026 |

## 2. Prompts Used

### Prompt 1

**AI Tool:** ChatGPT

**Date:** October 17, 2026

**Prompt:**

> We are working on Sprint 2 of CareerConnect. My assigned feature is the Job Search and Job Listing Interface. What exactly needs to be implemented for displaying available jobs, keyword search, and location filtering?

### Prompt 2

**AI Tool:** ChatGPT

**Date:** October 18, 2026

**Prompt:**

> How can I connect our FastAPI backend to an external jobs API so that CareerConnect can retrieve and display available job opportunities? I am using React for the frontend and FastAPI for the backend.

### Prompt 3

**AI Tool:** ChatGPT

**Date:** October 19, 2026

**Prompt:**

> Help me build the React Job Search page. I want to display the job title, company, location, and a short description, and I also want users to be able to search jobs using a keyword.

### Prompt 4

**AI Tool:** ChatGPT

**Date:** October 22, 2026

**Prompt:**

> My location filter is not working correctly. When I search for Canada, some remote jobs are still returned even though Canada is not one of their eligible countries. How can I fix the backend filtering logic?

### Prompt 5

**AI Tool:** ChatGPT

**Date:** October 23, 2026

**Prompt:**

> Help me create and document acceptance tests for keyword search, displaying multiple job results, and location filtering. I also need help checking my Git status, committing the final fixes, pushing my branch, and preparing the pull request safely.

## 3. Generated Outputs

### Output 1

**Related Prompt:** Prompt 1

**Summary of AI-generated output:**

- Broke the Job Search and Job Listing Interface feature into smaller implementation tasks.
- Identified displaying job opportunities as one of the main requirements.
- Identified keyword search and location filtering as part of the search functionality.
- Suggested connecting the feature to GitHub user stories, implementation tasks, and acceptance tests.
- Helped separate my portion of the feature from other job-search functionality handled by teammates.

### Output 2

**Related Prompt:** Prompt 2

**Summary of AI-generated output:**

- Suggested using the Himalayas Jobs API as the external source of job opportunities.
- Suggested creating a FastAPI `/jobs/` route.
- Explained how to use `httpx` to request job information from the external API.
- Suggested passing search parameters from the frontend to the backend.
- Helped organize the job-search backend inside `backend/app/routers/jobs_router.py`.
- Suggested returning the jobs received from the external API to the React frontend.

### Output 3

**Related Prompt:** Prompt 3

**Summary of AI-generated output:**

- Suggested creating state variables for jobs, keyword, location, loading state, and the selected job.
- Suggested using `URLSearchParams` to construct the search request.
- Helped connect the keyword input to the backend `keyword` parameter.
- Suggested displaying each result as a job card.
- Suggested showing job title, company name, location, and description preview.
- Suggested showing the number of jobs returned by the search.
- Helped organize the Job Search page so it worked with the existing React application.

### Output 4

**Related Prompt:** Prompt 4

**Summary of AI-generated output:**

- Helped identify that sending a country parameter to the external API did not guarantee that every returned job was actually available in that country.
- Suggested reviewing the `locationRestrictions` array returned for each job.
- Suggested converting the selected location to lowercase before comparing values.
- Suggested filtering the returned jobs so only jobs whose `locationRestrictions` included the selected country remained.
- Suggested retesting the location filter after making the change.
- Helped identify the difference between a remote job and a remote job that is actually available to candidates in Canada.

### Output 5

**Related Prompt:** Prompt 5

**Summary of AI-generated output:**

- Helped organize acceptance tests for:
  - AT-06.1: Search Jobs by Keyword
  - AT-06.2: Display Multiple Job Search Results
  - AT-07.1: Filter Jobs by Location
- Suggested testing keyword search using a software-related keyword.
- Suggested checking that multiple results were displayed.
- Suggested testing the location filter using Canada.
- Helped document the original failed location-filter test.
- Suggested keeping the original failed test result and adding a separate successful retest after fixing the backend.
- Helped organize GitHub acceptance-test labels, issue statuses, milestones, and user-story relationships.
- Explained how to inspect `git status` before committing.
- Helped finish an incomplete Git merge safely.
- Suggested committing the merge separately from the job-filter fixes.
- Suggested pushing the feature branch and creating a pull request into `main`.

## 4. Validation Activities

Describe how the AI-generated output was checked.

- [x] Reviewed the generated output
- [x] Compared against project requirements
- [x] Tested generated code/content, if applicable
- [x] Checked for errors
- [x] Verified information where necessary
- [x] Reviewed the implementation through GitHub issues and pull requests
- [x] Re-prompted or corrected the AI when the output did not match the expected result

**Validation notes:**

- Reviewed the AI suggestions before applying them to the CareerConnect project.
- Compared the proposed Job Search functionality with the Sprint 2 requirements.
- Modified suggested code so it matched the existing React and FastAPI project structure.
- Ran the FastAPI backend locally using Uvicorn.
- Ran the React frontend locally using the Vite development server.
- Verified that the Job Search page could retrieve available job opportunities from the backend.
- Tested keyword search and confirmed that multiple job listings were returned.
- Tested AT-06.1: Search Jobs by Keyword.
- Tested AT-06.2: Display Multiple Job Search Results.
- Tested AT-07.1: Filter Jobs by Location.
- The first AT-07.1 test failed because some remote jobs returned for Canada did not actually include Canada in their eligible locations.
- Reviewed the returned API data and identified `locationRestrictions` as the field needed for stricter validation.
- Modified the backend location-filtering logic.
- Reran AT-07.1 and confirmed that only jobs eligible for Canada remained.
- Documented both the failed test and successful retest in GitHub.
- Verified backend requests using the terminal logs.
- Used `git status` before committing changes to verify which files were modified.
- Completed the existing merge from `origin/main`.
- Committed the location and filtering fixes separately.
- Pushed the feature branch to GitHub.
- Created Pull Request #69 and verified that GitHub reported no merge conflicts.
- Merged the completed Job Search changes into `main`.
- Pulled the newest `main` branch locally and verified that the working tree was clean.

## 5. Final Decisions

| AI Suggestion/Output | Decision | Reason |
|---|---|---|
| Break the Job Search feature into smaller implementation tasks | Used | This made the Sprint 2 work easier to organize and track. |
| Use the Himalayas Jobs API | Used | It provided real job listings without requiring the team to manually create job data. |
| Create a FastAPI `/jobs/` route | Used | This kept the external API logic inside the backend instead of calling it directly from the frontend. |
| Use `httpx` for requests to the jobs API | Used | It integrated cleanly with the FastAPI backend. |
| Use React state for keyword, location, jobs, and loading | Used | This supported the search interface and dynamic job-result updates. |
| Use `URLSearchParams` for frontend search parameters | Used | It provided a simple way to send keyword and location values to the backend. |
| Display job results using reusable job cards | Used | This made the job listings easier to read and interact with. |
| Use the external API country parameter for location filtering | Modified | The external API still returned some jobs that were not actually eligible for the selected country. |
| Filter using `locationRestrictions` | Used | This produced more accurate location-filtering results. |
| Keep the original failed AT-07.1 result | Used | It documented the issue that was discovered during testing. |
| Retest AT-07.1 after modifying the backend | Used | This confirmed that the location-filtering fix worked correctly. |
| Create separate GitHub acceptance-test issues | Used | This matched the Sprint 2 testing and documentation requirements. |
| Use `type: acceptance test` labels | Used | This clearly identified acceptance-test issues in GitHub. |
| Check Git status before committing | Used | This helped avoid accidentally committing unrelated files. |
| Finish the existing merge before committing new changes | Used | This safely completed the branch synchronization with `main`. |
| Commit the merge separately from feature fixes | Used | This kept the Git history clearer. |
| Use a pull request before merging into `main` | Used | This provided a reviewable and traceable integration process. |