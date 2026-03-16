'use strict';

require('dotenv').config();
const nodemailer = require('nodemailer');

function createTransport() {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const transport = createTransport();

async function sendResultEmail({ to, name, groupName, app }) {
  if (!transport) {
    console.warn('[mailer] SMTP ej konfigurerat — mejl skickas inte.');
    return { skipped: true };
  }

  const html = `
<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body { margin: 0; padding: 0; background: #0B0B0D; font-family: 'DM Mono', monospace, sans-serif; }
    .wrap { max-width: 480px; margin: 0 auto; padding: 40px 24px; }
    .logo { font-size: 22px; font-weight: 900; color: #F0EEE8; letter-spacing: -0.03em; margin-bottom: 40px; }
    .logo span { color: #F5A623; }
    .heading { font-size: 28px; font-weight: 700; color: #F0EEE8; margin: 0 0 8px; line-height: 1.2; }
    .sub { font-size: 14px; color: #5A5A6A; margin: 0 0 32px; }
    .card { background: #141417; border: 1px solid rgba(245,166,35,0.30); border-radius: 12px; padding: 20px 24px; margin-bottom: 32px; }
    .app-name { font-size: 20px; font-weight: 700; color: #F0EEE8; margin: 0 0 6px; }
    .app-desc { font-size: 13px; color: #5A5A6A; margin: 0 0 16px; line-height: 1.5; }
    .app-link { display: inline-block; background: #F5A623; color: #0B0B0D; font-size: 13px; font-weight: 600;
                letter-spacing: 0.06em; text-transform: uppercase; text-decoration: none;
                padding: 12px 24px; border-radius: 8px; }
    .footer { font-size: 12px; color: #3A3A45; margin-top: 40px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="logo">You<span>Me</span>We</div>
    <h1 class="heading">${groupName} kör med ${app.name}!</h1>
    <p class="sub">Hej ${name} — gruppen har bestämt sig.</p>
    <div class="card">
      <p class="app-name">${app.name}</p>
      <p class="app-desc">${app.description || ''}</p>
      ${app.website_url
        ? `<a class="app-link" href="${app.website_url}">Öppna ${app.name}</a>`
        : ''}
    </div>
    <p class="footer">Skickat via YouMeWe — hitta gruppens chattapp.</p>
  </div>
</body>
</html>`;

  return transport.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: `${groupName} kör med ${app.name}! 🎉`,
    html,
  });
}

module.exports = { sendResultEmail };
