'use strict';

const { Router } = require('express');

function appFeaturesRouter(db) {
  const router = Router({ mergeParams: true });

  router.get('/', (req, res) => {
    const app = db.prepare('SELECT id FROM apps WHERE id = ?').get(req.params.appId);
    if (!app) return res.status(404).json({ error: 'App not found' });
    const features = db.prepare(
      `SELECT f.* FROM features f
       JOIN app_features af ON af.feature_id = f.id
       WHERE af.app_id = ?
       ORDER BY f.id`
    ).all(req.params.appId);
    res.json(features);
  });

  router.post('/', (req, res) => {
    const app = db.prepare('SELECT id FROM apps WHERE id = ?').get(req.params.appId);
    if (!app) return res.status(404).json({ error: 'App not found' });
    const { feature_id } = req.body;
    const feature = db.prepare('SELECT id FROM features WHERE id = ?').get(feature_id);
    if (!feature) return res.status(404).json({ error: 'Feature not found' });
    try {
      db.prepare('INSERT INTO app_features (app_id, feature_id) VALUES (?, ?)').run(req.params.appId, feature_id);
      res.status(201).json({ app_id: Number(req.params.appId), feature_id: Number(feature_id) });
    } catch (err) {
      if (err.message.includes('UNIQUE')) return res.status(409).json({ error: 'Feature already linked to app' });
      throw err;
    }
  });

  router.delete('/:featureId', (req, res) => {
    const info = db.prepare(
      'DELETE FROM app_features WHERE app_id = ? AND feature_id = ?'
    ).run(req.params.appId, req.params.featureId);
    if (info.changes === 0) return res.status(404).json({ error: 'Link not found' });
    res.status(204).send();
  });

  return router;
}

module.exports = { appFeaturesRouter };
