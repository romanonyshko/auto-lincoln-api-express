# CLAUDE.md

Express implementation of the "Auto Lincoln" REST API (admin panel for an
auto parts catalogue; a learning project built from a mentor's mockup).
Port **3001**.

## Where this sits

```
~/Documents/programing/auto-lincoln/
  auto-lincoln-api-express/   ← this repo
  auto-lincoln-api-nest/      ← the NestJS API :3002 — same contract, must behave identically
  auto-lincoln-contracts/     ← @auto-lincoln/contracts: contract, auth, Prisma client, DB + migrations
  auto-lincoln-web/           ← web app :5173, switches between the two APIs
```

The two APIs are interchangeable: the web app has a switcher and must get
the same paths, status codes and bodies from either. Dependency:
`"@auto-lincoln/contracts": "file:../auto-lincoln-contracts"` (a symlink to
its `dist/` — rebuild the contracts after changing them).

## Stack

Express 5 · TypeScript 6 (ESM, `nodenext`) · `tsx watch` in dev ·
`cookie-parser` · oxlint.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | `tsx watch src/main.ts` |
| `npm run build` | `tsc` → `dist/` |
| `npm start` | `node dist/main.js` |
| `npm run lint` | oxlint |

The database must be running: `npm run db:up` in `auto-lincoln-contracts`.
There are no tests yet.

## Architecture rules

- **Contract first.** Routes, request/response types and the cookie name
  come from `@auto-lincoln/contracts`. A new route is added there first,
  then implemented here **and** in `auto-lincoln-api-nest`.
- **Imports from the contracts:** `@auto-lincoln/contracts` (shared),
  `@auto-lincoln/contracts/auth` (passwords, JWT),
  `@auto-lincoln/contracts/db` (Prisma). Never `@prisma/*` directly, never
  run `prisma` here — migrations live in `auto-lincoln-contracts`.
- **DB models never leave the API as-is.** Map them to contract types
  (`toAuthUser`) so fields like `passwordHash` are never sent.
- `modules/<feature>/` holds routers and mappers; cross-cutting middleware
  lives in `middleware/`, shared helpers in `lib/`.
- Handlers `throw new ApiError(status, message)`; only `errorHandler` sends
  an error body. Do not call `res.status(...).json(...)` for errors.
- Middleware order in `app.ts`: `cors` → parsers → routers → `notFound` →
  `errorHandler` (last, no prefix).
- No `try/catch` around async handlers — Express 5 forwards rejections.
- Cookie `al_session`: `httpOnly`, `sameSite: 'lax'`, `path: '/'`,
  `maxAge: SESSION_MAX_AGE_MS`, `secure` in production — must stay equal to
  Nest's. `JWT_SECRET` must be equal to Nest's.
- **CORS.** The browser calls this API directly from the web origin
  (`CORS_ORIGIN`, default `http://localhost:5173`) with cookies: exact
  origin, `credentials: true`, preflight `OPTIONS` → 204. Implemented in
  `src/middleware/cors.ts` (mounted first in `app.ts`); must stay equivalent to Nest's.
- Relative imports use the `.js` extension.

## How to work with me

- I write the code myself. Help me pointwise: problem → where to change it →
  a minimal example → why this way.
- Do not generate large files without an explicit request.
- Before implementing a feature — first a plan and my confirmation.
- Reply in Ukrainian.

## Documentation

- `README.md` — setup and commands
- `docs/architecture.md` — structure, conventions and pitfalls — read
  before changing the app
- `auto-lincoln-contracts/docs/architecture.md` — the contract, current
  routes, auth flow, DB
- `auto-lincoln-web/docs/roadmap.md`, `auto-lincoln-web/docs/open-questions.md`
  — plan and open questions for the whole project (relevant here: #1
  parity, #2 validation, #3 production routing, #5 roles, #7 error bodies,
  #8 refresh tokens). Do not resolve them silently.
