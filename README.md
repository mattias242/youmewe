# YouMeWe

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)

Find the chat app your whole group already has. The organizer shares a link — each participant enters their name and selects which apps they have installed. The organizer sees the overlap instantly.

## Stack

- **Backend:** Node.js + Express 5 + SQLite (better-sqlite3)
- **Frontend:** React + Vite (SPA)
- **Email:** Nodemailer (e.g. Mailgun SMTP)
- **Deploy:** Docker (multi-stage build)

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

## Docker

```bash
docker-compose up -d --build
```

The app listens on port `3000` inside the container. Map it to whatever host port you prefer in `docker-compose.yml`.

## Environment variables (.env)

```env
SMTP_HOST=smtp.mailgun.org      # or any SMTP provider
SMTP_PORT=587
SMTP_USER=<your-smtp-user>
SMTP_PASS=<your-smtp-password>
SMTP_FROM=YouMeWe <noreply@yourdomain.com>
```

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
