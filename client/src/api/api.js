async function apiFetch(path, options = {}) {
  const res = await fetch(path, options);
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
  return body;
}

export const createSession = (name) =>
  apiFetch('/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });

export const addParticipant = (sessionId, name) =>
  apiFetch(`/sessions/${sessionId}/participants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });

export const getFeatures = () => apiFetch('/features');

export const savePreference = (sessionId, participantId, featureId, weight) =>
  apiFetch(`/sessions/${sessionId}/preferences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ participant_id: participantId, feature_id: featureId, weight }),
  });

export const getRecommendations = (sessionId) =>
  apiFetch(`/sessions/${sessionId}/recommend`);
