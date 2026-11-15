# Sprint 3 Contribution Log - Hiba Tydrini

## Feature 3: Notifications and Reminders

Date: November 15, 2026
Branch: `feature/notifications-reminders`
Time spent: Not recorded.

| Activity | Evidence | Result |
|---|---|---|
| Implement notification storage, authenticated endpoints, application workflow integration, recruiter interview invitations, and deadline reminders | [Backend implementation](https://github.com/sahraali252/SSHAAM/commit/f0b7ac4cb441c6fec71b28e9f1f77dcf260779ab) | Four notification types, unread count, read status, user isolation, and duplicate deadline prevention implemented. |
| Add backend unit and acceptance tests and CI configuration | Same backend commit; `backend/tests/`; `.github/workflows/backend-tests.yml` | 34 local tests passed. Live SQLite smoke check passed for server startup, authentication, application submission, status changes, interview invitations, notifications, read status, and authorization. |
| Connect notification frontend for job seekers and recruiters | [Frontend integration](https://github.com/sahraali252/SSHAAM/commit/8358f4e9fca4314a920dfda59b26613f11b4eed5) | Notification panel, unread badge, unread filter, mark-as-read, automatic refresh, and recruiter actions connected to the API. Optional job posting deadline field added. |
| Add frontend component tests, date handling tests, and CI configuration | Same frontend commit; frontend test files; `.github/workflows/frontend-tests.yml` | 14 local frontend tests passed and production build succeeded. Lint completed with existing warnings in other application code. |
| Preserve existing work and isolate the feature | Feature branch and separate local checkout | Original checkout's uncommitted changes preserved. No changes pushed or merged into main. |

## Validation details

- Backend command: `python -m pytest backend/tests -q`.
- Frontend commands, run from `frontend/`: `npm test`, `npm run build`, and `npm run lint`.
- Deadline tests cover the 24-hour reminder window, archived/expired postings, existing applicants, repeat runs, a new database session, and database uniqueness.
- An additive migration was tested twice on a populated legacy SQLite database, preserving existing users, password hashes, job postings, and applications.
- The configured shared PostgreSQL database was not used for live validation. The local feature run uses a separate SQLite database.
- Frontend tests use a simulated DOM and mocked API responses. A visual browser inspection is still pending because browser access was blocked.
- GitHub Actions workflow files are included, but remote CI run results have not been verified because browser access to GitHub was denied.

## Remaining checks

- Verify GitHub Actions results for the feature branch.
- Complete a visual frontend check in a browser with access enabled.
- Team review and final integration into the shared project remain separate from this feature branch delivery.
