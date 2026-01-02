# 🎮 Code Warrior - GitHub RPG

Transform your GitHub activity into an epic RPG adventure!

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and fill in your credentials:
- **NEXTAUTH_SECRET**: Generate with `openssl rand -base64 32`
- **GITHUB_CLIENT_ID** & **GITHUB_CLIENT_SECRET**: From GitHub OAuth App
- **Supabase Keys**: From your Supabase project

### 3. Set Up Database
1. Create a Supabase project at https://supabase.com
2. Run the SQL from `supabase-schema.sql` in the SQL Editor
3. Copy your project URL and keys to `.env.local`

### 4. Create GitHub OAuth App
1. Go to https://github.com/settings/developers
2. Create a new OAuth App
3. Set callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Secret to `.env.local`

### 5. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000 and start your quest!

## 🎯 Features (MVP)

✅ **Authentication** - GitHub OAuth sign-in  
✅ **Character Sheet** - Avatar, stats, and rank display  
✅ **Sync Engine** - Fetch GitHub data and calculate XP  
✅ **Rank System** - Progress from Novice (C) to Legend (SSS)  
✅ **RPG Stats** - Health, Mana, Strength, Charisma, Wisdom  

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Cyber-Fantasy theme)
- **Database**: Supabase (PostgreSQL)
- **Auth**: NextAuth.js
- **State**: React Query
- **Animations**: Framer Motion

## 📁 Project Structure

```
code-warrior/
├── src/app/
│   ├── api/
│   │   ├── auth/[...nextauth]/  # NextAuth configuration
│   │   └── sync/                # Sync Engine API
│   └── dashboard/               # Protected game view
├── components/
│   └── rpg/                     # Character Sheet components
├── lib/
│   ├── github.ts                # GitHub API wrapper
│   ├── game-logic.ts            # XP & Rank calculations
│   └── supabase.ts              # Database client
└── types/                       # TypeScript interfaces
```

## 🎨 Design Theme

**Aesthetic**: Cyber-Fantasy  
**Colors**: Midnight Void, Loot Gold, Mana Blue, Health Green  
**Fonts**: Press Start 2P (pixel), Fira Code (mono), Inter (sans)

---

Built by following the comprehensive documentation in `docs/`.
