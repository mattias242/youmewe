'use strict';

const { Router } = require('express');

function participantAppsRouter(db) {
  const router = Router({ mergeParams: true });

  // GET /sessions/:sessionId/participants/:participantId/apps
  router.get('/', (req, res) => {
    const rows = db
      .prepare(
        `SELECT a.* FROM apps a
         JOIN participant_apps pa ON pa.app_id = a.id
         WHERE pa.participant_id = ?`
      )
      .all(req.params.participantId);
    res.json(rows);
  });

  // PUT /sessions/:sessionId/participants/:participantId/apps
  // Body: { app_ids: [1, 3, 5] }
  router.put('/', (req, res) => {
    const participantId = Number(req.params.participantId);
    const appIds = Array.isArray(req.body.app_ids) ? req.body.app_ids : [];

    const del = db.prepare('DELETE FROM participant_apps WHERE participant_id = ?');
    const ins = db.prepare(
      'INSERT INTO participant_apps (participant_id, app_id) VALUES (?, ?)'
    );

    db.transaction(() => {
      del.run(participantId);
      for (const id of appIds) {
        ins.run(participantId, id);
      }
    })();

    res.json({ ok: true });
  });

  return router;
}

module.exports = { participantAppsRouter };
