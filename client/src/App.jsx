import CreatorFlow from './components/CreatorFlow';
import JoinFlow from './components/JoinFlow';

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const joinCode = params.get('join');
  const mineId   = params.get('mine');

  return (
    <main className="app-shell">
      <h1 className="wordmark">
        You<span className="accent">Me</span>We
      </h1>
      <div className="view" key={joinCode || mineId || 'creator'}>
        {joinCode
          ? <JoinFlow joinCode={joinCode} />
          : <CreatorFlow sessionId={mineId ? Number(mineId) : null} />
        }
      </div>
    </main>
  );
}
