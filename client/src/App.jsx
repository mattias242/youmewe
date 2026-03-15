import { useState } from 'react';
import GroupWizard from './components/GroupWizard';
import PreferenceForm from './components/PreferenceForm';
import ResultsPage from './components/ResultsPage';
import { savePreference } from './api/api';

export default function App() {
  const [view, setView] = useState('wizard');
  const [session, setSession] = useState(null);
  const [features, setFeatures] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  function handleWizardComplete({ session, participants, features }) {
    setSession(session);
    setParticipants(participants);
    setFeatures(features);
    setCurrentIndex(0);
    setView(participants.length > 0 ? 'prefs' : 'results');
  }

  async function handlePrefsSave(ratings) {
    const participant = participants[currentIndex];
    for (const { featureId, weight } of ratings) {
      if (weight > 0) {
        await savePreference(session.id, participant.id, featureId, weight);
      }
    }
    if (currentIndex + 1 < participants.length) {
      setCurrentIndex((i) => i + 1);
    } else {
      setView('results');
    }
  }

  return (
    <main className="app-shell">
      <h1 className="wordmark">
        You<span className="accent">Me</span>We
      </h1>
      {view === 'wizard' && (
        <div className="view" key="wizard">
          <GroupWizard onComplete={handleWizardComplete} />
        </div>
      )}
      {view === 'prefs' && (
        <div className="view" key={`prefs-${currentIndex}`}>
          <PreferenceForm
            features={features}
            participant={participants[currentIndex]}
            onSave={handlePrefsSave}
          />
        </div>
      )}
      {view === 'results' && (
        <div className="view" key="results">
          <ResultsPage sessionId={session?.id} />
        </div>
      )}
    </main>
  );
}
