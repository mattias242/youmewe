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
    <main>
      <h1>YouMeWe</h1>
      {view === 'wizard' && <GroupWizard onComplete={handleWizardComplete} />}
      {view === 'prefs' && (
        <PreferenceForm
          features={features}
          participant={participants[currentIndex]}
          onSave={handlePrefsSave}
        />
      )}
      {view === 'results' && <ResultsPage sessionId={session?.id} />}
    </main>
  );
}
