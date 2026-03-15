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

describe('GET /apps', () => {
  it('returns empty array when no apps', async () => {
    const res = await request(app).get('/apps');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns all apps', async () => {
    db.prepare('INSERT INTO apps (name, description) VALUES (?, ?)').run('Slack', 'Team messaging');
    db.prepare('INSERT INTO apps (name) VALUES (?)').run('Discord');

    const res = await request(app).get('/apps');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].name).toBe('Slack');
    expect(res.body[1].name).toBe('Discord');
  });
});

describe('GET /apps/:id', () => {
  it('returns 404 for missing app', async () => {
    const res = await request(app).get('/apps/999');
    expect(res.status).toBe(404);
  });

  it('returns app by id', async () => {
    const info = db.prepare('INSERT INTO apps (name, description) VALUES (?, ?)').run('Slack', 'Team messaging');
    const res = await request(app).get(`/apps/${info.lastInsertRowid}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Slack');
    expect(res.body.description).toBe('Team messaging');
  });
});

describe('POST /apps', () => {
  it('creates a new app', async () => {
    const res = await request(app)
      .post('/apps')
      .send({ name: 'Signal', description: 'Private messenger', website_url: 'https://signal.org' });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.name).toBe('Signal');
    expect(res.body.description).toBe('Private messenger');
    expect(res.body.website_url).toBe('https://signal.org');
  });

  it('returns 400 when name is missing', async () => {
    const res = await request(app).post('/apps').send({ description: 'No name' });
    expect(res.status).toBe(400);
  });

  it('returns 409 on duplicate name', async () => {
    await request(app).post('/apps').send({ name: 'Slack' });
    const res = await request(app).post('/apps').send({ name: 'Slack' });
    expect(res.status).toBe(409);
  });
});

describe('PUT /apps/:id', () => {
  it('updates an app', async () => {
    const info = db.prepare('INSERT INTO apps (name) VALUES (?)').run('OldName');
    const res = await request(app)
      .put(`/apps/${info.lastInsertRowid}`)
      .send({ name: 'NewName', description: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('NewName');
    expect(res.body.description).toBe('Updated');
  });

  it('returns 404 for missing app', async () => {
    const res = await request(app).put('/apps/999').send({ name: 'X' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /apps/:id', () => {
  it('deletes an app', async () => {
    const info = db.prepare('INSERT INTO apps (name) VALUES (?)').run('ToDelete');
    const res = await request(app).delete(`/apps/${info.lastInsertRowid}`);
    expect(res.status).toBe(204);
    const check = db.prepare('SELECT * FROM apps WHERE id = ?').get(info.lastInsertRowid);
    expect(check).toBeUndefined();
  });

  it('returns 404 for missing app', async () => {
    const res = await request(app).delete('/apps/999');
    expect(res.status).toBe(404);
  });
});
