# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Keep each route component responsible for its API request, accessible loading/error/empty states, and rendering; use the shared API client for relative `/api` requests.
- Logic tier decision: Keep HTTP handling in Express routes and capability behavior in explicit service functions; translate invalid input and missing resources into deliberate 4xx responses.
- Data tier decision: Enforce required fields and defaults in Mongoose schemas, and preserve the existing idempotent, non-destructive seed behavior.
- Activity tracking approach: Validate activity input and referenced user/team IDs before creating a record; calculate points from submitted minutes and set the occurrence time in the service.
- Team management approach: Require a team name, retain the submitted mascot and members, and return populated team/member data through the API.
- Leaderboard approach: Sum activity points per team, sort descending, and assign 1-based ranks in the service.
- Workout suggestions approach: Match a known user's fitness goal, informed by recent activity, to available workouts and include an explanatory reason; return a 4xx for unknown users.

## Test plan

Run the focused contract suites while implementing, then run the complete suites and builds before integration.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend` checks required model fields, defaults, and idempotent seed behavior. Passed (5 tests).
- API command: `npm run test:api --prefix octofit-tracker/backend` checks endpoint behavior, validation, leaderboard ordering, and workout recommendations. Passed (4 tests).
- Frontend command: `npm test --prefix octofit-tracker/frontend` checks API rendering and accessible loading, empty, and error states. Passed (15 tests).
- Backend build command: `npm run build --prefix octofit-tracker/backend` checks TypeScript types. Passed.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend` checks TypeScript and creates the production Vite bundle. Passed.
- Full backend suite: `npm test --prefix octofit-tracker/backend` passed (9 tests).
- Seed idempotency: Ran `npm run seed --prefix octofit-tracker/backend` twice against the configured MongoDB instance; both runs passed.
