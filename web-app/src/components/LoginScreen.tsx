import { useState, useEffect } from 'react';
import { loginWithGitHub } from '../services/api';

export default function LoginScreen() {
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const errorParam = params.get('error');
        if (errorParam) {
            setError(errorParam);
        }
    }, []);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center'
        }}>
            {error && (
                <div style={{
                    background: 'rgba(247, 118, 142, 0.2)',
                    border: '1px solid var(--danger)',
                    color: 'var(--danger)',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '2rem',
                    maxWidth: '500px'
                }}>
                    <strong>Login Failed:</strong> {error === 'auth_failed' ? 'Authentication failed. Please try again.' : error}
                </div>
            )}
            <div className="glass-panel" style={{
                padding: '3rem',
                maxWidth: '500px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem'
            }}>
                <div>
                    <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                        🎮 GitHub Level Up
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        Turn your open source journey into an epic RPG adventure
                    </p>
                </div>

                <div style={{
                    background: 'var(--bg-card)',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    border: '1px solid var(--text-muted)'
                }}>
                    <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Features</h3>
                    <ul style={{
                        textAlign: 'left',
                        color: 'var(--text-main)',
                        lineHeight: '2',
                        listStyle: 'none',
                        padding: 0
                    }}>
                        <li>⭐ Track your real GitHub stats</li>
                        <li>🏆 Unlock achievements and trophies</li>
                        <li>📈 Level up as you contribute</li>
                        <li>🎯 Complete quests and challenges</li>
                    </ul>
                </div>

                <button
                    onClick={loginWithGitHub}
                    style={{
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        color: '#fff',
                        border: 'none',
                        padding: '1rem 2rem',
                        borderRadius: '12px',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'transform 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    Login with GitHub
                </button>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    We only request read access to your public profile and repositories
                </p>
            </div>
        </div>
    );
}
