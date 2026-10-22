# Person 2 — Backend Architecture, APIs & Security

**Contributor:** Huzaifa Bubere
**Branch:** `huzaifa/person-2-backend-fixes`

## Implemented in this contribution

- Removed the four legacy analytics proxy methods, handlers, and routes while retaining the database-backed hospital analytics.
- Removed the ML hypothesis-test and population-stats routes and their controller/service proxies. Remaining ML authentication, role guards, ownership checks, and internal service authentication are unchanged.
- Fixed appointment approval to accept, validate, persist, return, and notify with the confirmed date and exact time.
- Added nullable `scheduledDate` and `scheduledTime` columns. `scheduledDate` stores a calendar date (`DATE`) and `scheduledTime` stores 24-hour `HH:mm` wall-clock time in hospital local time. No server timezone conversion is applied. Existing `requestedDate` and broad requested `timeSlot` remain the patient's original request; the exact confirmed schedule is stored separately.
- Added mocked Jest regression tests for route forwarding, persistence, notification values, omitted optional values, invalid values, missing and non-pending requests, and patients without login accounts.

## Migration and local setup

From `backend/`, install dependencies using the repository lockfile, then run:

```sh
npm run prisma:generate
npx prisma migrate deploy
npm run dev
```

For a disposable development database where migration creation is preferred:

```sh
npx prisma migrate dev
```

Do not use a production database for development verification. The additive migration is `20261020000000_add_confirmed_appointment_schedule`.

## Verification commands

From `backend/`:

```sh
npm run build
npm test -- --runInBand
npm run lint
npx prisma validate
npx prisma migrate status
```

`git diff --check` should also be run from the repository root. These commands were not runnable in the contribution environment because backend dependencies are not installed and npm registry access is denied. No live database or browser flow was run. The new appointment tests use mocked Prisma, Socket.IO, and notification services; they are not live integration tests.

## Coordination dependencies and limitations

- Person 3 should remove or replace frontend calls in `frontend/src/api/index.ts` to `/analytics/eda/distributions`, `/analytics/stats/summary`, `/analytics/hypothesis/results`, `/analytics/big-data/report`, and in `frontend/src/pages/ResearchAnalyticsPage.tsx` to `/ml/hypothesis-test` and `/ml/population-stats`.
- `PERSON_2_BACKEND_SECURITY.md`, `TEAM_ROLES_AND_WORK.md`, and `RTK.md` were not present in the supplied checkout before this contribution. This file records Person 2's work; the team allocation document could not be updated against its absent source.
- The refreshed receptionist approval, patient view, doctor queue, and notification flow still needs a live development database and browser integration check.

## Commit / pull request description

Remove obsolete analytics and ML proxy endpoints and persist appointment approval's confirmed local date and exact time. The migration adds nullable schedule columns without changing existing records. Required step: apply Prisma migration `20261020000000_add_confirmed_appointment_schedule` before deploying the backend. Validation and browser integration checks remain pending because dependencies and a development database were unavailable.
