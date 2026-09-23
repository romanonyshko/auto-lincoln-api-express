# Architecture (Express API)

The contract this API implements — routes, DTOs, error body, auth flow —
is described in `auto-lincoln-contracts/docs/architecture.md`. This file
covers only the Express side.

## Layout

```
.
├── package.json        # depends on @auto-lincoln/contracts (file:../auto-lincoln-contracts)
├── tsconfig.json       # nodenext, src/ → dist/
├── .oxlintrc.json
├── .env.example        # PORT, DATABASE_URL, JWT_SECRET, CORS_ORIGIN
└── src/
    ├── main.ts                     # imports config/env first, then listens
    ├── app.ts                      # createApp(): middleware order, routers under /api
    ├── config/env.ts               # loads .env, validates PORT / DATABASE_URL / JWT_SECRET, CORS_ORIGIN
    ├── lib/prisma.ts               # a single PrismaClient (createPrismaClient from contracts/db)
    ├── lib/apiError.ts             # ApiError class + buildErrorBody()
    ├── middleware/cors.ts          # CORS for the web origin, answers preflight OPTIONS
    ├── middleware/requireAuth.ts   # verifies the cookie JWT → res.locals.session
    ├── middleware/notFound.ts      # unknown route → ApiError(404)
    ├── middleware/errorHandler.ts  # the only place that sends an error body
    ├── types/express.d.ts          # session in Express.Locals
    ├── routes/health.ts
    └── modules/auth/
        ├── auth.router.ts          # login / me / logout
        ├── auth.types.ts           # Session type
        └── toAuthUser.ts           # User (DB) → AuthUser
```

## What comes from the contracts

| Import | Used in |
| --- | --- |
| `@auto-lincoln/contracts` | `app.ts` (`API_PREFIX`), `routes/health.ts`, `modules/auth/auth.router.ts` (`API_ROUTES`, `AUTH_COOKIE_NAME`), `middleware/requireAuth.ts`, `lib/apiError.ts` (`ApiErrorBody`), `types/express.d.ts` (`UserRole`), `modules/auth/toAuthUser.ts` (`AuthUser`) |
| `@auto-lincoln/contracts/auth` | `auth.router.ts` (`SESSION_MAX_AGE_MS`, `signSession`, `verifyPassword`), `requireAuth.ts` (`verifySession`), `auth.types.ts` |
| `@auto-lincoln/contracts/db` | `lib/prisma.ts` (`createPrismaClient`), `toAuthUser.ts` (`User`) |

## Middleware order

`createApp()`: `cors` first (a preflight `OPTIONS` must be answered before
it reaches the routers or `notFound`), then `express.json()` and
`cookieParser()`, then the routers under `API_PREFIX`, then `notFound`, and
`errorHandler` last (mounted without a prefix). Because `cors` sets its
headers first, error responses carry them too.

## CORS

The web app (`http://localhost:5173`) calls this API directly, not through a
proxy. `middleware/cors.ts` sets `Access-Control-Allow-Origin: CORS_ORIGIN`
(exact — `*` is not allowed with cookies), `Access-Control-Allow-Credentials:
true`, `Vary: Origin`; on `OPTIONS` also the allowed methods and
`Content-Type`, then 204. No `cors` package — the middleware mirrors what
`app.enableCors({ origin, credentials: true })` does in the Nest API.

## Conventions and pitfalls

- Express 5 forwards errors from async handlers to the error middleware on
  its own — no `try/catch` wrappers are needed.
- Handlers throw `ApiError(status, message)`; only `errorHandler` builds the
  response body, so the format stays in one place. The body is
  `{ message, statusCode, error }` — keys in this order (Nest orders them
  differently, see open question #7).
- The error middleware is recognised by its **four** parameters; unused ones
  keep a `_` prefix so `noUnusedParameters` stays happy.
- `res.locals.session` is typed through `Express.Locals` and is optional —
  protected handlers narrow it before use.
- `config/env.ts` must be the first import in `main.ts`: it loads `.env`
  before anything reads `process.env`.

## Configuration

`.env`: `PORT` (default 3001), `DATABASE_URL`, `JWT_SECRET` (identical to
Nest), `CORS_ORIGIN` (default `http://localhost:5173`). `NODE_ENV=production` → `secure` cookie.

Duplicated with `auto-lincoln-api-nest` by design today (technical debt in
`auto-lincoln-web/docs/open-questions.md`): `config/env.ts`, the cookie
options, `toAuthUser`, the `Session` type.
