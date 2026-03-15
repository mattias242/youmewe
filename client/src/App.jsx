import CreatorFlow from './components/CreatorFlow';
import JoinFlow from './components/JoinFlow';

export default function App() {
  const joinCode = new URLSearchParams(window.location.search).get('join');

  return (
    <main className="app-shell">
      <h1 className="wordmark">
        You<span className="accent">Me</span>We
      </h1>
      <div className="view" key={joinCode || 'creator'}>
        {joinCode
          ? <JoinFlow joinCode={joinCode} />
          : <CreatorFlow />
        }
      </div>
    </main>
  );
}
