import { useState, useEffect, useCallback } from 'react';
import { getResults, sendResult } from '../api/api';

export default function ResultsPage({ sessionId, isCreator }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState(null);

  const load = useCallback(() => {
    setError(null);
    getResults(sessionId)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [sessionId]);

  useEffect(() => { load(); }, [load]);

  async function handleSend() {
    const topApp = data?.results?.find(({ count }) => count > 0);
    if (!topApp) return;
    setSending(true);
    setSendStatus(null);
    try {
      const res = await sendResult(sessionId, topApp.app.id);
      setSendStatus(res.sent > 0
        ? `✓ Skickat till ${res.sent} person${res.sent > 1 ? 'er' : ''}!`
        : 'Inga mejladresser sparade ännu.');
    } catch (e) {
      setSendStatus(`Fel: ${e.message}`);
    } finally {
      setSending(false);
    }
  }

  if (error) return <p className="status-text">{error}</p>;
  if (!data)  return <p className="status-text">Laddar…</p>;

  const { participants, results } = data;
  const total = participants.length;
  const topApp = results.find(({ count }) => count > 0);

  return (
    <>
      <div className="refresh-row">
        <p className="section-title">Resultat</p>
        <button className="btn-refresh" onClick={load}>Uppdatera</button>
      </div>

      {total === 0 ? (
        <p className="results-meta">Ingen har svarat än. Dela länken!</p>
      ) : (
        <p className="results-meta">
          {total} {total === 1 ? 'person' : 'personer'} har svarat
        </p>
      )}

      {isCreator && topApp && (
        <div style={{ marginBottom: 20 }}>
          <button
            className="btn-primary"
            onClick={handleSend}
            disabled={sending}
          >
            {sending ? 'Skickar…' : `Kör med ${topApp.app.name} — mejla alla`}
          </button>
          {sendStatus && (
            <p className="results-meta" style={{ marginTop: 8 }}>{sendStatus}</p>
          )}
        </div>
      )}

      {results
        .filter(({ count }) => count > 0 || total === 0)
        .map(({ app, count, who }) => (
          <div
            key={app.id}
            className={`result-card${count === total && total > 0 ? ' top-pick' : ''}`}
          >
            <div
              className={`count-badge${count === total && total > 0 ? ' full' : ''}`}
            >
              {count}
            </div>
            <div className="result-body" style={{ paddingRight: 0 }}>
              <p className="result-app-name">
                {app.website_url ? (
                  <a href={app.website_url} target="_blank" rel="noopener noreferrer">
                    {app.name}
                  </a>
                ) : (
                  app.name
                )}
              </p>
              {app.description && (
                <p className="result-description">{app.description}</p>
              )}
              {who.length > 0 && (
                <div className="result-who">
                  {who.map((p) => (
                    <span key={p.id} className="chip has-app">{p.name}</span>
                  ))}
                  {participants
                    .filter((p) => !who.find((w) => w.id === p.id))
                    .map((p) => (
                      <span key={p.id} className="chip">{p.name}</span>
                    ))}
                </div>
              )}
            </div>
          </div>
        ))}
    </>
  );
}
