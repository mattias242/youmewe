'use strict';

const express = require('express');
const { appsRouter } = require('./routes/apps');
const { featuresRouter } = require('./routes/features');
const { appFeaturesRouter } = require('./routes/app-features');
const { sessionsRouter } = require('./routes/sessions');
const { participantsRouter } = require('./routes/participants');
const { preferencesRouter } = require('./routes/preferences');

function createApp(db) {
  const app = express();
  app.use(express.json());

  app.use('/apps', appsRouter(db));
  app.use('/apps/:appId/features', appFeaturesRouter(db));
  app.use('/features', featuresRouter(db));
  app.use('/sessions', sessionsRouter(db));
  app.use('/sessions/:sessionId/participants', participantsRouter(db));
  app.use('/sessions/:sessionId/preferences', preferencesRouter(db));

  return app;
}

module.exports = { createApp };
