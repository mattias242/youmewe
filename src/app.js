'use strict';

const express = require('express');
const { rateLimit } = require('express-rate-limit');
const { appsRouter } = require('./routes/apps');
const { featuresRouter } = require('./routes/features');
const { appFeaturesRouter } = require('./routes/app-features');
const { sessionsRouter } = require('./routes/sessions');
const { participantsRouter } = require('./routes/participants');
const { preferencesRouter } = require('./routes/preferences');
const { recommendationsRouter } = require('./routes/recommendations');
const { participantAppsRouter } = require('./routes/participant-apps');
const { resultsRouter } = require('./routes/results');
const { sendResultRouter } = require('./routes/send-result');
const { bookingRouter } = require('./routes/booking');

const createSession   = rateLimit({ windowMs: 60 * 60 * 1000, limit: Number(process.env.RATE_CREATE  ?? 10),  message: { error: 'För många grupper skapade — försök igen om en timme.' } });
const joinSession     = rateLimit({ windowMs: 60 * 60 * 1000, limit: Number(process.env.RATE_JOIN    ?? 20),  message: { error: 'För många försök — försök igen om en timme.' } });
const sendResultLimit = rateLimit({ windowMs: 60 * 60 * 1000, limit: Number(process.env.RATE_EMAIL   ?? 100), message: { error: 'För många mejlutskick — försök igen om en timme.' } });
const bookingLimit    = rateLimit({ windowMs: 60 * 60 * 1000, limit: Number(process.env.RATE_BOOKING ?? 10),  message: { error: 'För många förfrågningar — försök igen om en timme.' } });

// CORS för bokningsformulärets externa origin. Sätts via BOOKING_ORIGIN i .env;
// utan den nekas cross-origin-anrop (inga CORS-headers sätts).
const BOOKING_ORIGIN = process.env.BOOKING_ORIGIN || '';
function corsBooking(req, res, next) {
  if (BOOKING_ORIGIN && req.headers.origin === BOOKING_ORIGIN) {
    res.setHeader('Access-Control-Allow-Origin', BOOKING_ORIGIN);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
}

function createApp(db) {
  const app = express();
  app.set('trust proxy', 1); // Caddy/nginx sätter X-Forwarded-For
  app.use(express.json());
  app.use(express.static('public'));

  // Bokningsförfrågan från extern formulär-origin (CORS + rate-limit). Registreras
  // före SPA-fallbacken så att OPTIONS/POST inte fångas av den.
  app.use('/api/booking', corsBooking, bookingLimit, bookingRouter());

  // SPA-fallback (Express 5-kompatibel syntax)
  app.get('/{*path}', (req, res, next) => {
    if (req.path.startsWith('/sessions') ||
        req.path.startsWith('/apps') ||
        req.path.startsWith('/features')) return next();
    const path = require('path');
    res.sendFile(path.join(__dirname, '../public/index.html'), (err) => {
      if (err) next();
    });
  });

  app.use('/apps', appsRouter(db));
  app.use('/apps/:appId/features', appFeaturesRouter(db));
  app.use('/features', featuresRouter(db));
  app.post('/sessions', createSession);
  app.use('/sessions', sessionsRouter(db));
  app.post('/sessions/:sessionId/participants', joinSession);
  app.use('/sessions/:sessionId/participants', participantsRouter(db));
  app.use('/sessions/:sessionId/participants/:participantId/apps', participantAppsRouter(db));
  app.use('/sessions/:sessionId/preferences', preferencesRouter(db));
  app.use('/sessions/:sessionId/recommend', recommendationsRouter(db));
  app.use('/sessions/:sessionId/results', resultsRouter(db));
  app.post('/sessions/:sessionId/send-result', sendResultLimit);
  app.use('/sessions/:sessionId/send-result', sendResultRouter(db));

  return app;
}

module.exports = { createApp };
