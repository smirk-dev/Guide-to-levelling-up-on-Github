import { useState } from 'react'
import './App.css'

function App() {
  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
      <header className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '800px', textAlign: 'center' }}>
        <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>GitHub Level Up</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Gamify your open source journey</p>
      </header>

      <main style={{ width: '100%', maxWidth: '800px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
         <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h2 style={{ color: 'var(--primary)' }}>Stats Preview</h2>
            <div style={{ marginTop: '1rem', fontFamily: 'var(--font-code)' }}>
              Level 1 Developer
            </div>
         </div>

         <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h2 style={{ color: 'var(--secondary)' }}>Active Quest</h2>
            <div style={{ marginTop: '1rem' }}>
              Create your profile README
            </div>
         </div>
      </main>
    </div>
  )
}

export default App
