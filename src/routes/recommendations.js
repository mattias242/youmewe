'use strict';

const { Router } = require('express');
const { rankApps } = require('../scoring');

function recommendationsRouter(db) {
  const router = Router({ mergeParams: true });

  router.get('/', (req, res) => {
    const session = db.prepare('SELECT id FROM sessions WHERE id = ?').get(req.params.sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    // Fetch all apps with their supported feature IDs
    const apps = db.prepare('SELECT * FROM apps ORDER BY id').all();
    const appsWithFeatures = apps.map(app => {
      const rows = db.prepare(
        'SELECT feature_id FROM app_features WHERE app_id = ?'
      ).all(app.id);
      return { ...app, featureIds: new Set(rows.map(r => r.feature_id)) };
    });

    // Fetch all preferences for this session (across all participants)
    const preferences = db.prepare(
      'SELECT feature_id, weight FROM preferences WHERE session_id = ?'
    ).all(req.params.sessionId);

    const ranked = rankApps(appsWithFeatures, preferences);

    // Return without the Set (not JSON-serialisable)
    res.json(ranked.map(({ app, score }) => {
      const { featureIds: _, ...appData } = app;
      return { app: appData, score };
    }));
  });

  return router;
}

module.exports = { recommendationsRouter };
