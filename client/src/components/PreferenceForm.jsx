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
    <div>
      <h2>Preferences for {participant.name}</h2>
      {features.map((f) => (
        <div key={f.id}>
          <span>{f.name}</span>
          {[1, 2, 3, 4, 5].map((v) => (
            <button
              key={v}
              aria-pressed={weights[f.id] === v}
              onClick={() => setWeight(f.id, weights[f.id] === v ? 0 : v)}
            >
              {v}
            </button>
          ))}
        </div>
      ))}
      <button onClick={handleSave}>Save</button>
    </div>
  );
}
