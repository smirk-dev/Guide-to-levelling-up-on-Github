# UI/UX Architecture v2.0 - Code Warrior
**Redesigned for Clarity, Navigation, and Non-Overwhelming Data Presentation**

**Design Decisions Made:**
- Dashboard: Hybrid approach (Sticky sidebar hero info + tabbed content area)
- Leaderboard: Infinite scroll (25 users per batch)
- Badges: Prominent panel like battle stats
- Core mechanic: Maintain click-to-sync dopamine trigger

---

## 1. OVERALL STRUCTURE

### Current Problem
- **Dashboard:** 8+ sections, 2000px+ scroll required, all sections always visible
- **Navigation:** Simple but data organization forces excessive scrolling
- **Mobile:** Very tall pages, hard to find specific info quickly
- **Information Hierarchy:** Unclear - all sections compete for attention

### Proposed Solution
- **Tabbed Dashboard:** Organize 8 sections into 3 focused views (Quick, Activity, Quest)
- **Sticky Hero Sidebar:** User profile always visible (desktop), collapsible (mobile)
- **Data-Driven Tabs:** Each tab shows 3-4 related sections, avoiding overload
- **Infinite Scroll Leaderboard:** Load users in batches, better performance
- **Badges as Hero Widget:** Prominent panel in Quick View like Battle Stats

---

## 2. DASHBOARD REDESIGN (HYBRID APPROACH)

### Layout Structure

#### **Desktop (> 1024px)**
```
┌─────────────────────────────────────────────────────────┐
│                     GAMEHUD (Sticky)                    │
│  Avatar | XP Bar | Username | Rank | [SYNC BUTTON]     │
└─────────────────────────────────────────────────────────┘
┌──────────────────┬──────────────────────────────────────┐
│                  │                                      │
│  HERO SIDEBAR    │  CONTENT AREA (TABBED)              │
│  (Sticky)        │  ┌────────────────────────────────┐ │
│                  │  │ [Quick] [Activity] [Quests]    │ │
│ • Avatar         │  └────────────────────────────────┘ │
│ • Username       │                                      │
│ • Rank Badge     │  TAB CONTENT (Dynamically swaps)   │
│ • XP Progress    │  ┌────────────────────────────────┐ │
│ • Equipped       │  │                                │ │
│   Badges (3)     │  │  [Quick View Content]          │ │
│                  │  │  • Quick Stats Grid            │ │
│ ─────────────    │  │  • Battle Stats Panel          │ │
│ • Mini           │  │  • Equipped Badges Widget      │ │
│   Leaderboard    │  │  • Claimable Quests Alert      │ │
│   (Top 3)        │  │                                │ │
│                  │  └────────────────────────────────┘ │
└──────────────────┴──────────────────────────────────────┘
```

#### **Tablet (768px - 1024px)**
```
┌─────────────────────────────────────────────────────────┐
│                     GAMEHUD                             │
└─────────────────────────────────────────────────────────┘
┌──────────────────┬──────────────────────────────────────┐
│                  │  [Quick][Activity][Quests]         │
│  HERO SIDEBAR    │  ┌──────────────────────────────┐  │
│  (Sticky)        │  │   TAB CONTENT               │  │
│                  │  │   • Reduced margins         │  │
│ • Avatar         │  │   • 3-column stats grid     │  │
│ • Username       │  │   • Battle stats            │  │
│ • Rank           │  │                             │  │
│ • Badges (3)     │  └──────────────────────────────┘  │
│                  │                                    │
└──────────────────┴──────────────────────────────────────┘
```

#### **Mobile (< 768px)**
```
┌─────────────────────────────────────┐
│       GAMEHUD (Compact)             │
│ [Menu] | User | [SYNC]              │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ [Quick][Activity][Quests]           │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ TAB CONTENT (Full Width)            │
│                                     │
│ • Stats grid (2 columns)            │
│ • Battle stats (horizontal bars)    │
│ • Badges strip (scrollable)         │
│ • Quests (if active tab)            │
│                                     │
└─────────────────────────────────────┘

[Sidebar Hero Info: Collapsed to drawer, accessible via menu]
```

---

## 3. TAB ORGANIZATION & CONTENT

### Tab 1: "QUICK VIEW" (Default)
**Purpose:** At-a-glance personal status and current tasks
**Scroll Height:** ~600px (comfortable single screen or minimal scroll)
**Components:**

```
┌─ QUICK VIEW TAB ─────────────────────────────┐
│                                              │
│ [Welcome Banner] (First-time users)         │
│ ┌────────────────────────────────────────┐  │
│ │ Quick Stats Grid (4 columns)           │  │
│ │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │  │
│ │ │Total │ │Quests│ │Level │ │Repos │  │  │
│ │ │ XP   │ │Done  │ │   5  │ │  12  │  │  │
│ │ └──────┘ └──────┘ └──────┘ └──────┘  │  │
│ └────────────────────────────────────────┘  │
│                                              │
│ ┌─ Claimable Quests Alert (if any) ────┐   │
│ │ 🎯 3 quests ready to claim! Tap here.│   │
│ └────────────────────────────────────────┘   │
│                                              │
│ ┌─ Battle Stats Panel ──────────────────┐   │
│ │ Vertical bars: HP|MP|STR|CHA|WIS     │   │
│ │ ⬜⬜⬜⬜⬜                               │   │
│ │ ⬜⬜⬜⬜⬜                               │   │
│ │ (Shows RPG metrics at a glance)      │   │
│ └────────────────────────────────────────┘   │
│                                              │
│ ┌─ Equipped Badges Widget ──────────────┐   │
│ │ Currently Equipped:                   │   │
│ │ [Badge 1] [Badge 2] [Badge 3]        │   │
│ │ Boost: +20 to CHA, +15 to WIS        │   │
│ │ [Manage Badges] → Badges Page        │   │
│ └────────────────────────────────────────┘   │
│                                              │
└──────────────────────────────────────────────┘
```

**Data Sources:**
- User XP, rank, quests completed
- Current level (derived from XP)
- GitHub repos count
- Battle stats (from `calculateRPGStats()`)
- Equipped badges (from user_badges table)
- Claimable quests (from user_quests WHERE status='COMPLETED' AND claimed_at IS NULL)

**Interactions:**
- Stats grid → Informational (no click action)
- Claimable quests alert → Link to Quests tab
- Battle stats → Hover for details (optional modal)
- Equipped badges → Click to open Badges page
- Sync button → Top-level GameHUD (maintain dopamine mechanic)

---

### Tab 2: "ACTIVITY VIEW"
**Purpose:** Historical data and progression visualization
**Scroll Height:** ~800px (one scrollable section)
**Components:**

```
┌─ ACTIVITY VIEW TAB ──────────────────────────┐
│                                              │
│ ┌─ Contribution Activity ───────────────┐   │
│ │ Heatmap: Full Year Calendar          │   │
│ │ [JAN] [FEB] [MAR] ... [DEC]          │   │
│ │ Rows of 7 (Sun-Sat) with color scale │   │
│ │ Hover = date + contribution count    │   │
│ │                                      │   │
│ │ Scale: 0 | ■ | ■ | ■ | ■ (5+)      │   │
│ │ Legend: Darker = More contributions  │   │
│ └──────────────────────────────────────┘   │
│                                              │
│ ┌─ Monthly Breakdown (Optional) ────────┐   │
│ │ January: 42 contributions             │   │
│ │ February: 38 contributions            │   │
│ │ March: 51 contributions (Peak!)       │   │
│ │ ... (show progress bar per month)     │   │
│ └──────────────────────────────────────┘   │
│                                              │
│ ┌─ Rank Progression Timeline ───────────┐   │
│ │ Progress to next rank (SSS):          │   │
│ │ Current: 8,500 XP / 10,000 required   │   │
│ │ [████████░░] 85% to SSS               │   │
│ │                                      │   │
│ │ Rank milestones:                     │   │
│ │ ✓ C (0 XP)    ✓ B (2000 XP)         │   │
│ │ ✓ A (4000 XP) ✓ AA (6000 XP)        │   │
│ │ ✓ AAA (8000 XP) → SSS (10000 XP)   │   │
│ └──────────────────────────────────────┘   │
│                                              │
│ ┌─ Last Sync Info ──────────────────────┐   │
│ │ Last synced: 2 hours ago              │   │
│ │ GitHub stats updated: ✓               │   │
│ │ Quests auto-enrolled in new ones      │   │
│ └──────────────────────────────────────┘   │
│                                              │
└──────────────────────────────────────────────┘
```

**Data Sources:**
- Contribution calendar: `github_stats.contributions[]` array
- Monthly breakdown: Derived from contributions array
- Rank progression: Calculated from user XP + rank thresholds
- Last sync: User's `last_synced_at` field

**Interactions:**
- Heatmap hover → Show date + count tooltip
- Monthly bar hover → Show details for that month
- Rank milestone click → Show what earned that XP amount (optional)

---

### Tab 3: "QUESTS VIEW"
**Purpose:** Quest management and claiming rewards
**Scroll Height:** Variable (accordion expansion)
**Components:**

```
┌─ QUESTS VIEW TAB ─────────────────────────┐
│                                           │
│ ┌─ Quest Stats Bar ─────────────────────┐ │
│ │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ │ │
│ │ │Total │ │Active│ │Done  │ │Claimable│
│ │ │ 20   │ │ 5    │ │ 8    │ │ 2    │ │ │
│ │ └──────┘ └──────┘ └──────┘ └──────┘ │ │
│ └───────────────────────────────────────┘ │
│                                           │
│ ┌─ Quest Log (Accordion) ────────────────┐ │
│ │                                       │ │
│ │ 🟡 ACTIVE QUESTS                      │ │
│ │ ┌─ [▼] Merge 5 Pull Requests       │ │
│ │ │     Progress: 3/5 (60%)         │ │
│ │ │     Reward: 250 XP              │ │
│ │ │     [Claim] (disabled)          │ │
│ │ └───────────────────────────────── │ │
│ │ ┌─ [▼] Star 10 Repositories       │ │
│ │ │     Progress: 7/10 (70%)        │ │
│ │ │     Reward: 100 XP              │ │
│ │ │     [Claim] (disabled)          │ │
│ │ └───────────────────────────────── │ │
│ │                                       │ │
│ │ 🟢 COMPLETED (Claimable)              │ │
│ │ ┌─ [▼] Review 20 PRs               │ │
│ │ │     Progress: 20/20 ✓            │ │
│ │ │     Reward: 500 XP               │ │
│ │ │     [CLAIM REWARD] ← Clickable   │ │
│ │ └───────────────────────────────── │ │
│ │                                       │ │
│ │ ⚪ NOT STARTED                        │ │
│ │ ┌─ [▶] Contribute to 3 Projects    │ │
│ │ │     Progress: 0/3                │ │
│ │ │     Reward: 300 XP               │ │
│ │ └───────────────────────────────── │ │
│ │                                       │ │
│ └───────────────────────────────────────┘ │
│                                           │
│ [SYNC NOW] ← Lower visibility than HUD   │
│                                           │
└───────────────────────────────────────────┘
```

**Data Sources:**
- All quests from `quests` table
- User quest progress from `user_quests` join
- Quest status calculations based on GitHub stats
- Claimable count: WHERE status='COMPLETED' AND claimed_at IS NULL

**Interactions:**
- Quest card expand/collapse → Show full details
- [CLAIM REWARD] button → POST to `/api/quests/claim`
  - On success: Quest marked as claimed, XP awarded, floating animation, sound effect
  - Toast notification + confetti animation
- [SYNC NOW] → Same as GameHUD sync button (maintain mechanic)

---

## 4. HERO SIDEBAR (STICKY)

### Desktop (Always Visible)
```
┌─────────────────────┐
│  HERO SIDEBAR       │
│  (Width: 240px)     │
│                     │
│ ┌─────────────────┐ │
│ │   Avatar        │ │
│ │  (112px round)  │ │
│ │  Rank Badge     │ │
│ │   (overlay)     │ │
│ └─────────────────┘ │
│                     │
│  Username           │
│  @github_handle     │
│                     │
│  Rank: S            │
│  Level 25           │
│                     │
│ ┌─────────────────┐ │
│ │ XP to Next Rank │ │
│ │ [████████░░]    │ │
│ │ 8500/10000      │ │
│ └─────────────────┘ │
│                     │
│ ─────────────────   │
│ Equipped Badges:    │
│ [Badge1] [Badge2]   │
│ [Badge3] [Trophy]   │
│ (up to 5 visible)   │
│                     │
│ ─────────────────   │
│ You Rank:           │
│ 🥇 #5 of 127        │
│                     │
│ ┌─────────────────┐ │
│ │ Mini Leaderboard│ │
│ │ (Top 3 around   │ │
│ │  you)           │ │
│ │                 │ │
│ │ 1. Player A +50 │ │
│ │ 2. You 🎯       │ │
│ │ 3. Player B -30 │ │
│ └─────────────────┘ │
│                     │
└─────────────────────┘
```

**Behavior:**
- Sticky: Stays in viewport as user scrolls content area
- Non-interactive except badges/rank (click to navigate)
- Updates in real-time when user claims rewards or syncs
- Width: 240px (desktop), collapsible (mobile)

### Mobile (Collapsible)
- Hero info tucked in collapsible drawer (hamburger menu)
- Shows same info but vertically stacked
- Drawer triggers from Navigation menu

---

## 5. LEADERBOARD REDESIGN (INFINITE SCROLL)

### Layout Structure

#### **Desktop**
```
┌─────────────────────────────────────────────────┐
│           LEADERBOARD PAGE                      │
├─────────────────────────────────────────────────┤
│ Your Rank: #5 / 127 Warriors                   │
│                                                 │
│ [Search Box: Search by username...]             │
│ [Tier Filters: ALL | SSS | SS | S | AA | A | B]│
│                                                 │
│ Showing 127 warriors                            │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ RANK │ USER           │ LEVEL │ XP       │ │ │
│ ├──────┼────────────────┼───────┼──────────┤ │ │
│ │  1   │ 🥇 Player A    │  30   │ 15,000   │ │ │
│ │  2   │ 🥈 Player B    │  28   │ 14,200   │ │ │
│ │  3   │ 🥉 Player C    │  27   │ 13,800   │ │ │
│ │  4   │ 🎯 Player D    │  26   │ 12,500   │ │ │
│ │  5   │ 👤 YOU         │  25   │ 11,800   │ │ │ ← Highlighted
│ │  6   │ 🎯 Player E    │  24   │ 11,200   │ │ │
│ │ ...  │ ...            │ ...   │ ...      │ │ │
│ │ 50   │ 🎯 Player Z    │   8   │  2,100   │ │ │
│ │      │ [LOAD MORE...]    (auto-load 25)   │ │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Loading 25 users per scroll batch               │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Interactions:**
- Click on any player → Open profile modal overlay
- Search input → Real-time filter by username
- Tier buttons → Filter by rank tier (client-side or server-side)
- Auto-load 25 more users when scroll near bottom

#### **Mobile**
```
┌────────────────────┐
│  LEADERBOARD       │
├────────────────────┤
│ Your Rank: #5      │
│                    │
│ [Search...]        │
│ [ALL][SSS][SS]...  │ (horizontal scroll)
│                    │
│ RANK │ USER │ XP   │
│──────┼──────┼──────│
│  1   │ A    │15k   │
│  2   │ B    │14k   │
│  3   │ C    │13k   │
│  5   │ YOU  │11k   │ ← Different color
│  6   │ D    │11k   │
│      │[Load]│      │
│      │more..│      │
└────────────────────┘
```

### Profile Modal (On Click)
```
┌──────────────────────────────────────┐
│ User Profile Modal                   │
│ [X] Close                            │
├──────────────────────────────────────┤
│                                      │
│        [Avatar]                      │
│    Player Name                       │
│    @github_handle                    │
│    Rank: S (🎯 Rank #5)             │
│                                      │
│ ┌────────┬────────┬────────────┐    │
│ │  XP    │ Level  │ Repos      │    │
│ │ 11,800 │   25   │    18      │    │
│ └────────┴────────┴────────────┘    │
│                                      │
│ Badges Earned:                       │
│ [Badge 1] [Badge 2] [Badge 3]       │
│                                      │
│ [View GitHub Profile] (external)    │
│                                      │
└──────────────────────────────────────┘
```

**Data Loading:**
- Initial load: 25 users (ranked by XP DESC)
- Scroll to bottom: Load next 25 users
- Search/filter: Reset to position 1, load 25 matching users
- Pagination limit: Stop at user count

---

## 6. BADGES REDESIGN (PROMINENT PANEL)

### Dashboard Integration (Quick View)

Already shown in QUICK VIEW tab above. Badges section includes:
- Currently equipped badges (3-5 visible)
- Stat boosts displayed
- [Manage Badges] link to full page

### Full Badges Page

```
┌──────────────────────────────────────────────┐
│         BADGES PAGE                          │
├──────────────────────────────────────────────┤
│ Unlocked: 12/25 | Equipped: 3/5 | 48%       │
│                                              │
│ [Filter: ALL][UNLOCKED][LOCKED][EQUIPPED]  │
│                                              │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐         │
│ │ 🎖  │ │ 🎖  │ │ ??  │ │ 🎖  │ │ 🎖  │     │
│ │ B1  │ │ B2  │ │ B3  │ │ B4  │ │ B5  │     │
│ │✓Equip
│ │ 🎖  │ │ 🎖  │ │ 🎖  │ │ 🎖  │ │ 🎖  │     │
│ └────┘ └────┘ └────┘ └────┘ └────┘         │
│                                              │
│ [Badges: Tier 1 & 2]                        │
│ • Pull Shark (STR +5) - Unlocked, Equipped  │
│ • Starstruck (CHA +10) - Unlocked, Equip   │
│ • Galaxy Brain (WIS +15) - Locked (0/20)   │
│                                              │
└──────────────────────────────────────────────┘
```

**Interactions:**
- Click badge → Toggle equip status (up to 5)
- Hover badge → Show stat boosts + description
- Filter buttons → Show subset of badges
- Stat boost preview → Real-time updates when badge equipped/unequipped

---

## 7. RESPONSIVE BREAKPOINTS

### Breakpoint Strategy

| Breakpoint | Device | Layout | Hero Sidebar | Tabs | Content |
|------------|--------|--------|--------------|------|---------|
| < 480px | Mobile (Phone) | Single column | Drawer | Horizontal scroll | Full width |
| 480px - 768px | Mobile (Large) | Single column | Drawer | Horizontal scroll | Full width |
| 768px - 1024px | Tablet | 2 column grid | Narrow sidebar (120px) | Horizontal tabs | Main area |
| 1024px - 1440px | Laptop | 2 column (280px sidebar) | Full sidebar | Horizontal tabs | Content area |
| > 1440px | Desktop (Large) | 2 column (300px sidebar) | Full sidebar | Horizontal tabs | Content area |

### Mobile-Specific Changes
- Hero sidebar → Collapsible drawer (click hamburger menu)
- Tabs → Horizontal scroll if needed, stay in view
- Content → Full width, responsive padding
- Stats grid → 2 columns instead of 4
- Battle stats → Horizontal bars instead of vertical
- Leaderboard → Compact view (rank, name, XP only)

---

## 8. DATA FLOW ARCHITECTURE

### Dashboard Data Fetching

```
Dashboard Page (Client Component)
├─ useSession() → Check auth
│
├─ Tab Selection State
│   └─ useState('quick') → Track active tab
│
├─ useQuery(['dashboard'])
│   └─ Fetches: User + GameHubStats + RankInfo
│       Endpoint: GET /api/dashboard/user
│       Response: { user, github_stats, rank, xp }
│
├─ useQuery(['quests'])
│   └─ Fetches: All quests + user quest progress
│       Endpoint: GET /api/quests
│       Response: { quests[], user_quests[] }
│
├─ useQuery(['badges'])
│   └─ Fetches: All badges + equipped status
│       Endpoint: GET /api/badges
│       Response: { badges[], equipped_badge_ids[] }
│
└─ useMutation(['sync'])
    └─ POST /api/sync
       Triggers: Calculate stats, enroll quests, update badges
       On success: Invalidate all above queries → Data refreshes
```

**Render Logic:**
```typescript
// Pseudocode
const [activeTab, setActiveTab] = useState('quick');

switch(activeTab) {
  case 'quick':
    return <QuickView user={user} stats={stats} badges={badges} />;
  case 'activity':
    return <ActivityView contributions={contributions} rank={rank} />;
  case 'quests':
    return <QuestsView quests={quests} userQuests={userQuests} />;
}
```

---

## 9. COMPONENT STRUCTURE (NEW)

### Dashboard Component Tree

```
DashboardPage ('use client')
├─ GameHUD (sticky top)
│  ├─ Avatar + Username
│  ├─ XP Bar (main rank progress)
│  ├─ Current Rank Badge
│  └─ [SYNC BUTTON] ← DOPAMINE TRIGGER
│
├─ MainGrid (2 columns: sidebar + content)
│  │
│  ├─ HeroSidebar (sticky, desktop)
│  │  ├─ Avatar + Username + Rank
│  │  ├─ XP to Next Rank
│  │  ├─ Equipped Badges Widget
│  │  ├─ Rank Position (#5 of 127)
│  │  └─ Mini Leaderboard (top 3 context)
│  │
│  └─ ContentArea (responsive)
│     ├─ Tab Navigation (Quick | Activity | Quests)
│     │
│     ├─ TabPanel: QUICK VIEW
│     │  ├─ Welcome Banner (conditional)
│     │  ├─ Quick Stats Grid (4-col or responsive)
│     │  ├─ Claimable Quests Alert
│     │  ├─ Battle Stats Panel (5 vertical bars)
│     │  └─ Equipped Badges Widget + Link
│     │
│     ├─ TabPanel: ACTIVITY VIEW
│     │  ├─ Contribution Heatmap (calendar)
│     │  ├─ Monthly Breakdown (optional bars)
│     │  ├─ Rank Progression Timeline
│     │  └─ Last Sync Info
│     │
│     └─ TabPanel: QUESTS VIEW
│        ├─ Quest Stats Bar (total, active, done, claimable)
│        ├─ Quest Log Accordion
│        │  ├─ Active Section
│        │  │  └─ QuestCard (expandable) × N
│        │  ├─ Completed/Claimable Section
│        │  │  └─ QuestCard (expandable, Claim button enabled) × N
│        │  └─ Not Started Section
│        │     └─ QuestCard (expandable, locked) × N
│        └─ [SYNC NOW] Link
│
├─ Floating XP Component (overlay, position: fixed)
├─ Toast Notifications (overlay)
└─ Quest Complete Modal (overlay, conditional)
```

### Leaderboard Component Tree

```
LeaderboardPage ('use client')
├─ PageLayout
│  ├─ Title + Your Rank Display
│  ├─ Search Bar + Tier Filters
│  ├─ Results Count
│  │
│  └─ LeaderboardTable (Infinite Scroll)
│     ├─ Table Header (Rank | User | Level | XP)
│     ├─ TableRows (rendered virtualized)
│     │  └─ UserRow (clickable)
│     ├─ Intersection Observer (bottom detection)
│     └─ Loading Indicator (batch fetch)
│
└─ UserProfileModal (overlay, on click)
   ├─ Avatar + Username + Rank
   ├─ Stats Grid (XP, Level, Repos)
   ├─ Badges Grid
   └─ GitHub Link
```

---

## 10. INTERACTION FLOWS

### Flow 1: Daily Check-In (Most Common)
```
1. User opens app
2. Sees Dashboard (default: Quick View tab)
3. Scans: Quick stats, equipped badges, active quests
4. Clicks [SYNC] button (dopamine trigger!)
5. GitHub API fetches updated stats
6. XP increments, new quests available
7. Floating XP animation + sound effect
8. Toast notification confirms sync
9. Tab automatically shows updated data
10. User can claim rewards (if any completed quests)
```

### Flow 2: Quest Progress Tracking
```
1. User navigates to Quests tab
2. Sees quest stats bar (Active, Completed, Claimable)
3. Scrolls through quests grouped by status
4. Finds completed quest
5. Clicks [CLAIM REWARD] button
6. XP added, badge earned, animation plays
7. Quest marked as claimed
8. Can navigate back to Quick View to see updated stats
```

### Flow 3: Leaderboard Comparison
```
1. User navigates to Leaderboard page
2. Sees their rank (#5 of 127)
3. Scrolls infinite scroll to find friends
4. Clicks on a player to view modal
5. Sees their stats, badges, GitHub link
6. Can close modal or open GitHub profile
7. Infinite scroll loads more players as needed
```

### Flow 4: Badge Management
```
1. User on Dashboard Quick View
2. Sees Equipped Badges section
3. Clicks [Manage Badges] link
4. Navigates to full Badges page
5. Sees all unlocked badges in grid
6. Clicks badge to equip/unequip (max 5)
7. Stats update in real-time
8. Can return to Dashboard, see updated badge boosts
```

---

## 11. TECHNICAL SPECIFICATIONS

### Tab State Management
```typescript
// Dashboard uses local state (no persistence initially)
const [activeTab, setActiveTab] = useState<'quick' | 'activity' | 'quests'>('quick');

// Future: Can add to localStorage
useEffect(() => {
  localStorage.setItem('dashboard_tab', activeTab);
}, [activeTab]);

// On mount: Restore preference
useEffect(() => {
  const saved = localStorage.getItem('dashboard_tab');
  if (saved) setActiveTab(saved);
}, []);
```

### Infinite Scroll Leaderboard
```typescript
// Use Intersection Observer for bottom-of-list detection
const [page, setPage] = useState(0);
const observerTarget = useRef(null);

useEffect(() => {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && hasMore) {
      setPage(p => p + 1); // Fetch next batch
    }
  });
  
  if (observerTarget.current) {
    observer.observe(observerTarget.current);
  }
  
  return () => observer.disconnect();
}, [hasMore]);

// Query with pagination
const { data, isLoading, isFetching } = useQuery(
  ['leaderboard', page],
  () => fetchLeaderboard(page),
  { keepPreviousData: true }
);
```

### Sticky Sidebar (Desktop)
```css
.hero-sidebar {
  position: sticky;
  top: 64px; /* Below GameHUD */
  height: calc(100vh - 64px);
  overflow-y: auto;
  width: 240px;
}
```

### Tab Navigation
```typescript
const tabs = [
  { id: 'quick', label: 'Quick View', icon: '⚡' },
  { id: 'activity', label: 'Activity', icon: '📊' },
  { id: 'quests', label: 'Quests', icon: '🎯' }
];

return (
  <div className="tab-navigation">
    {tabs.map(tab => (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className={activeTab === tab.id ? 'active' : ''}
      >
        {tab.icon} {tab.label}
      </button>
    ))}
  </div>
);
```

---

## 12. MIGRATION STRATEGY

### Phase 1: Dashboard Tabs
1. Extract current dashboard content into tab components
2. Create Tab navigation component
3. Add useState for activeTab
4. Update CSS to make sidebar sticky
5. Test responsive layout at each breakpoint

### Phase 2: Leaderboard Infinite Scroll
1. Implement Intersection Observer
2. Modify pagination logic in API
3. Add batch fetching (25 users per request)
4. Test loading states and edge cases

### Phase 3: Badges Prominence
1. Move equipped badges higher in Quick View
2. Add badge stat boost display
3. Add "Manage Badges" link to Dashboard
4. Integrate with existing Badges page

### Phase 4: Polish & Responsive
1. Test on mobile, tablet, laptop, desktop
2. Adjust breakpoints as needed
3. Add animations for tab transitions
4. Optimize performance (lazy load images, etc.)

---

## 13. FILE STRUCTURE CHANGES

### New Components
```
src/components/
├─ dashboard/
│  ├─ DashboardTabs.tsx (new)
│  ├─ QuickViewTab.tsx (new)
│  ├─ ActivityViewTab.tsx (new)
│  ├─ QuestsViewTab.tsx (new)
│  ├─ HeroSidebar.tsx (new)
│  └─ TabNavigation.tsx (new)
├─ leaderboard/
│  ├─ LeaderboardTable.tsx (refactored)
│  ├─ InfiniteScrollContainer.tsx (new)
│  └─ UserProfileModal.tsx (existing)
└─ ...
```

### CSS Updates
```
src/styles/
├─ dashboard-layout.css (update)
├─ hero-sidebar.css (new)
├─ tab-navigation.css (new)
├─ leaderboard-infinite-scroll.css (new)
└─ ...
```

---

## 14. PERFORMANCE CONSIDERATIONS

### Data Fetching Optimization
- **Dashboard queries:** StaleTime 60s, no refetchOnWindowFocus
- **Leaderboard:** Paginate 25 users per request (vs. all at once)
- **Images:** Use Next.js Image component with optimization
- **Lazy load:** Activity heatmap on Activity tab click

### Rendering Optimization
- **Virtualization:** Leaderboard table uses react-window for 100+ rows
- **Memoization:** Tab components memoized to prevent re-renders
- **Code splitting:** Each tab content code-split via dynamic import

### Bundle Size
- **Remove:** Unused quest components from quick view
- **Lazy load:** Badge management modal
- **Tree shake:** Unused utility functions

---

## 15. ACCESSIBILITY & UX

### Keyboard Navigation
- Tab key: Navigate between tabs
- Arrow keys: Scroll through quest list (accordion)
- Enter: Expand accordion, click buttons
- Space: Toggle badge equip status

### Screen Readers
- Tab labels have `aria-label` and `aria-current="page"`
- Quest cards have semantic HTML structure
- Modals have `role="dialog"` and focus management

### Color & Contrast
- Maintain existing pixel art aesthetic
- Ensure 4.5:1 contrast ratio for text
- Use icons + text (not icons alone)

---

## 16. SUCCESS METRICS

After implementation, measure:
- **Scroll depth:** Average scroll distance on Dashboard (should decrease)
- **Page load time:** Dashboard load time (should stay < 2s)
- **Quest claims:** Increase in quests claimed per session (easier access)
- **Leaderboard engagement:** Click-through rate on player profiles
- **Mobile usage:** Increase in mobile vs. desktop sessions
- **Feature adoption:** % of users accessing Activity tab, Badge management

---

## 17. SUMMARY & DECISION TRACKER

| Aspect | Decision | Status |
|--------|----------|--------|
| **Dashboard Sections** | Tab-based (Quick, Activity, Quests) | ✅ CHOSEN |
| **Sidebar Layout** | Sticky hero info (desktop), drawer (mobile) | ✅ CHOSEN |
| **Leaderboard Pagination** | Infinite scroll (25 users per batch) | ✅ CHOSEN |
| **Badges Prominence** | Prominent panel in Quick View tab | ✅ CHOSEN |
| **Sync Functionality** | Maintain click-to-sync (GameHUD + Quests tab) | ✅ CONFIRMED |
| **Information Density** | Reduce via tabs (sections 600-800px each) | ✅ DECIDED |
| **Navigation Complexity** | Simplify via sticky sidebar + tab organization | ✅ DECIDED |
| **Mobile Experience** | Drawer sidebar + responsive tabs | ✅ PLANNED |

---

**Next Steps:** Once approved, implementation can begin with Phase 1 (Dashboard Tabs).
