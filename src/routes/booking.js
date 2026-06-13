'use strict';

const { Router } = require('express');
const { sendBookingRequest } = require('../mailer');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/booking
// Body: { name, phone, email, message, day, website? }
// Tar emot en bokningsförfrågan och mejlar mottagaren (BOOKING_TO).
// `website` är ett honeypot-fält — ifyllt = bot → tyst avvisning.
function bookingRouter() {
  const router = Router();

  router.post('/', async (req, res) => {
    const { name, phone, email, message, day, website } = req.body || {};

    if (website) return res.json({ ok: true }); // honeypot

    if (!name || !phone || !email || !message || !day) {
      return res.status(400).json({ error: 'Alla fält krävs.' });
    }
    if (!EMAIL_RE.test(String(email))) {
      return res.status(400).json({ error: 'Ogiltig e-postadress.' });
    }

    try {
      const r = await sendBookingRequest({
        name: String(name).slice(0, 200),
        phone: String(phone).slice(0, 60),
        email: String(email).slice(0, 200),
        message: String(message).slice(0, 4000),
        day: String(day).slice(0, 120),
      });
      if (r && r.skipped) {
        return res.status(503).json({ error: 'Mejl är inte konfigurerat på servern.' });
      }
      return res.json({ ok: true });
    } catch (e) {
      console.error('[booking] sändning misslyckades:', e.message);
      return res.status(502).json({ error: 'Kunde inte skicka förfrågan just nu.' });
    }
  });

  return router;
}

module.exports = { bookingRouter };
