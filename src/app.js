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

const createSession   = rateLimit({ windowMs: 60 * 60 * 1000, limit: 10,  message: { error: 'För många grupper skapade — försök igen om en timme.' } });
const joinSession     = rateLimit({ windowMs: 60 * 60 * 1000, limit: 20,  message: { error: 'För många försök — försök igen om en timme.' } });
const sendResultLimit = rateLimit({ windowMs: 60 * 60 * 1000, limit: 100, message: { error: 'För många mejlutskick — försök igen om en timme.' } });

function createApp(db) {
  const app = express();
  app.set('trust proxy', 1); // Caddy/nginx sätter X-Forwarded-For
  app.use(express.json());
  app.use(express.static('public'));

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
