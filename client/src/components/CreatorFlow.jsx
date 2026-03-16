import { useState } from 'react';
import { createSession } from '../api/api';
import ResultsPage from './ResultsPage';

const STORAGE_KEY = 'youmewe_session';

export function getSavedSession() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return null; }
}

export default function CreatorFlow() {
  const saved = getSavedSession();
  const [step, setStep] = useState(saved ? 'share' : 'name');
  const [groupName, setGroupName] = useState('');
  const [nameError, setNameError] = useState('');
  const [session, setSession] = useState(saved);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCreate() {
    if (!groupName.trim()) {
      setNameError('Ange ett gruppnamn.');
      return;
    }
    setNameError('');
    setLoading(true);
    try {
      const sess = await createSession(groupName.trim());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sess));
      setSession(sess);
      setStep('share');
    } finally {
      setLoading(false);
    }
  }

  function handleNewGroup() {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
    setGroupName('');
    setStep('name');
  }

  function getShareUrl() {
    return `${window.location.origin}${window.location.pathname}?join=${session.share_code}`;
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {
      /* fallback: select the text */
    }
  }

  if (step === 'name') {
    return (
      <>
        <p className="section-title">Skapa en grupp</p>
        <p className="section-sub">
          Du får en länk att dela — alla svarar i sin takt.
        </p>
        <input
          type="text"
          placeholder="Gruppnamn"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        />
        {nameError && <p role="alert" className="error-msg">{nameError}</p>}
        <button className="btn-primary" onClick={handleCreate} disabled={loading}>
          {loading ? 'Skapar…' : 'Skapa grupp'}
        </button>
      </>
    );
  }

  return (
    <>
      <p className="section-title">{session.name}</p>
      <p className="section-sub">Dela länken — alla fyller i vilka appar de har.</p>

      <div className="share-box">
        <p className="share-label">Delbar länk</p>
        <div className="share-url-row">
          <span className="share-url">{getShareUrl()}</span>
          <button
            className={`btn-copy${copied ? ' copied' : ''}`}
            onClick={handleCopy}
          >
            {copied ? '✓ Kopierad' : 'Kopiera'}
          </button>
        </div>
      </div>

      <ResultsPage sessionId={session.id} isCreator />

      <button className="btn-secondary" onClick={handleNewGroup} style={{ marginTop: 24 }}>
        Ny grupp
      </button>
    </>
  );
}
