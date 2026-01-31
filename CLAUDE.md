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
- **Framework:** Next.js 16.1.1 with App Router
- **Language:** TypeScript 5 (strict mode)
- **Styling:** Tailwind CSS v4
- **Database:** Supabase (PostgreSQL)
- **Auth:** NextAuth.js 4.24.13 with GitHub OAuth
- **State Management:** TanStack Query (React Query) v5
- **Animations:** Framer Motion v12
- **UI/Utilities:** Lucide React (icons), dnd-kit (drag-and-drop), html2canvas (export)

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

#### 5. Badge System

Badges are collectible achievements that provide stat boosts:
- Defined in `badges` table (name, icon_slug, stat_boost as JSONB)
- Users can equip/unequip badges for active bonuses
- Badge inventory tracked per user
- Badges can be earned through quest rewards or direct completion

**API Endpoints:**
- GET `/api/badges/inventory` - Fetch user's collected badges
- POST `/api/badges/equip` - Equip a badge (adds stat bonuses)
- POST `/api/badges/unequip` - Unequip a badge (removes bonuses)

#### 6. Leaderboard System

Tracks top players globally based on XP and rank:
- Real-time leaderboard with pagination
- Displays username, rank tier, XP, and achievement stats

**API Endpoint:**
- GET `/api/leaderboard` - Fetch top players with stats

#### 7. Additional Features

**Drag-and-Drop Badge Management (dnd-kit)**
- Users can reorganize equipped badges
- Visual feedback during drag operations
- Persistent slot assignments

**Profile Export (html2canvas)**
- Shareable character card as image
- Export stats and achievements
- Social media friendly format

**Onboarding Tutorial**
- First-time user guidance
- Game mechanics explanation
- Quick sync demonstration

**Notifications System**
- Toast notifications for sync events
- Quest completion alerts
- XP gain feedback
- Achievement unlocks

**Performance Optimizations**
- usePerformanceMode hook for low-end devices
- Screen shake effect hook for combat feedback
- Rate limiting utilities to prevent API abuse

### Database Schema

**Core Tables:**

1. **`users`** - RPG character data
   - Columns: id, github_id, username, avatar_url, xp, rank_tier, github_stats (JSONB), last_synced_at, created_at, updated_at

2. **`quests`** - Quest templates and definitions
   - Columns: id, title, description, xp_reward, criteria_type, criteria_threshold, is_active, badge_reward, created_at

3. **`user_quests`** - Quest progress tracking (join table)
   - Columns: id, user_id, quest_id, status, progress, completed_at, claimed_at, created_at

4. **`badges`** - Collectible badge definitions
   - Columns: id, name, icon_slug, stat_boost (JSONB), created_at

**ENUM Types:**
- `rank_tier`: C, B, A, AA, AAA, S, SS, SSS
- `quest_status`: ACTIVE, COMPLETED
- `criteria_type`: REPO_COUNT, PR_MERGED, STAR_COUNT, COMMIT_COUNT, ISSUE_COUNT, REVIEW_COUNT

**Schema file:** `code-warrior/supabase-schema.sql`

### Project Structure

```
code-warrior/
├── src/
│   ├── app/                         # Next.js App Router pages & API routes
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/
│   │   │   │   └── route.ts         # NextAuth.js configuration & GitHub OAuth
│   │   │   ├── sync/
│   │   │   │   └── route.ts         # Sync Engine - fetch & cache GitHub data
│   │   │   ├── quests/
│   │   │   │   ├── route.ts         # GET /api/quests - Fetch user quests
│   │   │   │   └── claim/
│   │   │   │       └── route.ts     # POST /api/quests/claim - Claim rewards
│   │   │   ├── badges/
│   │   │   │   ├── inventory/
│   │   │   │   │   └── route.ts     # GET /api/badges/inventory - User badges
│   │   │   │   ├── equip/
│   │   │   │   │   └── route.ts     # POST /api/badges/equip - Equip badge
│   │   │   │   └── unequip/
│   │   │   │       └── route.ts     # POST /api/badges/unequip - Unequip badge
│   │   │   └── leaderboard/
│   │   │       └── route.ts         # GET /api/leaderboard - Top players
│   │   ├── layout.tsx               # Root layout wrapper
│   │   ├── page.tsx                 # Landing page
│   │   ├── error.tsx                # Global error boundary
│   │   ├── not-found.tsx            # 404 page
│   │   ├── providers.tsx            # Context providers (Auth, Query, Notifications)
│   │   ├── dashboard/
│   │   │   ├── page.tsx             # Main game dashboard (protected)
│   │   │   ├── layout.tsx           # Dashboard layout wrapper
│   │   │   ├── loading.tsx          # Loading state
│   │   │   └── error.tsx            # Error boundary
│   │   ├── quests/
│   │   │   ├── page.tsx             # Quests/missions view
│   │   │   ├── layout.tsx           # Quests layout wrapper
│   │   │   ├── loading.tsx          # Loading state
│   │   │   └── error.tsx            # Error boundary
│   │   ├── badges/
│   │   │   ├── page.tsx             # Badges/achievements inventory
│   │   │   ├── layout.tsx           # Badges layout wrapper
│   │   │   ├── loading.tsx          # Loading state
│   │   │   └── error.tsx            # Error boundary
│   │   └── leaderboard/
│   │       ├── page.tsx             # Global leaderboard view
│   │       ├── layout.tsx           # Leaderboard layout wrapper
│   │       ├── loading.tsx          # Loading state
│   │       └── error.tsx            # Error boundary
│   │
│   ├── components/
│   │   ├── rpg/
│   │   │   ├── CharacterSheet.tsx   # Character stats & profile display
│   │   │   ├── GameHUD.tsx          # Head-up display with stats
│   │   │   ├── BattleStatsPanel.tsx # Combat stats panel
│   │   │   ├── QuestCard.tsx        # Quest card component
│   │   │   ├── AchievementBadges.tsx # Badge display component
│   │   │   ├── BadgeSlot.tsx        # Equippable badge slot
│   │   │   ├── LeaderboardCard.tsx  # Leaderboard entry component
│   │   │   └── ActivityHeatmap.tsx  # GitHub contribution heatmap
│   │   ├── ui/
│   │   │   ├── PixelComponents.tsx  # Pixel-art styled UI (buttons, frames, badges)
│   │   │   └── LoadingSkeletons.tsx # Loading skeleton screens
│   │   ├── layout/
│   │   │   └── Navigation.tsx       # Navigation header/menu
│   │   ├── effects/
│   │   │   └── Effects.tsx          # Visual effects (particles, animations)
│   │   ├── icons/
│   │   │   └── PixelIcons.tsx       # SVG icons (pixel art style)
│   │   ├── notifications/
│   │   │   └── NotificationProvider.tsx # Toast notifications context
│   │   ├── profile/
│   │   │   └── ProfileCustomization.tsx # Profile personalization settings
│   │   ├── onboarding/
│   │   │   └── OnboardingTutorial.tsx # First-time user tutorial
│   │   ├── export/
│   │   │   └── ShareableCard.tsx    # Shareable profile card component
│   │   ├── ErrorBoundary.tsx        # Global error boundary wrapper
│   │   └── index.ts                 # Central component exports
│   │
│   ├── lib/
│   │   ├── game-logic.ts            # XP calculation & rank progression
│   │   ├── github.ts                # GitHub API wrapper with caching
│   │   ├── quest-logic.ts           # Quest completion detection logic
│   │   ├── supabase.ts              # Supabase client initialization
│   │   ├── sound.ts                 # Audio effects manager
│   │   ├── pixel-utils.ts           # Pixel art & visual utilities
│   │   ├── rate-limit.ts            # Rate limiting for API calls
│   │   ├── hooks/
│   │   │   ├── usePerformanceMode.ts   # Performance optimization hook
│   │   │   └── useScreenShake.ts       # Screen shake effect hook
│   │   └── __tests__/
│   │       └── game-logic.test.ts   # Unit tests for game logic
│   │
│   └── types/
│       ├── database.ts              # Core database types (User, Quest, etc.)
│       ├── supabase.ts              # Auto-generated Supabase types
│       └── next-auth.d.ts           # NextAuth session type extensions
│
├── public/                          # Static assets (SVG icons, images)
├── migrations/                      # Database migration files
├── supabase/                        # Supabase configuration
├── supabase-schema.sql              # PostgreSQL schema & ENUM definitions
├── .env.example                     # Environment variables template
├── .env.local                       # Local environment (gitignored)
├── tailwind.config.ts               # Tailwind theme (Cyber-Fantasy)
├── tsconfig.json                    # TypeScript configuration (strict mode)
├── next.config.ts                   # Next.js configuration
├── postcss.config.mjs               # PostCSS configuration
├── eslint.config.mjs                # ESLint configuration
└── package.json                     # Dependencies & scripts
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
