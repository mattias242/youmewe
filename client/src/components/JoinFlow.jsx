import { useState, useEffect } from 'react';
import { getSessionByCode, addParticipant, getApps, saveParticipantApps } from '../api/api';

export default function JoinFlow({ joinCode }) {
  const [session, setSession] = useState(null);
  const [apps, setApps] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [step, setStep] = useState('loading');

  const [participantName, setParticipantName] = useState('');
  const [nameError, setNameError] = useState('');
  const [selectedAppIds, setSelectedAppIds] = useState(new Set());
  const [participant, setParticipant] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([getSessionByCode(joinCode), getApps()])
      .then(([sess, appList]) => {
        setSession(sess);
        setApps(appList);
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
    const p = await addParticipant(session.id, participantName.trim());
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

  return (
    <>
      <span className="confirm-icon">✓</span>
      <p className="section-title">Tack, {participant.name}!</p>
      <p className="waiting-note">
        Ditt svar är sparat. Nu väntar vi på att alla i <strong>{session.name}</strong> ska svara.
        <br /><br />
        Den som skapade gruppen ser resultaten.
      </p>
    </>
  );
}
