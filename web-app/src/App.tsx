import { useGameState } from './hooks/useGameState'
import { ACHIEVEMENTS } from './game-data/achievements'

function App() {
  const { gameState, setUsername, completeQuest, quests } = useGameState();

  const handleQuestClick = (questId: string, reward: number) => {
    completeQuest(questId, reward);
  };

  const progressPercent = (gameState.currentXP / gameState.xpToNextLevel) * 100;

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', minHeight: '100vh' }}>
      {/* Header / HUD */}
      <header className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '900px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 className="gradient-text" style={{ fontSize: '2.5rem', margin: 0 }}>{gameState.username}</h1>
            <button
              onClick={() => {
                const name = prompt("Enter your GitHub username:");
                if (name) setUsername(name);
              }}
              style={{ background: 'transparent', border: '1px solid var(--text-muted)', color: 'var(--text-muted)', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}
            >
              Edit
            </button>
          </div>
          <p style={{ color: 'var(--text-muted)' }}>Level {gameState.level} Developer</p>
        </div>

        <div style={{ flex: 1, maxWidth: '300px', minWidth: '200px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            <span>XP</span>
            <span>{Math.floor(gameState.currentXP)} / {gameState.xpToNextLevel}</span>
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
      </header>

      {/* Main Content Grid */}
      <main style={{ width: '100%', maxWidth: '900px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

        {/* Active Quests Column */}
        <section style={{ flex: 2, minWidth: '300px' }}>
          <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>📜</span> Active Quests
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {quests.map(quest => {
              const isCompleted = gameState.completedQuests.includes(quest.id);
              return (
                <div key={quest.id} className="glass-panel" style={{
                  padding: '1.5rem',
                  borderLeft: `4px solid ${isCompleted ? 'var(--success)' : 'var(--warning)'}`,
                  opacity: isCompleted ? 0.7 : 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h3 style={{ color: isCompleted ? 'var(--success)' : 'var(--text-main)' }}>
                      {quest.title} {isCompleted && '✅'}
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>{quest.description}</p>
                    <span style={{
                      display: 'inline-block',
                      marginTop: '0.8rem',
                      background: 'rgba(122, 162, 247, 0.1)',
                      color: 'var(--primary)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '4px',
                      fontSize: '0.8rem'
                    }}>
                      +{quest.xpReward} XP
                    </span>
                  </div>
                  {!isCompleted && (
                    <button
                      onClick={() => handleQuestClick(quest.id, quest.xpReward)}
                      style={{
                        background: 'var(--primary)',
                        color: '#fff',
                        border: 'none',
                        padding: '0.6rem 1.2rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}>
                      Complete
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Achievements / Trophies Column */}
        <section style={{ flex: 1, minWidth: '300px' }}>
          <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🏆</span> Trophies
          </h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {ACHIEVEMENTS.map(ach => (
              <div key={ach.id} className="glass-panel" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1rem' }}>{ach.name}</h3>
                  <span style={{
                    background: 'linear-gradient(135deg, gold, orange)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 'bold',
                    fontFamily: 'var(--font-code)'
                  }}>SSS</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Next: {ach.tiers[0].title}
                </div>
                <div style={{ width: '100%', height: '4px', background: 'var(--bg-app)', marginTop: '0.5rem', borderRadius: '2px' }}>
                  <div style={{ width: '10%', height: '100%', background: 'var(--secondary)' }} />
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  )
}

export default App
