# Sprint 2 Contribution Log - Sahra Ali

## Summary

- Total time: about 8 hours 30 minutes
- Main contributions: Job Search and Job Listing Interface implementation, keyword search, location filtering, acceptance testing, debugging, and GitHub documentation.

| Date | Activity | Time spent | Evidence / link | Result |
|---|---|---:|---|---|
| 2026-10-17 | Reviewed Sprint 2 requirements and worked on the Job Search and Job Listing Interface feature planning | 45 min | #15, #16, #17 | Broke the feature into job listings, keyword search, location filtering, and testing tasks |
| 2026-10-18 | Integrated the Himalayas Jobs API with the FastAPI backend and displayed job listings in the frontend | 3 h | `backend/app/routers/jobs_router.py`, `frontend/src/pages/JobSearch.jsx` | Job opportunities were successfully retrieved and displayed |
| 2026-10-19 | Implemented keyword search and connected the React search form to the backend | 1 h | #51, #61, #62 | Users could search for jobs by keyword and receive multiple results |
| 2026-10-22 | Tested and corrected location filtering | 1 h 45 min | #63, `backend/app/routers/jobs_router.py` | Fixed location filtering so results respect the selected country |
| 2026-10-23 | Created and completed acceptance tests AT-06.1, AT-06.2, and AT-07.1 and updated GitHub issues | 1 h 30 min | #61, #62, #63 | Search, multiple results, and location filtering were validated successfully |
| 2026-10-26 | Resolved Git branch/merge issues, committed final fixes, pushed the branch, and merged Pull Request #69 | 30 min | PR #69 | Final Job Search changes were merged into `main` |

## Notes

- My main responsibility was displaying available job opportunities, keyword search, and location filtering.
- I completed acceptance tests AT-06.1, AT-06.2, and AT-07.1.
- During AT-07.1, I found a location-filtering issue, corrected the backend logic, and successfully retested it.
- Final changes were merged into `main` through Pull Request #69.