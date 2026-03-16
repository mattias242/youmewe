# YouMeWe

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)

Find the chat app your whole group already has. The organizer shares a link — each participant enters their name and selects which apps they have installed. The organizer sees the overlap instantly.

## Stack

- **Backend:** Node.js + Express 5 + SQLite (better-sqlite3)
- **Frontend:** React + Vite (SPA)
- **Email:** Nodemailer via Mailgun EU SMTP
- **Deploy:** Docker (multi-stage build), Synology NAS

## Flow

1. Organizer enters a group name → gets a shareable link (`?join=<code>`)
2. Each participant opens the link, enters name + email (optional) + selects installed apps
3. Organizer sees live results via `?mine=<id>` — which apps the most people share
4. Organizer can send a transactional email to all participants with the chosen result

## Local development

```bash
# Backend
npm install
npm run dev          # nodemon on port 3000

# Frontend (separate terminal)
cd client
npm install
npm run dev          # Vite on port 5173 (proxies → 3000)
```

## Deploy to NAS

```bash
# Package and transfer
tar --exclude='node_modules' --exclude='client/node_modules' \
    --exclude='client/dist' --exclude='.git' --exclude='*.db' \
    -czf /tmp/youmewe.tar.gz .
scp -O /tmp/youmewe.tar.gz mattiaswahlberg@your-nas-host:/path/to/deploy/

# Extract and build on NAS
ssh mattiaswahlberg@your-nas-host "
  cd /path/to/deploy
  tar -xzf youmewe.tar.gz --overwrite && rm youmewe.tar.gz
  /var/packages/ContainerManager/target/usr/bin/docker-compose up -d --build
"
```

## Environment variables (.env)

```env
SMTP_HOST=smtp.eu.mailgun.org
SMTP_PORT=587
SMTP_USER=<mailgun-user>
SMTP_PASS=<mailgun-password>
SMTP_FROM=YouMeWe <noreply@yourdomain.com>
```

## NAS configuration

- **Deploy path:** `/path/to/deploy`
- **Container port:** `3456` → `3000`
- **Database:** Docker volume `youmewe_youmewe-data` → `/data/youmewe.db`
- **URL:** https://youmewe.neomeda.se
- **Reverse proxy:** DSM Control Panel → Login Portal → Advanced

## API routes

| Method | Path | Description |
|--------|------|-------------|
| POST | `/sessions` | Create session (rate limit: 10/h) |
| GET | `/sessions/join/:code` | Get session by join code |
| GET | `/sessions/:id` | Get session |
| POST | `/sessions/:id/participants` | Add participant (rate limit: 20/h) |
| PUT | `/sessions/:id/participants/:pid/apps` | Save participant's apps |
| GET | `/sessions/:id/results` | Results with overlap |
| POST | `/sessions/:id/send-result` | Send result email (rate limit: 100/h) |
| GET | `/apps` | List all apps |
