# YouMeWe

React + Express 5 + SQLite-app som hjälper grupper hitta gemensam chattapp.

## Utveckling

```bash
# Backend (port 3000)
npm install && npm run dev

# Frontend (port 5173, proxy → 3000)
cd client && npm install && npm run dev
```

## Arkitektur

- `src/` — Express 5 backend
- `src/routes/` — API-rutter
- `src/db.js` — SQLite-schema och migrationer
- `src/mailer.js` — Nodemailer via Mailgun EU SMTP
- `client/src/` — React + Vite SPA
- `client/src/components/` — CreatorFlow, JoinFlow, ResultsPage, MyGroups
- `client/src/groups.js` — localStorage-hjälpare för "Mina grupper"
- `public/` — byggs av Vite vid deploy, serveras av Express

## Viktiga quirks

- **Express 5 wildcards:** `/{*path}` inte `*` i SPA-fallback
- **SQLite strängar:** enkla citattecken (`email != ''`), inte dubbla
- **Mailgun EU:** alltid `smtp.eu.mailgun.org`, aldrig `smtp.mailgun.org`

## Deploy till NAS

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
- **DB:** Docker-volym `youmewe_youmewe-data` → `/data/youmewe.db`
- **Env:** `/path/to/deploy/.env` (Mailgun-credentials)
