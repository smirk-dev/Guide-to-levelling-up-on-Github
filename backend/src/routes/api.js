import express from 'express';
import { authenticateToken } from '../utils/auth.js';
import { userSessions } from './auth.js';
import { fetchGitHubStats, calculateAchievements, calculateLevel } from '../services/githubService.js';

const router = express.Router();

// Get current user info
router.get('/user', authenticateToken, async (req, res) => {
    try {
        // Get accessToken from JWT payload
        const accessToken = req.user.accessToken;

        if (!accessToken) {
            // Fallback to session if JWT doesn't have token (old tokens)
            const session = userSessions.get(req.user.githubId);
            if (!session) {
                return res.status(401).json({ error: 'Session expired. Please login again.' });
            }
        }

        const stats = await fetchGitHubStats(accessToken || userSessions.get(req.user.githubId)?.accessToken);
        const achievements = calculateAchievements(stats);
        const levelInfo = calculateLevel(stats);

        res.json({
            user: {
                username: stats.username,
                avatarUrl: stats.avatarUrl,
                name: stats.name,
                bio: stats.bio
            },
            stats,
            achievements,
            level: levelInfo
        });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ error: 'Failed to fetch user data', details: error.message });
    }
});

// Get detailed stats
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const session = userSessions.get(req.user.githubId);

        if (!session) {
            return res.status(401).json({ error: 'Session not found' });
        }

        const stats = await fetchGitHubStats(session.accessToken);
        res.json(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

export default router;
