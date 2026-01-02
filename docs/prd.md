# Product Requirements Document (PRD): Code Warrior

## 1. Goals & Objectives
* **Primary Goal:** Gamify the GitHub learning process to increase user engagement and commit consistency for beginners.
* **Success Metrics:**
    * User Retention: % of users returning after 7 days.
    * Quest Completion: % of users finishing the "Tutorial" questline.
    * "Level Up" Rate: Average time to reach Rank B.

## 2. Background Context
Learning Git and GitHub can be intimidating and dry. New developers often lack motivation to keep their "contribution graph" green. "Code Warrior" solves this by providing immediate, visceral feedback (visual and auditory) for coding actions, turning professional development into an addictive RPG loop.

## 3. User Stories (Functional Requirements)

### FR1: Authentication & Profile Creation
* **As a user,** I want to sign in with my GitHub account so that the game can access my coding stats automatically.
* **As a user,** I want a "Character Sheet" generated instantly upon login, converting my existing GitHub history into RPG stats (Strength, Wisdom, etc.).

### FR2: The RPG Dashboard (Core Loop)
* **As a user,** I want to see my "Health" (Commits) and "Mana" (Reviews) bars visualised so I know my current activity levels.
* **As a user,** I want to see my current Rank (C, B, A, S) clearly displayed with a progress bar to the next rank.
* **As a user,** I want to equip "Badges" (e.g., Pull Shark) on my avatar slot.

### FR3: Quest System (Tutorials)
* **As a beginner,** I want a list of "Active Quests" (e.g., "Create your first Repo") that guide me on what to do next.
* **As a user,** I want to click "Claim Reward" after finishing a task on GitHub to receive XP and a sound effect/animation in the game.

### FR4: Leaderboards (Social)
* **As a competitive user,** I want to see a "Hall of Fame" (Leaderboard) ranking users by Total XP so I can compete with others.

## 4. Non-Functional Requirements (NFRs)
* **Performance:** The dashboard must load user stats within 2 seconds of login.
* **Reliability:** GitHub API rate limits must be handled gracefully (caching stats for 15-60 minutes).
* **Aesthetics:** The UI must feel "juicy" (high usage of animations, sound effects, and playful fonts).

## 5. Epics (Implementation Roadmap)

### Epic 1: The Foundation (MVP)
* Setup Next.js + Supabase + Tailwind.
* Implement GitHub OAuth.
* Create the "Stat Calculation Engine" (Logic to convert API JSON -> RPG Stats).

### Epic 2: The Character Sheet
* Build the visual Dashboard (Avatar, Health Bars, XP Bar).
* Implement the "Rank Up" logic and visual components.

### Epic 3: The Quest System
* Build the Quest Tracker UI.
* Implement logic to verify specific GitHub actions (did they actually create a repo?).

### Epic 4: Polish & Juice
* Add Framer Motion animations (confetti on level up).
* Add Sound Effects (retro SFX).
* Mobile responsiveness adjustments.