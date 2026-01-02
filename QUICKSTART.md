# GitHub Level Up - Quick Start Guide

## 🚀 Running the Application

### 1. Start Backend Server
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:3000`

### 2. Start Frontend (New Terminal)
```bash
cd web-app
npm run dev
```
Frontend will run on `http://localhost:5173`

### 3. Login Flow
1. Visit `http://localhost:5173`
2. Click "Login with GitHub"
3. Authorize the app on GitHub
4. You'll be redirected back with your real stats!

## 📊 What You'll See

- **Real GitHub Stats**: Stars, PRs, Repos, Followers
- **Dynamic Level**: Calculated from your actual contributions
- **Achievements**: Unlocked based on your real progress (C to SSS ranks)
- **No Dummy Data**: Everything is fetched live from GitHub API

## 🔧 Troubleshooting

**Backend won't start?**
- Make sure `.env` file exists in `backend/` directory
- Check that ports 3000 and 5173 are available

**OAuth error?**
- Verify your GitHub OAuth App callback URL is `http://localhost:3000/auth/callback`
- Check CLIENT_ID and CLIENT_SECRET in `.env`

**Stats not loading?**
- Check browser console for errors
- Verify backend is running on port 3000
