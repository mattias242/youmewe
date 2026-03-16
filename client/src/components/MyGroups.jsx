import { useState } from 'react';
import { getGroups, removeGroup } from '../groups';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('sv-SE', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function MyGroups({ onNew }) {
  const [groups, setGroups] = useState(getGroups);

  const organizers  = groups.filter((g) => g.type === 'organizer');
  const participant = groups.filter((g) => g.type === 'participant');

  function handleRemove(type, sessionId) {
    removeGroup(type, sessionId);
    setGroups(getGroups());
  }

  return (
    <>
      <button className="btn-primary" onClick={onNew} style={{ marginBottom: 36 }}>
        + Skapa ny grupp
      </button>

      {organizers.length > 0 && (
        <>
          <p className="pref-label" style={{ marginBottom: 12 }}>Dina grupper</p>
          {organizers.map((g) => (
            <div key={g.sessionId} className="my-group-card">
              <a href={`?mine=${g.sessionId}`} className="my-group-name">{g.name}</a>
              <div className="my-group-meta">
                <span className="chip" style={{ background: 'var(--accent-dim)', borderColor: 'rgba(245,166,35,.25)', color: 'var(--accent)' }}>
                  Arrangör
                </span>
                <span className="my-group-date">{formatDate(g.created_at)}</span>
              </div>
              <button className="my-group-remove" onClick={() => handleRemove('organizer', g.sessionId)} aria-label="Ta bort">×</button>
            </div>
          ))}
        </>
      )}

      {participant.length > 0 && (
        <>
          <p className="pref-label" style={{ marginBottom: 12, marginTop: organizers.length ? 28 : 0 }}>
            Du har deltagit i
          </p>
          {participant.map((g) => (
            <div key={g.sessionId} className="my-group-card">
              <a href={`?view=${g.sessionId}`} className="my-group-name">{g.sessionName}</a>
              <div className="my-group-meta">
                <span className="chip">som {g.participantName}</span>
                <span className="my-group-date">{formatDate(g.created_at)}</span>
              </div>
              <button className="my-group-remove" onClick={() => handleRemove('participant', g.sessionId)} aria-label="Ta bort">×</button>
            </div>
          ))}
        </>
      )}

      {groups.length === 0 && (
        <p className="status-text" style={{ paddingTop: 20 }}>
          Inga grupper än. Skapa din första!
        </p>
      )}
    </>
  );
}
