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

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

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
    <h1 class="heading">${esc(groupName)} kör med ${esc(app.name)}!</h1>
    <p class="sub">Hej ${esc(name)} — gruppen har bestämt sig.</p>
    <div class="card">
      <p class="app-name">${esc(app.name)}</p>
      <p class="app-desc">${esc(app.description)}</p>
      ${app.website_url
        ? `<a class="app-link" href="${esc(app.website_url)}">Öppna ${esc(app.name)}</a>`
        : ''}
    </div>
    <p class="footer">Skickat via YouMeWe — hitta gruppens chattapp.</p>
  </div>
</body>
</html>`;

  return transport.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: `${esc(groupName)} kör med ${esc(app.name)}! 🎉`,
    html,
  });
}

async function sendBookingRequest({ name, phone, email, message, day }) {
  if (!transport) {
    console.warn('[mailer] SMTP ej konfigurerat — mejl skickas inte.');
    return { skipped: true };
  }
  const to = process.env.BOOKING_TO;
  if (!to) {
    console.warn('[mailer] BOOKING_TO ej satt — bokningsmejl skickas inte.');
    return { skipped: true };
  }

  const html = `
<!DOCTYPE html>
<html lang="sv">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:24px;background:#f4f6f9;font-family:system-ui,sans-serif;color:#14202e;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #e1e7f0;border-radius:12px;padding:24px;">
    <h2 style="margin:0 0 4px;font-size:18px;">Ny bokningsförfrågan</h2>
    <p style="margin:0 0 18px;color:#5a677b;font-size:14px;">Önskad dag: <strong>${esc(day)}</strong></p>
    <table style="border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:4px 14px 4px 0;color:#5a677b;">Namn</td><td>${esc(name)}</td></tr>
      <tr><td style="padding:4px 14px 4px 0;color:#5a677b;">Telefon</td><td>${esc(phone)}</td></tr>
      <tr><td style="padding:4px 14px 4px 0;color:#5a677b;">Mejl</td><td><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
    </table>
    <p style="margin:18px 0 4px;color:#5a677b;font-size:14px;">Om mötet:</p>
    <p style="margin:0;white-space:pre-wrap;font-size:14px;line-height:1.5;">${esc(message)}</p>
  </div>
  <p style="max-width:520px;margin:14px auto 0;color:#97a2b4;font-size:11px;">Skickat via bokningsformuläret.</p>
</body>
</html>`;

  return transport.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    replyTo: email,
    subject: `Ny bokningsförfrågan – ${day} (${name})`,
    html,
  });
}

module.exports = { sendResultEmail, sendBookingRequest };
