'use strict';

const { Router } = require('express');

function appsRouter(db) {
  const router = Router();

  router.get('/', (req, res) => {
    const apps = db.prepare('SELECT * FROM apps ORDER BY id').all();
    res.json(apps);
  });

  router.get('/:id', (req, res) => {
    const app = db.prepare('SELECT * FROM apps WHERE id = ?').get(req.params.id);
    if (!app) return res.status(404).json({ error: 'App not found' });
    res.json(app);
  });

  router.post('/', (req, res) => {
    const { name, description, logo_url, website_url } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    try {
      const info = db.prepare(
        'INSERT INTO apps (name, description, logo_url, website_url) VALUES (?, ?, ?, ?)'
      ).run(name, description || null, logo_url || null, website_url || null);
      const created = db.prepare('SELECT * FROM apps WHERE id = ?').get(info.lastInsertRowid);
      res.status(201).json(created);
    } catch (err) {
      if (err.message.includes('UNIQUE')) return res.status(409).json({ error: 'App name already exists' });
      throw err;
    }
  });

  router.put('/:id', (req, res) => {
    const existing = db.prepare('SELECT * FROM apps WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'App not found' });
    const { name, description, logo_url, website_url } = req.body;
    try {
      db.prepare(
        `UPDATE apps SET
          name = COALESCE(?, name),
          description = COALESCE(?, description),
          logo_url = COALESCE(?, logo_url),
          website_url = COALESCE(?, website_url),
          updated_at = datetime('now')
        WHERE id = ?`
      ).run(name || null, description !== undefined ? description : null, logo_url || null, website_url || null, req.params.id);
      const updated = db.prepare('SELECT * FROM apps WHERE id = ?').get(req.params.id);
      res.json(updated);
    } catch (err) {
      if (err.message.includes('UNIQUE')) return res.status(409).json({ error: 'App name already exists' });
      throw err;
    }
  });

  router.delete('/:id', (req, res) => {
    const info = db.prepare('DELETE FROM apps WHERE id = ?').run(req.params.id);
    if (info.changes === 0) return res.status(404).json({ error: 'App not found' });
    res.status(204).send();
  });

  return router;
}

module.exports = { appsRouter };
