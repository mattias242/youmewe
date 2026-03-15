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
      <>
        <div className="steps">
          <div className="step-dot active" />
          <div className="step-dot" />
        </div>
        <p className="section-title">Name your group</p>
        <p className="section-sub">Give your group a name to get started.</p>
        <input
          type="text"
          placeholder="Group name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleStart()}
        />
        {nameError && <p role="alert" className="error-msg">{nameError}</p>}
        <button className="btn-primary" onClick={handleStart} disabled={loading}>
          Start
        </button>
      </>
    );
  }

  return (
    <>
      <div className="steps">
        <div className="step-dot" />
        <div className="step-dot active" />
      </div>
      <p className="section-title">Add participants</p>
      <p className="section-sub">Who's in the group? Add everyone, then continue.</p>
      <div className="input-row">
        <input
          type="text"
          placeholder="Participant name"
          value={participantName}
          onChange={(e) => setParticipantName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          style={{ marginBottom: 0 }}
        />
        <button className="btn-add" onClick={handleAdd}>Add</button>
      </div>
      {addError && <p role="alert" className="error-msg">{addError}</p>}
      <ul className="participant-list">
        {participants.map((p) => (
          <li key={p.id} className="participant-item">{p.name}</li>
        ))}
      </ul>
      <button className="btn-primary" onClick={handleContinue}>Continue</button>
      <button className="btn-secondary" onClick={handleSkip}>Skip to results</button>
    </>
  );
}
