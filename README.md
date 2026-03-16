# YouMeWe

Hitta gruppens gemensamma chattapp. Skaparen delar en länk — varje deltagare anger sitt namn och vilka appar de redan har installerade. Skaparen ser överlappet direkt.

## Stack

- **Backend:** Node.js + Express 5 + SQLite (better-sqlite3)
- **Frontend:** React + Vite (SPA)
- **Mejl:** Nodemailer via Mailgun EU SMTP
- **Deploy:** Docker (multi-stage build), Synology NAS

## Flöde

1. Skaparen anger gruppnamn → får en delbar länk (`?join=<kod>`)
2. Varje deltagare öppnar länken, anger namn + mejl (valfri) + väljer installerade appar
3. Skaparen ser resultaten live via `?mine=<id>` — vilka appar flest har gemensamt
4. Skaparen kan skicka ett transaktionsmejl till alla med valt resultat

## Lokal utveckling

```bash
# Backend
npm install
npm run dev          # nodemon på port 3000

# Frontend (separat terminal)
cd client
npm install
npm run dev          # Vite på port 5173 (proxy → 3000)
```

## Deploy till NAS

```bash
# Paketera och skicka
tar --exclude='node_modules' --exclude='client/node_modules' \
    --exclude='client/dist' --exclude='.git' --exclude='*.db' \
    -czf /tmp/youmewe.tar.gz .
scp -O /tmp/youmewe.tar.gz mattiaswahlberg@your-nas-host:/path/to/deploy/

# Extrahera och bygg på NAS
ssh mattiaswahlberg@your-nas-host "
  cd /path/to/deploy
  tar -xzf youmewe.tar.gz --overwrite && rm youmewe.tar.gz
  /var/packages/ContainerManager/target/usr/bin/docker-compose up -d --build
"
```

## Miljövariabler (.env)

```env
SMTP_HOST=smtp.eu.mailgun.org
SMTP_PORT=587
SMTP_USER=<mailgun-user>
SMTP_PASS=<mailgun-password>
SMTP_FROM=YouMeWe <noreply@yourdomain.com>
```

## NAS-konfiguration

- **Deploy-path:** `/path/to/deploy`
- **Container-port:** `3456` → `3000`
- **Databas:** Docker-volym `youmewe_youmewe-data` → `/data/youmewe.db`
- **URL:** https://youmewe.neomeda.se
- **Reverse proxy:** DSM Control Panel → Login Portal → Advanced

## API-rutter

| Metod | Sökväg | Beskrivning |
|-------|--------|-------------|
| POST | `/sessions` | Skapa session (rate limit: 10/h) |
| GET | `/sessions/join/:code` | Hämta session via join-kod |
| GET | `/sessions/:id` | Hämta session |
| POST | `/sessions/:id/participants` | Lägg till deltagare (rate limit: 20/h) |
| PUT | `/sessions/:id/participants/:pid/apps` | Spara deltagarens appar |
| GET | `/sessions/:id/results` | Resultat med överlapp |
| POST | `/sessions/:id/send-result` | Skicka mejl (rate limit: 100/h) |
| GET | `/apps` | Lista alla appar |
