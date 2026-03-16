'use strict';

const { Router } = require('express');

function participantsRouter(db) {
  const router = Router({ mergeParams: true });

  router.get('/', (req, res) => {
    const session = db.prepare('SELECT id FROM sessions WHERE id = ?').get(req.params.sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    const participants = db.prepare(
      'SELECT * FROM participants WHERE session_id = ? ORDER BY id'
    ).all(req.params.sessionId);
    res.json(participants);
  });

  router.post('/', (req, res) => {
    const session = db.prepare('SELECT id FROM sessions WHERE id = ?').get(req.params.sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    const { name, email } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const info = db.prepare(
      'INSERT INTO participants (session_id, name, email) VALUES (?, ?, ?)'
    ).run(req.params.sessionId, name, email || null);
    const created = db.prepare('SELECT * FROM participants WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(created);
  });

  router.delete('/:participantId', (req, res) => {
    const info = db.prepare(
      'DELETE FROM participants WHERE id = ? AND session_id = ?'
    ).run(req.params.participantId, req.params.sessionId);
    if (info.changes === 0) return res.status(404).json({ error: 'Participant not found in session' });
    res.status(204).send();
  });

  return router;
}

module.exports = { participantsRouter };
