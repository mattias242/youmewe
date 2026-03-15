'use strict';

const { Router } = require('express');

function resultsRouter(db) {
  const router = Router({ mergeParams: true });

  // GET /sessions/:sessionId/results
  router.get('/', (req, res) => {
    const session = db
      .prepare('SELECT * FROM sessions WHERE id = ?')
      .get(req.params.sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const participants = db
      .prepare('SELECT * FROM participants WHERE session_id = ? ORDER BY id')
      .all(req.params.sessionId);

    const apps = db.prepare('SELECT * FROM apps ORDER BY name').all();

    const results = apps
      .map(app => {
        const who = db
          .prepare(
            `SELECT p.id, p.name
             FROM participants p
             JOIN participant_apps pa ON pa.participant_id = p.id
             WHERE pa.app_id = ? AND p.session_id = ?
             ORDER BY p.id`
          )
          .all(app.id, req.params.sessionId);
        return { app, count: who.length, who };
      })
      .sort((a, b) => b.count - a.count);

    res.json({ session, participants, results });
  });

  return router;
}

module.exports = { resultsRouter };
