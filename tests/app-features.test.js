'use strict';

const request = require('supertest');
const { createDb } = require('../src/db');
const { createApp } = require('../src/app');

let db;
let app;
let appId;
let featureId;

beforeEach(() => {
  db = createDb();
  app = createApp(db);
  appId = db.prepare('INSERT INTO apps (name) VALUES (?)').run('Slack').lastInsertRowid;
  featureId = db.prepare('INSERT INTO features (name) VALUES (?)').run('E2E Encryption').lastInsertRowid;
});

afterEach(() => {
  db.close();
});

describe('GET /apps/:id/features', () => {
  it('returns empty array when no features', async () => {
    const res = await request(app).get(`/apps/${appId}/features`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns features for app', async () => {
    db.prepare('INSERT INTO app_features (app_id, feature_id) VALUES (?, ?)').run(appId, featureId);
    const res = await request(app).get(`/apps/${appId}/features`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('E2E Encryption');
  });

  it('returns 404 for missing app', async () => {
    const res = await request(app).get('/apps/999/features');
    expect(res.status).toBe(404);
  });
});

describe('POST /apps/:id/features', () => {
  it('adds feature to app', async () => {
    const res = await request(app)
      .post(`/apps/${appId}/features`)
      .send({ feature_id: featureId });
    expect(res.status).toBe(201);
    expect(res.body.app_id).toBe(appId);
    expect(res.body.feature_id).toBe(featureId);
  });

  it('returns 404 for missing app', async () => {
    const res = await request(app).post('/apps/999/features').send({ feature_id: featureId });
    expect(res.status).toBe(404);
  });

  it('returns 404 for missing feature', async () => {
    const res = await request(app).post(`/apps/${appId}/features`).send({ feature_id: 999 });
    expect(res.status).toBe(404);
  });

  it('returns 409 on duplicate', async () => {
    db.prepare('INSERT INTO app_features (app_id, feature_id) VALUES (?, ?)').run(appId, featureId);
    const res = await request(app).post(`/apps/${appId}/features`).send({ feature_id: featureId });
    expect(res.status).toBe(409);
  });
});

describe('DELETE /apps/:id/features/:featureId', () => {
  it('removes feature from app', async () => {
    db.prepare('INSERT INTO app_features (app_id, feature_id) VALUES (?, ?)').run(appId, featureId);
    const res = await request(app).delete(`/apps/${appId}/features/${featureId}`);
    expect(res.status).toBe(204);
  });

  it('returns 404 when not linked', async () => {
    const res = await request(app).delete(`/apps/${appId}/features/${featureId}`);
    expect(res.status).toBe(404);
  });
});
