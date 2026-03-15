import { useState, useEffect } from 'react';
import { getRecommendations } from '../api/api';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function ResultsPage({ sessionId }) {
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getRecommendations(sessionId)
      .then(setRecommendations)
      .catch((e) => setError(e.message));
  }, [sessionId]);

  if (error) return <p className="status-text">{error}</p>;
  if (!recommendations) return <p className="status-text">Loading…</p>;

  return (
    <>
      <p className="results-eyebrow">Results</p>
      <p className="section-title">Best match for your group</p>
      <p className="section-sub" style={{ marginBottom: 28 }}>
        Ranked by your collective preferences.
      </p>

      {recommendations.map(({ app, score }, i) => (
        <div
          key={app.id}
          className={`result-card${i === 0 ? ' top-pick' : ''}`}
        >
          <span className="result-medal">{MEDALS[i] ?? String(i + 1)}</span>
          <div className="result-body">
            <p className="result-app-name">
              {app.website_url ? (
                <a href={app.website_url} target="_blank" rel="noopener noreferrer">
                  {app.name}
                </a>
              ) : (
                app.name
              )}
            </p>
            <p className="result-description">{app.description}</p>
            <div className="result-score-row">
              <span className="result-score-num">{score}</span>
              <span className="result-score-label">pts</span>
            </div>
          </div>
          <span className="result-rank-ghost" aria-hidden="true">{i + 1}</span>
        </div>
      ))}
    </>
  );
}
