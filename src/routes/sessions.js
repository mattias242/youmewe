'use strict';

const { Router } = require('express');

const VALID_STATUSES = ['open', 'closed'];

function generateShareCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function sessionsRouter(db) {
  const router = Router();

  router.get('/', (req, res) => {
    const sessions = db.prepare('SELECT * FROM sessions ORDER BY id').all();
    res.json(sessions);
  });

  // Must be before /:id to avoid "join" being treated as an id
  router.get('/join/:code', (req, res) => {
    const session = db
      .prepare('SELECT * FROM sessions WHERE share_code = ?')
      .get(req.params.code);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  });

  router.get('/:id', (req, res) => {
    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  });

  router.post('/', (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    let share_code;
    let attempts = 0;
    while (attempts < 10) {
      share_code = generateShareCode();
      const existing = db
        .prepare('SELECT id FROM sessions WHERE share_code = ?')
        .get(share_code);
      if (!existing) break;
      attempts++;
    }

    const info = db
      .prepare('INSERT INTO sessions (name, share_code) VALUES (?, ?)')
      .run(name, share_code);
    const created = db
      .prepare('SELECT * FROM sessions WHERE id = ?')
      .get(info.lastInsertRowid);
    res.status(201).json(created);
  });

  router.put('/:id', (req, res) => {
    const existing = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Session not found' });
    const { name, status } = req.body;
    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
    }
    db.prepare(
      `UPDATE sessions SET
        name = COALESCE(?, name),
        status = COALESCE(?, status),
        updated_at = datetime('now')
      WHERE id = ?`
    ).run(name || null, status || null, req.params.id);
    const updated = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id);
    res.json(updated);
  });

  router.delete('/:id', (req, res) => {
    const info = db.prepare('DELETE FROM sessions WHERE id = ?').run(req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Session not found' });
    res.status(204).send();
  });

  return router;
}

module.exports = { sessionsRouter };
