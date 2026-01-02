const API_URL = 'http://localhost:3000';

export async function loginWithGitHub() {
    window.location.href = `${API_URL}/auth/github`;
}

export async function fetchUserData(token: string) {
    const response = await fetch(`${API_URL}/api/user`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch user data');
    }

    return response.json();
}

export async function fetchStats(token: string) {
    const response = await fetch(`${API_URL}/api/stats`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch stats');
    }

    return response.json();
}

export function getTokenFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
        // Store token
        localStorage.setItem('github_token', token);
    }

    return token || localStorage.getItem('github_token');
}

export function logout() {
    localStorage.removeItem('github_token');
    window.location.reload();
}
