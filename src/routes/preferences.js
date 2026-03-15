'use strict';

const { Router } = require('express');

function preferencesRouter(db) {
  const router = Router({ mergeParams: true });

  router.get('/', (req, res) => {
    const session = db.prepare('SELECT id FROM sessions WHERE id = ?').get(req.params.sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    const preferences = db.prepare(
      'SELECT * FROM preferences WHERE session_id = ? ORDER BY id'
    ).all(req.params.sessionId);
    res.json(preferences);
  });

  router.post('/', (req, res) => {
    const session = db.prepare('SELECT id FROM sessions WHERE id = ?').get(req.params.sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const { participant_id, feature_id, weight } = req.body;

    if (!participant_id || !feature_id) {
      return res.status(400).json({ error: 'participant_id and feature_id are required' });
    }

    if (weight !== undefined && (typeof weight !== 'number' || weight < 1 || weight > 5)) {
      return res.status(400).json({ error: 'weight must be between 1 and 5' });
    }

    // Verify participant belongs to this session
    const participant = db.prepare(
      'SELECT id FROM participants WHERE id = ? AND session_id = ?'
    ).get(participant_id, req.params.sessionId);
    if (!participant) return res.status(404).json({ error: 'Participant not found in session' });

    const effectiveWeight = weight !== undefined ? weight : 1;

    // Upsert: update weight if combination already exists
    const existing = db.prepare(
      'SELECT * FROM preferences WHERE participant_id = ? AND feature_id = ?'
    ).get(participant_id, feature_id);

    if (existing) {
      db.prepare(
        `UPDATE preferences SET weight = ?, updated_at = datetime('now') WHERE id = ?`
      ).run(effectiveWeight, existing.id);
      const updated = db.prepare('SELECT * FROM preferences WHERE id = ?').get(existing.id);
      return res.status(200).json(updated);
    }

    try {
      const info = db.prepare(
        'INSERT INTO preferences (session_id, participant_id, feature_id, weight) VALUES (?, ?, ?, ?)'
      ).run(req.params.sessionId, participant_id, feature_id, effectiveWeight);
      const created = db.prepare('SELECT * FROM preferences WHERE id = ?').get(info.lastInsertRowid);
      res.status(201).json(created);
    } catch (err) {
      if (err.message.includes('CHECK')) return res.status(400).json({ error: 'weight must be between 1 and 5' });
      throw err;
    }
  });

  return router;
}

module.exports = { preferencesRouter };
