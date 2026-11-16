# Sprint 3 Contribution Log - Aya Lakhoitri

## Feature: Recruiter Dashboard and Posting Management

**Date:** November 10-15, 2026  
**Branch:** `feature/recruiter-dashboard`  
**Time spent:** Not recorded.  
**Sprint issue:** [#80 - Recruiter Dashboard and Posting Management](https://github.com/sahraali252/SSHAAM/issues/80)

| **Activity** | **Evidence** | **Result** |
|---|---|---|
| Implement role-aware registration, login, and recruiter dashboard routing | [Recruiter login and dashboard commit](https://github.com/sahraali252/SSHAAM/commit/2143840286e641ac792a32726256be6727cc414c) | Recruiter accounts are saved with the recruiter role, the login response returns the user role, and recruiters are redirected to `/recruiter/dashboard` instead of the job-seeker dashboard. |
| Create a protected recruiter dashboard | Same recruiter login and dashboard commit; `frontend/src/pages/RecruiterDashboard.jsx` | Recruiters have a dedicated dashboard with recruiter-specific navigation, account display, protected access, and logout functionality. |
| Implement the JobPosting data model and recruiter-only backend endpoints | [Recruiter posting-management commit](https://github.com/sahraali252/SSHAAM/commit/8fb9ed80e5d98343b40edea4e3a817929f301e99); `backend/app/models.py`; `backend/app/routers/recruiter_postings_router.py` | Recruiters can create, retrieve, edit, archive, and restore their own job postings. Backend authorization checks prevent recruiters from managing another recruiter's postings. |
| Build the recruiter job-posting management interface | Same recruiter posting-management commit; `frontend/src/pages/RecruiterDashboard.jsx`; `frontend/src/pages/RecruiterDashboard.css` | Recruiters can create and edit postings through a form, filter postings by Active, Archived, or All, archive or restore postings, and view application counts. |
| Display active recruiter-created opportunities on the job-seeker dashboard | Same recruiter posting-management commit; `backend/app/routers/public_job_postings_router.py`; `frontend/src/components/RecruiterOpportunities.jsx` | Active recruiter-created postings are displayed as the default job-seeker dashboard content. Job seekers can select an opportunity and use the existing application workflow. Archived postings are excluded from the public opportunities endpoint. |
| Redesign recruiter and job-seeker dashboards based on instructor feedback | `frontend/src/pages/RecruiterDashboard.jsx`; `frontend/src/pages/Dashboard.jsx` | Both dashboards use feature navigation in the header. The recruiter dashboard focuses on posting management, while the job-seeker dashboard defaults to available recruiter-created opportunities. |
| Organize Sprint 3 work in GitHub | [Pull request #78](https://github.com/sahraali252/SSHAAM/pull/78); Sprint 3 GitHub Project board | Created and updated the feature branch and pull request, organized Sprint 3 issues, identified backlog work, and documented the division of work between Aya and Melissa. |

## Validation Details

- Started the FastAPI backend locally using:

  ```text
  uvicorn app.main:app --reload
  ```

- Confirmed that the FastAPI documentation page displayed the recruiter job-posting endpoints.
- Registered and logged in with a recruiter account.
- Confirmed that recruiters were redirected to the recruiter dashboard.
- Created a recruiter job posting through the recruiter dashboard.
- Confirmed that active recruiter-created opportunities appeared on the job-seeker dashboard.
- Confirmed that the project used separate recruiter and job-seeker browser sessions during testing because local storage is shared between normal browser tabs.
- Checked Git status before committing and pushed completed work to `feature/recruiter-dashboard`.
- Submitted the work through pull request #78 for teammate review.
