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
- `src/mailer.js` — Nodemailer via Mailgun EU SMTP
- `client/src/` — React + Vite SPA
- `client/src/components/` — CreatorFlow, JoinFlow, ResultsPage, MyGroups
- `client/src/groups.js` — localStorage helpers for "My Groups"
- `public/` — built by Vite on deploy, served by Express

## Important quirks

- **Express 5 wildcards:** use `/{*path}` not `*` in SPA fallback
- **SQLite strings:** single quotes (`email != ''`), not double quotes
- **Mailgun EU:** always `smtp.eu.mailgun.org`, never `smtp.mailgun.org`

## Deploy to NAS

```bash
tar --exclude='node_modules' --exclude='client/node_modules' \
    --exclude='client/dist' --exclude='.git' --exclude='*.db' \
    --exclude='*.db-shm' --exclude='*.db-wal' \
    -czf /tmp/youmewe-deploy.tar.gz .
scp -O /tmp/youmewe-deploy.tar.gz mattiaswahlberg@your-nas-host:/path/to/deploy/
ssh mattiaswahlberg@your-nas-host "
  cd /path/to/deploy
  tar -xzf youmewe-deploy.tar.gz --overwrite 2>/dev/null && rm youmewe-deploy.tar.gz
  /var/packages/ContainerManager/target/usr/bin/docker-compose up -d --build 2>&1 | tail -8
"
```

## NAS

- **URL:** https://youmewe.neomeda.se
- **Path:** `/path/to/deploy`
- **Container:** `youmewe-youmewe-1`, port `3456:3000`
- **DB:** Docker volume `youmewe_youmewe-data` → `/data/youmewe.db`
- **Env:** `/path/to/deploy/.env` (Mailgun credentials)
