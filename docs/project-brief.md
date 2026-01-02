# Project Brief: Code Warrior (GitHub RPG)

## 1. Vision & Core Value
"Code Warrior" is a browser-based RPG that transforms a user's GitHub activity into a fantasy character's stats and achievements. The goal is to addictively guide **Complete Beginners** through their coding journey by turning dry tasks (like "making a commit") into epic quests (e.g., "Slay the Empty Repo Beast").

## 2. Target Audience
* **Primary:** Complete Beginners (Level 1 Novices).
* **Secondary:** Junior Developers building portfolios.

## 3. The "Game" Mechanics (Adapted from Guide)
We will map GitHub metrics directly to RPG attributes:
* **XP System:** Based on the "Profile Stats" weights.
    * *Stars* = **Charisma/Fame** (High XP reward)
    * *Pull Requests* = **Strength/Attack** (High XP)
    * *Commits* = **Stamina/Health** (Moderate XP)
    * *Issues/Reviews* = **Wisdom/Mana** (Lower XP)
* **Ranks (Class Tiers):**
    * Users start at **Rank C (Novice)**.
    * Progression: C -> B -> A -> AA -> AAA -> S -> SS -> SSS (Legend).
* **Quests (The Tutorial):**
    * *Quest 1:* "The First Step" (Create a Repo) -> Reward: "Newbie Sword".
    * *Quest 2:* "Community Voice" (Open an Issue) -> Reward: "Scroll of Truth".
    * *Quest 3:* "The Merger" (Merge a PR) -> Reward: "Pull Shark Badge".
* **Badges (Trophies):** Visual items equipped on the avatar (e.g., "YOLO Badge" adds Risk +10).

## 4. User Interface (The "Vibe")
* **Theme:** 16-bit or vector Fantasy RPG style.
* **Dashboard:** Displays a "Character Sheet" instead of a standard profile.
    * *Avatar:* Customizable or auto-generated based on GitHub identicon.
    * *Health/Mana Bars:* Represented by Commit/PR consistency.
* **Feedback:** Level-up animations, sound effects (retro "coin" sounds), and shaking screen effects for big achievements.

## 5. Technical Stack Recommendation
* **Frontend:** Next.js (React), Tailwind CSS, Framer Motion.
* **Backend:** Next.js API Routes (Serverless).
* **Database:** Supabase (PostgreSQL) for game data/leaderboards.
* **Auth:** NextAuth.js (GitHub OAuth).
* **Data Fetching:** GitHub REST/GraphQL API.