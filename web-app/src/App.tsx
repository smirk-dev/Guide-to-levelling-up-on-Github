import { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import { getTokenFromUrl, fetchUserData, logout } from './services/api';

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authToken = getTokenFromUrl();
    setToken(authToken);

    if (authToken) {
      fetchUserData(authToken)
        .then(data => {
          setUserData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch user data:', err);
          setLoading(false);
          setToken(null);
        });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="gradient-text" style={{ fontSize: '2rem' }}>Loading...</div>
      </div>
    );
  }

  if (!token || !userData) {
    return <LoginScreen />;
  }

  const { user, stats, achievements, level } = userData;
  const progressPercent = (level.currentXP / level.xpToNextLevel) * 100;

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', minHeight: '100vh' }}>
      {/* Header / HUD */}
      <header className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '900px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img
            src={user.avatarUrl}
            alt={user.username}
            style={{ width: '60px', height: '60px', borderRadius: '50%', border: '3px solid var(--primary)' }}
          />
          <div>
            <h1 className="gradient-text" style={{ fontSize: '2rem', margin: 0 }}>{user.username}</h1>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Level {level.level} Developer</p>
          </div>
        </div>

        <div style={{ flex: 1, maxWidth: '300px', minWidth: '200px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            <span>XP</span>
            <span>{Math.floor(level.currentXP)} / {level.xpToNextLevel}</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'var(--bg-app)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: 'linear-gradient(to right, var(--primary), var(--accent))',
              transition: 'width 0.5s ease-out'
            }} />
          </div>
        </div>

        <button
          onClick={logout}
          style={{
            background: 'transparent',
            border: '1px solid var(--danger)',
            color: 'var(--danger)',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </header>

      {/* Stats Grid */}
      <main style={{ width: '100%', maxWidth: '900px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⭐</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.totalStars}</div>
          <div style={{ color: 'var(--text-muted)' }}>Total Stars</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔄</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--secondary)' }}>{stats.totalPRs}</div>
          <div style={{ color: 'var(--text-muted)' }}>Pull Requests</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📚</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent)' }}>{stats.publicRepos}</div>
          <div style={{ color: 'var(--text-muted)' }}>Repositories</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👥</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)' }}>{stats.followers}</div>
          <div style={{ color: 'var(--text-muted)' }}>Followers</div>
        </div>
      </main>

      {/* Achievements */}
      <section style={{ width: '100%', maxWidth: '900px' }}>
        <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🏆</span> Your Achievements
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          {achievements.map((ach: any) => (
            <div key={ach.id} className="glass-panel" style={{ padding: '1.5rem', borderLeft: `4px solid var(--primary)` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ textTransform: 'capitalize' }}>{ach.id}</h3>
                <span style={{
                  background: 'linear-gradient(135deg, gold, orange)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 'bold',
                  fontSize: '1.5rem',
                  fontFamily: 'var(--font-code)'
                }}>{ach.rank}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;
