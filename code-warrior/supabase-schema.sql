-- Code Warrior Database Schema
-- Based on docs/architecture.md specifications
-- Execute this in your Supabase SQL Editor

-- Create ENUM types for structured data
CREATE TYPE rank_tier AS ENUM ('C', 'B', 'A', 'AA', 'AAA', 'S', 'SS', 'SSS');
CREATE TYPE quest_status AS ENUM ('ACTIVE', 'COMPLETED');
CREATE TYPE criteria_type AS ENUM ('REPO_COUNT', 'PR_MERGED', 'STAR_COUNT', 'COMMIT_COUNT', 'ISSUE_COUNT', 'REVIEW_COUNT');

-- ============================================
-- Table: users
-- Stores the core RPG character data
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_id VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  xp INTEGER DEFAULT 0 NOT NULL,
  rank_tier rank_tier DEFAULT 'C' NOT NULL,
  -- Stores GitHub metrics, contributions, and calculated badges in the following structure:
  -- {
  --   "stars": number,
  --   "repos": number,
  --   "commits": number,
  --   "prs": number,
  --   "issues": number,
  --   "reviews": number,
  --   "contributions": [
  --     {"date": "2024-01-01", "count": 5, "level": 0-4},
  --     ...
  --   ],
  --   "badges": [
  --     {
  --       "id": "pull-shark-x1",
  --       "name": "Pull Shark",
  --       "tier": "x1" | "x2" | "x3" | "x4" | null,
  --       "description": "...",
  --       "unlockedAt": "2024-01-01T..."
  --     },
  --     ...
  --   ]
  -- }
  github_stats JSONB DEFAULT '{"stars": 0, "repos": 0, "commits": 0, "prs": 0, "issues": 0, "reviews": 0, "contributions": [], "badges": []}'::jsonb,
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NULL, -- Allow NULL for first-time users
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast GitHub ID lookups during auth
CREATE INDEX idx_users_github_id ON users(github_id);

-- ============================================
-- Table: badges
-- Defines badge items that boost stats
-- MUST BE CREATED BEFORE quests (which references it)
-- ============================================
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  icon_slug VARCHAR(255) NOT NULL,
  stat_boost JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Table: quests
-- Defines the tutorial/quest templates
-- ============================================
CREATE TABLE quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  xp_reward INTEGER NOT NULL,
  criteria_type criteria_type NOT NULL,
  criteria_threshold INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  badge_reward UUID REFERENCES badges(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Table: user_quests
-- Join table tracking user quest progress
-- ============================================
CREATE TABLE user_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  status quest_status DEFAULT 'ACTIVE' NOT NULL,
  progress INTEGER DEFAULT 0 NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, quest_id)
);

-- Index for fast user quest lookups
CREATE INDEX idx_user_quests_user_id ON user_quests(user_id);
CREATE INDEX idx_user_quests_status ON user_quests(status);

-- ============================================
-- Table: user_badges
-- Join table tracking user badge ownership and equipment
-- ============================================
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  equipped BOOLEAN DEFAULT false NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Index for fast user badge lookups
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_equipped ON user_badges(user_id, equipped);

-- ============================================
-- Seed Data: Initial Quests (Tutorial)
-- From docs/project-brief.md
-- ============================================
INSERT INTO quests (title, description, xp_reward, criteria_type, criteria_threshold) VALUES
  ('The First Step', 'Create your first GitHub repository and begin your journey as a Code Warrior.', 50, 'REPO_COUNT', 1),
  ('Community Voice', 'Open an issue in any repository to earn the Scroll of Truth.', 30, 'ISSUE_COUNT', 1),
  ('The Merger', 'Successfully merge your first pull request to prove your strength.', 100, 'PR_MERGED', 1);

-- ============================================
-- Seed Data: Initial Badges
-- From docs/project-brief.md
-- ============================================
INSERT INTO badges (name, icon_slug, stat_boost) VALUES
  ('Newbie Sword', 'sword', '{"strength": 5}'),
  ('Scroll of Truth', 'scroll', '{"wisdom": 10}'),
  ('Pull Shark', 'shark', '{"strength": 15, "charisma": 10}'),
  ('YOLO Badge', 'yolo', '{"risk": 10}');

-- ============================================
-- Function: Auto-update timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update users.updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
