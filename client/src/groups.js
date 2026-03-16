const KEY = 'youmewe_groups';

export function getGroups() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch { return []; }
}

export function saveGroup(entry) {
  const existing = getGroups().filter(
    (g) => !(g.type === entry.type && g.sessionId === entry.sessionId)
  );
  localStorage.setItem(KEY, JSON.stringify([entry, ...existing]));
}

export function removeGroup(type, sessionId) {
  const filtered = getGroups().filter(
    (g) => !(g.type === type && g.sessionId === sessionId)
  );
  localStorage.setItem(KEY, JSON.stringify(filtered));
}
