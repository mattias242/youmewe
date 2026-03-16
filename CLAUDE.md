# YouMeWe

React + Express 5 + SQLite app that helps groups find a common chat app.

## Development

```bash
# Backend (port 3000)
npm install && npm run dev

# Frontend (port 5173, proxies → 3000)
cd client && npm install && npm run dev
```

## Architecture

- `src/` — Express 5 backend
- `src/routes/` — API routes
- `src/db.js` — SQLite schema and migrations
- `src/mailer.js` — Nodemailer via SMTP (e.g. Mailgun)
- `client/src/` — React + Vite SPA
- `client/src/components/` — CreatorFlow, JoinFlow, ResultsPage, MyGroups
- `client/src/groups.js` — localStorage helpers for "My Groups"
- `public/` — built by Vite on deploy, served by Express

## Important quirks

- **Express 5 wildcards:** use `/{*path}` not `*` in SPA fallback
- **SQLite strings:** single quotes (`email != ''`), not double quotes
- **Mailgun EU region:** use `smtp.eu.mailgun.org`, not `smtp.mailgun.org`

## Deploy

```bash
docker-compose up -d --build
```

Set SMTP credentials in `.env` before starting. The database is persisted in a Docker volume.
