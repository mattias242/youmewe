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

describe('GET /sessions', () => {
  it('returns empty array', async () => {
    const res = await request(app).get('/sessions');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns all sessions', async () => {
    db.prepare('INSERT INTO sessions (name) VALUES (?)').run('Team A');
    db.prepare('INSERT INTO sessions (name) VALUES (?)').run('Team B');
    const res = await request(app).get('/sessions');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe('GET /sessions/:id', () => {
  it('returns 404 for missing session', async () => {
    const res = await request(app).get('/sessions/999');
    expect(res.status).toBe(404);
  });

  it('returns session by id', async () => {
    const info = db.prepare('INSERT INTO sessions (name) VALUES (?)').run('Team A');
    const res = await request(app).get(`/sessions/${info.lastInsertRowid}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Team A');
    expect(res.body.status).toBe('open');
  });
});

describe('POST /sessions', () => {
  it('creates a session', async () => {
    const res = await request(app).post('/sessions').send({ name: 'Dev Team' });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.name).toBe('Dev Team');
    expect(res.body.status).toBe('open');
  });

  it('returns 400 when name missing', async () => {
    const res = await request(app).post('/sessions').send({});
    expect(res.status).toBe(400);
  });
});

describe('PUT /sessions/:id', () => {
  it('updates session', async () => {
    const info = db.prepare('INSERT INTO sessions (name) VALUES (?)').run('Old Name');
    const res = await request(app)
      .put(`/sessions/${info.lastInsertRowid}`)
      .send({ name: 'New Name', status: 'closed' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('New Name');
    expect(res.body.status).toBe('closed');
  });

  it('returns 400 for invalid status', async () => {
    const info = db.prepare('INSERT INTO sessions (name) VALUES (?)').run('Test');
    const res = await request(app).put(`/sessions/${info.lastInsertRowid}`).send({ status: 'invalid' });
    expect(res.status).toBe(400);
  });

  it('returns 404 for missing session', async () => {
    const res = await request(app).put('/sessions/999').send({ name: 'X' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /sessions/:id', () => {
  it('deletes a session', async () => {
    const info = db.prepare('INSERT INTO sessions (name) VALUES (?)').run('ToDelete');
    const res = await request(app).delete(`/sessions/${info.lastInsertRowid}`);
    expect(res.status).toBe(204);
  });

  it('returns 404 for missing session', async () => {
    const res = await request(app).delete('/sessions/999');
    expect(res.status).toBe(404);
  });
});
