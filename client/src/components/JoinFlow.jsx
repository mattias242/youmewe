import { useState, useEffect } from 'react';
import { getSessionByCode, addParticipant, getApps, saveParticipantApps } from '../api/api';
import { saveGroup } from '../groups';

const REJOIN_KEY = (code) => `youmewe_join_${code}`;

export default function JoinFlow({ joinCode }) {
  const [session, setSession] = useState(null);
  const [apps, setApps] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [step, setStep] = useState('loading');

  const [participantName, setParticipantName] = useState('');
  const [participantEmail, setParticipantEmail] = useState('');
  const [nameError, setNameError] = useState('');
  const [selectedAppIds, setSelectedAppIds] = useState(new Set());
  const [participant, setParticipant] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([getSessionByCode(joinCode), getApps()])
      .then(([sess, appList]) => {
        setSession(sess);
        setApps(appList);
        try {
          const saved = JSON.parse(localStorage.getItem(REJOIN_KEY(joinCode)));
          if (saved) {
            setParticipant({ id: saved.participantId, name: saved.participantName });
            setSelectedAppIds(new Set(saved.selectedAppIds));
            setStep('done');
            return;
          }
        } catch (_) {}
        setStep('name');
      })
      .catch((e) => {
        setLoadError(e.message);
        setStep('error');
      });
  }, [joinCode]);

  async function handleJoin() {
    if (!participantName.trim()) {
      setNameError('Skriv in ditt namn.');
      return;
    }
    setNameError('');
    const p = await addParticipant(session.id, participantName.trim(), participantEmail.trim());
    setParticipant(p);
    setStep('apps');
  }

  function toggleApp(id) {
    setSelectedAppIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await saveParticipantApps(session.id, participant.id, Array.from(selectedAppIds));
      saveGroup({ type: 'participant', sessionId: session.id, sessionName: session.name, participantName: participant.name, created_at: new Date().toISOString() });
      localStorage.setItem(REJOIN_KEY(joinCode), JSON.stringify({
        participantId: participant.id,
        participantName: participant.name,
        selectedAppIds: Array.from(selectedAppIds),
      }));
      setStep('done');
    } finally {
      setSubmitting(false);
    }
  }

  if (step === 'loading') return <p className="status-text">Laddar…</p>;
  if (step === 'error')   return <p className="status-text">{loadError}</p>;

  if (step === 'name') {
    return (
      <>
        <p className="section-title">{session.name}</p>
        <p className="section-sub">Du är inbjuden! Skriv in ditt namn för att börja.</p>
        <input
          type="text"
          placeholder="Ditt namn"
          value={participantName}
          onChange={(e) => setParticipantName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
          autoFocus
        />
        <input
          type="email"
          placeholder="Din mejladress (valfri)"
          value={participantEmail}
          onChange={(e) => setParticipantEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
        />
        {nameError && <p role="alert" className="error-msg">{nameError}</p>}
        <button className="btn-primary" onClick={handleJoin}>Fortsätt</button>
      </>
    );
  }

  if (step === 'apps') {
    return (
      <>
        <p className="pref-label">Hej, {participant.name}!</p>
        <p className="section-title">Vilka appar har du?</p>
        <p className="section-sub">
          Tryck på alla appar du redan har installerade.
        </p>
        <div className="app-grid">
          {apps.map((app) => {
            const selected = selectedAppIds.has(app.id);
            return (
              <button
                key={app.id}
                className={`app-toggle${selected ? ' selected' : ''}`}
                onClick={() => toggleApp(app.id)}
                aria-pressed={selected}
              >
                <span className="app-toggle-check">{selected ? '✓' : ''}</span>
                <span className="app-toggle-name">{app.name}</span>
              </button>
            );
          })}
        </div>
        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? 'Sparar…' : `Skicka in (${selectedAppIds.size} valda)`}
        </button>
      </>
    );
  }

  const selectedApps = apps.filter((a) => selectedAppIds.has(a.id));

  return (
    <>
      <p className="confirm-eyebrow">Du har svarat i</p>
      <p className="confirm-group-name">{session.name}</p>
      <div className="confirm-heading-row">
        <span className="confirm-icon">✓</span>
        <p className="section-title">Tack, {participant.name}!</p>
      </div>
      <p className="waiting-note">
        Ditt svar är sparat. Den som skapade gruppen ser resultaten när alla svarat.
      </p>
      <p className="pref-label" style={{ marginTop: 32, marginBottom: 10 }}>
        {selectedApps.length > 0 ? 'Dina valda appar' : 'Du valde inga appar'}
      </p>
      {selectedApps.length > 0 && (
        <div className="result-who">
          {selectedApps.map((a) => (
            <span key={a.id} className="chip has-app">{a.name}</span>
          ))}
        </div>
      )}
    </>
  );
}
