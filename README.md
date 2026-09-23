# auto-lincoln-api-express

Express 5 implementation of the Auto Lincoln REST API, port **3001**.
Implements the contract from `@auto-lincoln/contracts` identically to
`auto-lincoln-api-nest`, so the web app can switch between them.

## Getting started

Requires Node (dev dependencies target Node 24). The sibling folder
`../auto-lincoln-contracts` must exist, be built, and have its database
running:

```bash
cd ../auto-lincoln-contracts
npm install && npm run db:up && npm run build && npm run migrate:deploy && npm run seed

cd ../auto-lincoln-api-express
cp .env.example .env
npm install
npm run dev          # → api-express listening on http://localhost:3001
```

Check: `curl -i http://localhost:3001/api/health`
→ `{"status":"ok","backend":"express"}`.

## Environment (`.env`)

| Variable | Notes |
| --- | --- |
| `PORT` | defaults to 3001 |
| `DATABASE_URL` | same as in `auto-lincoln-contracts/.env` |
| `CORS_ORIGIN` | the web app origin allowed to call this API with cookies; default `http://localhost:5173` |
| `JWT_SECRET` | **must be identical** in `auto-lincoln-api-nest`, so one session works on both |

`NODE_ENV=production` turns on the `secure` flag of the session cookie.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | `tsx watch src/main.ts` |
| `npm run build` | compile to `dist/` |
| `npm start` | run `dist/main.js` |
| `npm run lint` | oxlint |

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — structure and conventions
- [`CLAUDE.md`](CLAUDE.md) — rules for working with Claude Code
- Contract, routes, auth flow: `../auto-lincoln-contracts/docs/architecture.md`
