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

  if (error) return <p>{error}</p>;
  if (!recommendations) return <p>Loading…</p>;

  return (
    <div>
      <h2>Recommendations</h2>
      {recommendations.map(({ app, score }, i) => (
        <div key={app.id}>
          <span>{MEDALS[i] ?? i + 1}</span>
          <strong>
            {app.website_url ? (
              <a href={app.website_url} target="_blank" rel="noopener noreferrer">
                {app.name}
              </a>
            ) : (
              app.name
            )}
          </strong>
          <span>{app.description}</span>
          <span>{score}</span>
        </div>
      ))}
    </div>
  );
}
