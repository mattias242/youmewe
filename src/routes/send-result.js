'use strict';

const { Router } = require('express');
const { sendResultEmail } = require('../mailer');

function sendResultRouter(db) {
  const router = Router({ mergeParams: true });

  // POST /sessions/:sessionId/send-result
  // Body: { app_id: number }
  router.post('/', async (req, res) => {
    const session = db
      .prepare('SELECT * FROM sessions WHERE id = ?')
      .get(req.params.sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const { app_id } = req.body;
    if (!app_id) return res.status(400).json({ error: 'app_id is required' });

    const app = db.prepare('SELECT * FROM apps WHERE id = ?').get(app_id);
    if (!app) return res.status(404).json({ error: 'App not found' });

    const participants = db
      .prepare("SELECT * FROM participants WHERE session_id = ? AND email IS NOT NULL AND email != ''")
      .all(req.params.sessionId);

    const results = await Promise.allSettled(
      participants.map((p) =>
        sendResultEmail({
          to: p.email,
          name: p.name,
          groupName: session.name,
          app,
        })
      )
    );

    const sent = results.filter((r) => r.status === 'fulfilled' && !r.value?.skipped).length;
    const skipped = results.filter((r) => r.status === 'fulfilled' && r.value?.skipped).length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    res.json({ sent, skipped, failed, total: participants.length });
  });

  return router;
}

module.exports = { sendResultRouter };
