import { useState } from 'react';

export default function PreferenceForm({ features, participant, onSave }) {
  const [weights, setWeights] = useState(() =>
    Object.fromEntries(features.map((f) => [f.id, 0]))
  );

  function setWeight(featureId, value) {
    setWeights((prev) => ({ ...prev, [featureId]: value }));
  }

  function handleSave() {
    const ratings = features.map((f) => ({ featureId: f.id, weight: weights[f.id] ?? 0 }));
    onSave(ratings);
  }

  return (
    <>
      <p className="pref-label">Preferences for</p>
      <p className="pref-name">{participant.name}</p>

      {features.map((f) => (
        <div key={f.id} className="feature-block">
          <p className="feature-label">{f.name}</p>
          <div className="rating-track">
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                className="rating-btn"
                aria-pressed={weights[f.id] === v}
                onClick={() => setWeight(f.id, weights[f.id] === v ? 0 : v)}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="divider" />
      <button className="btn-primary" onClick={handleSave}>Save</button>
    </>
  );
}
