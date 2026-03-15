import { useState } from 'react';
import { createSession, addParticipant, getFeatures } from '../api/api';

export default function GroupWizard({ onComplete }) {
  const [step, setStep] = useState('session');
  const [groupName, setGroupName] = useState('');
  const [nameError, setNameError] = useState('');
  const [session, setSession] = useState(null);
  const [features, setFeatures] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [participantName, setParticipantName] = useState('');
  const [addError, setAddError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    if (!groupName.trim()) {
      setNameError('Enter a group name.');
      return;
    }
    setNameError('');
    setLoading(true);
    try {
      const [sess, feats] = await Promise.all([
        createSession(groupName.trim()),
        getFeatures(),
      ]);
      setSession(sess);
      setFeatures(feats);
      setStep('participants');
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (!participantName.trim()) {
      setAddError('Enter a participant name.');
      return;
    }
    setAddError('');
    const p = await addParticipant(session.id, participantName.trim());
    setParticipants((prev) => [...prev, p]);
    setParticipantName('');
  }

  function handleContinue() {
    onComplete({ session, participants, features });
  }

  function handleSkip() {
    onComplete({ session, participants: [], features });
  }

  if (step === 'session') {
    return (
      <div>
        <h2>Create your group</h2>
        <input
          type="text"
          placeholder="Group name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleStart()}
        />
        <button onClick={handleStart} disabled={loading}>
          Start
        </button>
        {nameError && <p role="alert">{nameError}</p>}
      </div>
    );
  }

  return (
    <div>
      <h2>Add participants</h2>
      <input
        type="text"
        placeholder="Participant name"
        value={participantName}
        onChange={(e) => setParticipantName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
      />
      <button onClick={handleAdd}>Add</button>
      {addError && <p role="alert">{addError}</p>}
      <ul>
        {participants.map((p) => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>
      <button onClick={handleContinue}>Continue</button>
      <button onClick={handleSkip}>Skip to results</button>
    </div>
  );
}
