'use strict';

const request = require('supertest');
const { createDb } = require('../src/db');
const { createApp } = require('../src/app');

let db;
let app;
let sessionId;
let participantId;
let featureId;

beforeEach(() => {
  db = createDb();
  app = createApp(db);
  sessionId = db.prepare('INSERT INTO sessions (name) VALUES (?)').run('Team A').lastInsertRowid;
  participantId = db.prepare('INSERT INTO participants (session_id, name) VALUES (?, ?)').run(sessionId, 'Alice').lastInsertRowid;
  featureId = db.prepare('INSERT INTO features (name) VALUES (?)').run('E2E Encryption').lastInsertRowid;
});

afterEach(() => {
  db.close();
});

describe('GET /sessions/:id/preferences', () => {
  it('returns empty array', async () => {
    const res = await request(app).get(`/sessions/${sessionId}/preferences`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns preferences for session', async () => {
    db.prepare('INSERT INTO preferences (session_id, participant_id, feature_id, weight) VALUES (?, ?, ?, ?)')
      .run(sessionId, participantId, featureId, 3);
    const res = await request(app).get(`/sessions/${sessionId}/preferences`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].weight).toBe(3);
  });

  it('returns 404 for missing session', async () => {
    const res = await request(app).get('/sessions/999/preferences');
    expect(res.status).toBe(404);
  });
});

describe('POST /sessions/:id/preferences', () => {
  it('creates preference', async () => {
    const res = await request(app)
      .post(`/sessions/${sessionId}/preferences`)
      .send({ participant_id: participantId, feature_id: featureId, weight: 4 });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.weight).toBe(4);
    expect(res.body.participant_id).toBe(participantId);
    expect(res.body.feature_id).toBe(featureId);
  });

  it('returns 400 when required fields missing', async () => {
    const res = await request(app)
      .post(`/sessions/${sessionId}/preferences`)
      .send({ participant_id: participantId });
    expect(res.status).toBe(400);
  });

  it('returns 400 for weight out of range', async () => {
    const res = await request(app)
      .post(`/sessions/${sessionId}/preferences`)
      .send({ participant_id: participantId, feature_id: featureId, weight: 6 });
    expect(res.status).toBe(400);
  });

  it('returns 404 for missing session', async () => {
    const res = await request(app)
      .post('/sessions/999/preferences')
      .send({ participant_id: participantId, feature_id: featureId, weight: 3 });
    expect(res.status).toBe(404);
  });

  it('returns 404 for participant not in session', async () => {
    const otherSession = db.prepare('INSERT INTO sessions (name) VALUES (?)').run('Other').lastInsertRowid;
    const otherParticipant = db.prepare('INSERT INTO participants (session_id, name) VALUES (?, ?)').run(otherSession, 'Bob').lastInsertRowid;
    const res = await request(app)
      .post(`/sessions/${sessionId}/preferences`)
      .send({ participant_id: otherParticipant, feature_id: featureId, weight: 3 });
    expect(res.status).toBe(404);
  });

  it('updates weight on duplicate participant+feature', async () => {
    await request(app)
      .post(`/sessions/${sessionId}/preferences`)
      .send({ participant_id: participantId, feature_id: featureId, weight: 2 });
    const res = await request(app)
      .post(`/sessions/${sessionId}/preferences`)
      .send({ participant_id: participantId, feature_id: featureId, weight: 5 });
    expect(res.status).toBe(200);
    expect(res.body.weight).toBe(5);
  });
});
