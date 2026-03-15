'use strict';

const request = require('supertest');
const { createDb } = require('../src/db');
const { createApp } = require('../src/app');

let db;
let app;

beforeEach(() => {
  db = createDb();
  app = createApp(db);
});

afterEach(() => {
  db.close();
});

describe('GET /features', () => {
  it('returns empty array', async () => {
    const res = await request(app).get('/features');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns all features', async () => {
    db.prepare('INSERT INTO features (name, category) VALUES (?, ?)').run('E2E Encryption', 'security');
    db.prepare('INSERT INTO features (name) VALUES (?)').run('Voice Calls');
    const res = await request(app).get('/features');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe('GET /features/:id', () => {
  it('returns 404 for missing feature', async () => {
    const res = await request(app).get('/features/999');
    expect(res.status).toBe(404);
  });

  it('returns feature by id', async () => {
    const info = db.prepare('INSERT INTO features (name, category) VALUES (?, ?)').run('E2E Encryption', 'security');
    const res = await request(app).get(`/features/${info.lastInsertRowid}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('E2E Encryption');
    expect(res.body.category).toBe('security');
  });
});

describe('POST /features', () => {
  it('creates a feature', async () => {
    const res = await request(app)
      .post('/features')
      .send({ name: 'File Sharing', category: 'collaboration', description: 'Share files' });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.name).toBe('File Sharing');
  });

  it('returns 400 when name missing', async () => {
    const res = await request(app).post('/features').send({ category: 'security' });
    expect(res.status).toBe(400);
  });

  it('returns 409 on duplicate', async () => {
    await request(app).post('/features').send({ name: 'Threads' });
    const res = await request(app).post('/features').send({ name: 'Threads' });
    expect(res.status).toBe(409);
  });
});

describe('PUT /features/:id', () => {
  it('updates a feature', async () => {
    const info = db.prepare('INSERT INTO features (name) VALUES (?)').run('Old');
    const res = await request(app).put(`/features/${info.lastInsertRowid}`).send({ name: 'New', category: 'ux' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('New');
  });

  it('returns 404 for missing', async () => {
    const res = await request(app).put('/features/999').send({ name: 'X' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /features/:id', () => {
  it('deletes a feature', async () => {
    const info = db.prepare('INSERT INTO features (name) VALUES (?)').run('ToDelete');
    const res = await request(app).delete(`/features/${info.lastInsertRowid}`);
    expect(res.status).toBe(204);
  });

  it('returns 404 for missing', async () => {
    const res = await request(app).delete('/features/999');
    expect(res.status).toBe(404);
  });
});
