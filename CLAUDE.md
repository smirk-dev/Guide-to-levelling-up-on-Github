# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo containing:
1. **Educational Documentation** (`/docs`, `README.md`) - Comprehensive guide to GitHub profile enhancement, ranking systems (GitHub Stats & Trophies), and achievements
2. **Code Warrior Application** (`/code-warrior`) - Next.js web app that gamifies GitHub contributions into an RPG experience

## Development Commands

### Code Warrior Application

All commands should be run from the `code-warrior/` directory.

**Setup:**
```bash
cd code-warrior
npm install
```

**Development:**
```bash
npm run dev          # Start Next.js dev server on http://localhost:3000
```

**Production:**
```bash
npm run build        # Build for production
npm start            # Run production server
```

**Linting:**
```bash
npm run lint         # Run ESLint
```

## Code Warrior Architecture

### Tech Stack
- **Framework:** Next.js 14+ with App Router
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4
- **Database:** Supabase (PostgreSQL)
- **Auth:** NextAuth.js with GitHub OAuth
- **State Management:** TanStack Query (React Query)
- **Animations:** Framer Motion

### Core Architecture Patterns
refer to docs/architecture.md

#### 1. Sync Engine Pattern
The application uses a "Sync Engine" to minimize GitHub API calls:
- User triggers sync via POST `/api/sync`
- Sync service fetches GitHub data (profile, repos, events, PRs, issues)
- Data is processed to calculate XP, rank, and RPG stats
- Results are cached in Supabase
- Frontend reads from Supabase (not GitHub API directly)
- **Cooldown:** 5 minutes between syncs to prevent rate limit abuse

**Key Files:**
- `src/app/api/sync/route.ts` - Sync Engine API endpoint
- `src/lib/github.ts` - GitHub API wrapper with caching
- `src/lib/game-logic.ts` - XP and rank calculations

#### 2. XP Calculation System

GitHub stats are converted to XP using weighted formulas:
```typescript
XP_WEIGHTS = {
  STAR: 50,        // Stars = Charisma/Fame
  PR: 40,          // Pull Requests = Strength
  COMMIT: 10,      // Commits = Stamina/Health
  ISSUE: 15,       // Issues = Wisdom
  REVIEW: 20,      // Reviews = Wisdom
}
```

**Rank Progression:**
- C (Novice): 0-999 XP
- B (Intermediate): 1,000-2,999 XP
- A (Skilled): 3,000-5,999 XP
- AA (Advanced): 6,000-9,999 XP
- AAA (Elite): 10,000-14,999 XP
- S (Expert): 15,000-24,999 XP
- SS (Master): 25,000-49,999 XP
- SSS (Legend): 50,000+ XP

**Implementation:** `src/lib/game-logic.ts`

#### 3. RPG Stats Mapping

GitHub metrics map to RPG attributes:
- **Health (HP):** Based on commits (consistency)
- **Mana (MP):** Based on issues + reviews
- **Strength:** Based on pull requests
- **Charisma:** Based on stars received
- **Wisdom:** Based on issues + reviews

All stats are capped at 100.

#### 4. Quest System

Quests track specific GitHub milestones:
- Defined in `quests` table (title, description, criteria_type, criteria_threshold, xp_reward)
- User progress tracked in `user_quests` join table
- Criteria types: `repo_created`, `pr_merged`, `commits`, `stars_received`, `issues_created`
- Quest completion checked during sync via `src/lib/quest-logic.ts`

**API Endpoints:**
- GET `/api/quests` - Fetch all quests with user progress
- POST `/api/quests/claim` - Claim quest reward

### Database Schema

**Tables:**
1. `users` - Core RPG character data (github_id, username, avatar_url, xp, rank_tier, last_synced_at)
2. `quests` - Quest templates (title, description, xp_reward, criteria_type, criteria_threshold)
3. `user_quests` - Join table for quest progress (user_id, quest_id, status, completed_at)
4. `badges` - Badge definitions with stat boosts (name, icon_slug, stat_boost as JSONB)

**Schema file:** `code-warrior/supabase-schema.sql`

### Project Structure

```
code-warrior/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/  # NextAuth config
│   │   │   ├── sync/                # Sync Engine
│   │   │   └── quests/              # Quest API
│   │   ├── dashboard/          # Main game dashboard
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── rpg/                # RPG UI components
│   │   │   ├── CharacterSheet.tsx
│   │   │   ├── StatBar.tsx
│   │   │   ├── QuestCard.tsx
│   │   │   └── QuestLog.tsx
│   │   └── effects/            # Visual effects (Confetti, FloatingXP)
│   ├── lib/
│   │   ├── github.ts           # GitHub API wrapper
│   │   ├── game-logic.ts       # XP/Rank calculations
│   │   ├── quest-logic.ts      # Quest completion logic
│   │   ├── supabase.ts         # Supabase client
│   │   └── sound.ts            # Sound effects
│   └── types/
│       ├── database.ts         # Supabase types
│       └── next-auth.d.ts      # NextAuth type extensions
├── public/                     # Static assets
├── supabase-schema.sql         # Database schema
├── .env.example                # Environment template
└── tailwind.config.ts          # Theme (Cyber-Fantasy)
```

### Environment Setup

Required environment variables (see `.env.example`):

```bash
# NextAuth
NEXTAUTH_SECRET=        # Generate: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

# GitHub OAuth
GITHUB_CLIENT_ID=       # From GitHub OAuth App
GITHUB_CLIENT_SECRET=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Optional: GitHub API Token (for higher rate limits)
GITHUB_API_TOKEN=
```

**Setup Steps:**
1. Create Supabase project and run `supabase-schema.sql`
2. Create GitHub OAuth App (callback: `http://localhost:3000/api/auth/callback/github`)
3. Copy `.env.example` to `.env.local` and fill in values

### Design Theme

**Aesthetic:** Cyber-Fantasy
**Color Palette:**
- Midnight Void (dark backgrounds)
- Loot Gold (highlights, XP)
- Mana Blue (stats, magic)
- Health Green (HP bars)

**Typography:**
- Pixel: Press Start 2P (headings, retro feel)
- Mono: Fira Code (code snippets, stats)
- Sans: Inter (body text)

**Configuration:** `code-warrior/tailwind.config.ts`

### GitHub API Integration

**Authentication:**
- Uses NextAuth.js GitHub provider with OAuth
- Access token stored in session
- Fallback to `GITHUB_API_TOKEN` for server-side requests

**Rate Limiting:**
- GitHub API: 5,000 requests/hour (authenticated)
- Sync cooldown: 5 minutes between user syncs
- Caching: 15 minutes for GitHub responses (`next: { revalidate: 900 }`)

**Key Functions:**
- `calculateGitHubStats()` - Fetches and aggregates all metrics
- Uses GitHub Search API for accurate PR/issue counts
- Falls back to events API for recent commits/reviews

**Implementation:** `src/lib/github.ts`

### TypeScript Patterns

**Important Type Definitions:**
- `RankTier` - Enum for rank tiers (C, B, A, AA, AAA, S, SS, SSS)
- `GitHubStats` - Aggregated GitHub metrics
- `RPGStats` - Health, Mana, Strength, Charisma, Wisdom
- `Quest`, `UserQuest` - Quest system types

**Session Extension:**
NextAuth session is extended to include GitHub-specific fields:
```typescript
// src/types/next-auth.d.ts
session.user.id          // GitHub ID
session.user.username    // GitHub username
session.accessToken      // OAuth token for API calls
```

## Documentation Structure

The `/docs` directory contains project planning documents:
- `project-brief.md` - Original concept and requirements
- `prd.md` - Product Requirements Document
- `ux-design.md` - UI/UX specifications
- `architecture.md` - Technical architecture decisions

The main `README.md` is a comprehensive guide to GitHub profile enhancement systems (Stats, Trophies, Achievements) - not directly related to Code Warrior app development but serves as educational content.

## Important Notes

### When Working on the Code Warrior App:

1. **Always use the Sync Engine** - Never bypass the sync cooldown or cache
2. **GitHub API Rate Limits** - Be mindful of API calls; use caching aggressively
3. **Type Safety** - Strict TypeScript mode is enabled; all types must be properly defined
4. **Database Queries** - Use Supabase service role key for admin operations in API routes
5. **Authentication** - All `/api/*` routes (except `/api/auth`) should verify session
6. **Quest Logic** - Quest completion is automatic during sync; claiming is manual via API
7. **XP Calculations** - XP formulas are in `game-logic.ts`; don't duplicate logic elsewhere

### Common Patterns:

**Server-side Supabase Access:**
```typescript
import { getServiceSupabase } from '@/lib/supabase';
const supabase = getServiceSupabase(); // Uses service role key
```

**Client-side Supabase Access:**
```typescript
import { createClient } from '@/lib/supabase';
const supabase = createClient(); // Uses anon key
```

**Fetching User Data:**
Always fetch by `github_id` (more reliable than username):
```typescript
await supabase.from('users').select('*').eq('github_id', githubId).single();
```

**GitHub API Calls:**
Always pass access token when available:
```typescript
await calculateGitHubStats(username, session.accessToken);
```
