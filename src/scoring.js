'use strict';

/**
 * Score a single app against a flat list of participant preferences.
 * @param {Set<number>} appFeatureIds - feature IDs the app supports
 * @param {Array<{feature_id: number, weight: number}>} preferences - all prefs for the session
 * @returns {number} total score (sum of weights for matched features)
 */
function scoreApp(appFeatureIds, preferences) {
  let score = 0;
  for (const pref of preferences) {
    if (appFeatureIds.has(pref.feature_id)) {
      score += pref.weight;
    }
  }
  return score;
}

/**
 * Rank apps by score descending.
 * @param {Array<{id: number, name: string, featureIds: Set<number>}>} apps
 * @param {Array<{feature_id: number, weight: number}>} preferences
 * @returns {Array<{app: object, score: number}>}
 */
function rankApps(apps, preferences) {
  return apps
    .map(app => ({ app, score: scoreApp(app.featureIds, preferences) }))
    .sort((a, b) => b.score - a.score);
}

module.exports = { scoreApp, rankApps };
