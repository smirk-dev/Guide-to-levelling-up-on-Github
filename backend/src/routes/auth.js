import express from 'express';
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Store tokens in memory (in production, use a database)
const userSessions = new Map();

// Step 1: Redirect to GitHub OAuth
router.get('/github', (req, res) => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=read:user,repo`;
    res.redirect(githubAuthUrl);
});

// Step 2: GitHub callback
router.get('/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.redirect(`${process.env.FRONTEND_URL}?error=no_code`);
    }

    try {
        // Exchange code for access token
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code
            })
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
            return res.redirect(`${process.env.FRONTEND_URL}?error=${tokenData.error}`);
        }

        const accessToken = tokenData.access_token;

        // Fetch user info
        const userResponse = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        const userData = await userResponse.json();

        // Create JWT token
        const jwtToken = jwt.sign(
            {
                githubId: userData.id,
                username: userData.login
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Store access token (in production, encrypt and store in DB)
        userSessions.set(userData.id, {
            accessToken,
            username: userData.login,
            avatarUrl: userData.avatar_url
        });

        // Redirect to frontend with JWT
        res.redirect(`${process.env.FRONTEND_URL}?token=${jwtToken}`);
    } catch (error) {
        console.error('OAuth error:', error);
        res.redirect(`${process.env.FRONTEND_URL}?error=auth_failed`);
    }
});

// Logout
router.post('/logout', (req, res) => {
    // In production, invalidate the token
    res.json({ success: true });
});

export default router;
export { userSessions };
