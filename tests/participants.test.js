'use strict';

const request = require('supertest');
const { createDb } = require('../src/db');
const { createApp } = require('../src/app');

let db;
let app;
let sessionId;

beforeEach(() => {
  db = createDb();
  app = createApp(db);
  sessionId = db.prepare('INSERT INTO sessions (name) VALUES (?)').run('Team A').lastInsertRowid;
});

afterEach(() => {
  db.close();
});

describe('GET /sessions/:id/participants', () => {
  it('returns empty array', async () => {
    const res = await request(app).get(`/sessions/${sessionId}/participants`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns participants for session', async () => {
    db.prepare('INSERT INTO participants (session_id, name) VALUES (?, ?)').run(sessionId, 'Alice');
    db.prepare('INSERT INTO participants (session_id, name) VALUES (?, ?)').run(sessionId, 'Bob');
    const res = await request(app).get(`/sessions/${sessionId}/participants`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it('returns 404 for missing session', async () => {
    const res = await request(app).get('/sessions/999/participants');
    expect(res.status).toBe(404);
  });
});

describe('POST /sessions/:id/participants', () => {
  it('adds participant', async () => {
    const res = await request(app)
      .post(`/sessions/${sessionId}/participants`)
      .send({ name: 'Alice' });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.name).toBe('Alice');
    expect(res.body.session_id).toBe(sessionId);
  });

  it('returns 400 when name missing', async () => {
    const res = await request(app).post(`/sessions/${sessionId}/participants`).send({});
    expect(res.status).toBe(400);
  });

  it('returns 404 for missing session', async () => {
    const res = await request(app).post('/sessions/999/participants').send({ name: 'X' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /sessions/:id/participants/:participantId', () => {
  it('removes participant', async () => {
    const info = db.prepare('INSERT INTO participants (session_id, name) VALUES (?, ?)').run(sessionId, 'Alice');
    const res = await request(app).delete(`/sessions/${sessionId}/participants/${info.lastInsertRowid}`);
    expect(res.status).toBe(204);
  });

  it('returns 404 when participant not in session', async () => {
    const res = await request(app).delete(`/sessions/${sessionId}/participants/999`);
    expect(res.status).toBe(404);
  });
});
