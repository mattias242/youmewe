import { useState } from 'react';
import CreatorFlow from './components/CreatorFlow';
import JoinFlow from './components/JoinFlow';
import MyGroups from './components/MyGroups';
import ResultsPage from './components/ResultsPage';

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const joinCode = params.get('join');
  const mineId   = params.get('mine');
  const viewId   = params.get('view');

  const [creating, setCreating] = useState(false);

  function renderView() {
    if (joinCode) return <JoinFlow joinCode={joinCode} />;
    if (mineId)   return <CreatorFlow sessionId={Number(mineId)} />;
    if (viewId)   return <ResultsPage sessionId={Number(viewId)} isCreator={false} />;
    if (creating) return <CreatorFlow sessionId={null} />;
    return <MyGroups onNew={() => setCreating(true)} />;
  }

  const key = joinCode || mineId || viewId || (creating ? 'creator' : 'home');

  return (
    <main className="app-shell">
      <h1 className="wordmark">
        You<span className="accent">Me</span>We
      </h1>
      <div className="view" key={key}>
        {renderView()}
      </div>
    </main>
  );
}
