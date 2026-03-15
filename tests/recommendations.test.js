'use strict';

const request = require('supertest');
const { createApp } = require('../src/app');
const { createDb } = require('../src/db');
const { seed } = require('../src/seed');

// ─── RED: Recommendation endpoint tests ───────────────────────────────────────

let app, db;

beforeEach(() => {
  db = createDb();
  seed(db);
  app = createApp(db);
});

// ── GET /sessions/:id/recommend ───────────────────────────────────────────────

describe('GET /sessions/:sessionId/recommend', () => {
  let sessionId, participantId;

  beforeEach(() => {
    const session = db.prepare("INSERT INTO sessions (name) VALUES ('Test Group')").run();
    sessionId = session.lastInsertRowid;
    const participant = db.prepare(
      'INSERT INTO participants (session_id, name) VALUES (?, ?)'
    ).run(sessionId, 'Alice');
    participantId = participant.lastInsertRowid;
  });

  test('returns 404 for unknown session', async () => {
    const res = await request(app).get('/sessions/9999/recommend');
    expect(res.status).toBe(404);
  });

  test('returns ranked apps with scores', async () => {
    // Alice wants E2E encryption above all
    const e2eFeature = db.prepare("SELECT id FROM features WHERE name = 'E2E Encryption'").get();
    db.prepare(
      'INSERT INTO preferences (session_id, participant_id, feature_id, weight) VALUES (?, ?, ?, ?)'
    ).run(sessionId, participantId, e2eFeature.id, 5);

    const res = await request(app).get(`/sessions/${sessionId}/recommend`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('ranked apps are sorted highest score first', async () => {
    const e2eFeature = db.prepare("SELECT id FROM features WHERE name = 'E2E Encryption'").get();
    db.prepare(
      'INSERT INTO preferences (session_id, participant_id, feature_id, weight) VALUES (?, ?, ?, ?)'
    ).run(sessionId, participantId, e2eFeature.id, 5);

    const res = await request(app).get(`/sessions/${sessionId}/recommend`);
    for (let i = 1; i < res.body.length; i++) {
      expect(res.body[i].score).toBeLessThanOrEqual(res.body[i - 1].score);
    }
  });

  test('each result contains app info and score', async () => {
    const res = await request(app).get(`/sessions/${sessionId}/recommend`);
    expect(res.status).toBe(200);
    const item = res.body[0];
    expect(item).toHaveProperty('app');
    expect(item).toHaveProperty('score');
    expect(item.app).toHaveProperty('id');
    expect(item.app).toHaveProperty('name');
  });

  test('all scores 0 when session has no preferences', async () => {
    const res = await request(app).get(`/sessions/${sessionId}/recommend`);
    expect(res.status).toBe(200);
    expect(res.body.every(r => r.score === 0)).toBe(true);
  });

  test('Element ranks first for privacy-focused group', async () => {
    const features = ['E2E Encryption', 'Open Source', 'No Phone Required'].map(name =>
      db.prepare('SELECT id FROM features WHERE name = ?').get(name)
    );
    for (const f of features) {
      db.prepare(
        'INSERT INTO preferences (session_id, participant_id, feature_id, weight) VALUES (?, ?, ?, ?)'
      ).run(sessionId, participantId, f.id, 5);
    }
    const res = await request(app).get(`/sessions/${sessionId}/recommend`);
    expect(res.body[0].app.name).toBe('Element');
  });

  test('scores aggregate across multiple participants', async () => {
    const participant2 = db.prepare(
      'INSERT INTO participants (session_id, name) VALUES (?, ?)'
    ).run(sessionId, 'Bob');
    const e2e = db.prepare("SELECT id FROM features WHERE name = 'E2E Encryption'").get();

    // Both Alice and Bob want E2E — combined weight should be higher than just one
    db.prepare(
      'INSERT INTO preferences (session_id, participant_id, feature_id, weight) VALUES (?, ?, ?, ?)'
    ).run(sessionId, participantId, e2e.id, 5);
    db.prepare(
      'INSERT INTO preferences (session_id, participant_id, feature_id, weight) VALUES (?, ?, ?, ?)'
    ).run(sessionId, participant2.lastInsertRowid, e2e.id, 3);

    const res = await request(app).get(`/sessions/${sessionId}/recommend`);
    // Signal has E2E so its score should reflect both weights summed (8)
    const signal = res.body.find(r => r.app.name === 'Signal');
    expect(signal.score).toBe(8);
  });
});
