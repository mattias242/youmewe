'use strict';

const { scoreApp, rankApps } = require('../src/scoring');

// ─── RED: Tests written before any implementation ─────────────────────────────

describe('scoreApp', () => {
  const signalFeatures = new Set([1, 3]); // e2e=1, voiceCalls=3

  test('returns 0 when preferences list is empty', () => {
    expect(scoreApp(signalFeatures, [])).toBe(0);
  });

  test('scores weight when feature present', () => {
    const prefs = [{ feature_id: 1, weight: 5 }];
    expect(scoreApp(signalFeatures, prefs)).toBe(5);
  });

  test('scores 0 when feature absent', () => {
    const appFeatures = new Set([2]); // openSource only
    const prefs = [{ feature_id: 1, weight: 5 }]; // wants e2e
    expect(scoreApp(appFeatures, prefs)).toBe(0);
  });

  test('aggregates multiple features', () => {
    const prefs = [
      { feature_id: 1, weight: 5 },
      { feature_id: 3, weight: 3 },
    ];
    expect(scoreApp(signalFeatures, prefs)).toBe(8);
  });

  test('only scores matched features, not all', () => {
    const prefs = [
      { feature_id: 1, weight: 5 },
      { feature_id: 2, weight: 4 }, // not in signalFeatures
    ];
    expect(scoreApp(signalFeatures, prefs)).toBe(5);
  });
});

describe('rankApps', () => {
  const apps = [
    { id: 1, name: 'Signal', featureIds: new Set([1, 3]) },
    { id: 2, name: 'Telegram', featureIds: new Set([3, 4, 5]) },
    { id: 3, name: 'Element', featureIds: new Set([1, 2, 3]) },
  ];

  test('returns empty array for empty app list', () => {
    expect(rankApps([], [])).toEqual([]);
  });

  test('returns apps sorted highest score first', () => {
    const prefs = [
      { feature_id: 1, weight: 5 }, // e2e
      { feature_id: 2, weight: 4 }, // openSource
    ];
    const ranked = rankApps(apps, prefs);
    expect(ranked[0].app.id).toBe(3); // Element has both
    expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
  });

  test('all apps get 0 score when preferences empty', () => {
    const ranked = rankApps(apps, []);
    expect(ranked.every(r => r.score === 0)).toBe(true);
    expect(ranked).toHaveLength(3);
  });
});
