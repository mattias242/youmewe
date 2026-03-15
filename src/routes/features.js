'use strict';

const { Router } = require('express');

function featuresRouter(db) {
  const router = Router();

  router.get('/', (req, res) => {
    const features = db.prepare('SELECT * FROM features ORDER BY id').all();
    res.json(features);
  });

  router.get('/:id', (req, res) => {
    const feature = db.prepare('SELECT * FROM features WHERE id = ?').get(req.params.id);
    if (!feature) return res.status(404).json({ error: 'Feature not found' });
    res.json(feature);
  });

  router.post('/', (req, res) => {
    const { name, description, category } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    try {
      const info = db.prepare(
        'INSERT INTO features (name, description, category) VALUES (?, ?, ?)'
      ).run(name, description || null, category || null);
      const created = db.prepare('SELECT * FROM features WHERE id = ?').get(info.lastInsertRowid);
      res.status(201).json(created);
    } catch (err) {
      if (err.message.includes('UNIQUE')) return res.status(409).json({ error: 'Feature name already exists' });
      throw err;
    }
  });

  router.put('/:id', (req, res) => {
    const existing = db.prepare('SELECT * FROM features WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Feature not found' });
    const { name, description, category } = req.body;
    try {
      db.prepare(
        `UPDATE features SET
          name = COALESCE(?, name),
          description = COALESCE(?, description),
          category = COALESCE(?, category),
          updated_at = datetime('now')
        WHERE id = ?`
      ).run(name || null, description !== undefined ? description : null, category || null, req.params.id);
      const updated = db.prepare('SELECT * FROM features WHERE id = ?').get(req.params.id);
      res.json(updated);
    } catch (err) {
      if (err.message.includes('UNIQUE')) return res.status(409).json({ error: 'Feature name already exists' });
      throw err;
    }
  });

  router.delete('/:id', (req, res) => {
    const info = db.prepare('DELETE FROM features WHERE id = ?').run(req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Feature not found' });
    res.status(204).send();
  });

  return router;
}

module.exports = { featuresRouter };
