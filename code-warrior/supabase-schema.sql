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

-- ============================================
-- Function: Resolve GitHub ID from JWT claims
-- ============================================
CREATE OR REPLACE FUNCTION requesting_github_id()
RETURNS TEXT AS $$
  SELECT COALESCE(auth.jwt() ->> 'sub', '');
$$ LANGUAGE sql STABLE;

-- ============================================
-- Function: Atomic quest reward claim
-- ============================================
CREATE OR REPLACE FUNCTION claim_quest_reward_atomic(
  p_github_id TEXT,
  p_quest_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_user_quest_id UUID;
  v_status quest_status;
  v_claimed_at TIMESTAMP WITH TIME ZONE;
  v_quest_xp INTEGER;
  v_badge_reward UUID;
  v_new_total_xp INTEGER;
  v_badge_awarded BOOLEAN := FALSE;
  v_row_count INTEGER := 0;
BEGIN
  SELECT id
  INTO v_user_id
  FROM users
  WHERE github_id = p_github_id
  FOR UPDATE;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  SELECT uq.id, uq.status, uq.claimed_at, q.xp_reward, q.badge_reward
  INTO v_user_quest_id, v_status, v_claimed_at, v_quest_xp, v_badge_reward
  FROM user_quests uq
  JOIN quests q ON q.id = uq.quest_id
  WHERE uq.user_id = v_user_id
    AND uq.quest_id = p_quest_id
  FOR UPDATE OF uq;

  IF v_user_quest_id IS NULL THEN
    RAISE EXCEPTION 'Quest progress not found';
  END IF;

  IF v_status <> 'COMPLETED'::quest_status THEN
    RAISE EXCEPTION 'Quest not completed yet';
  END IF;

  IF v_claimed_at IS NOT NULL THEN
    RAISE EXCEPTION 'Quest reward already claimed';
  END IF;

  UPDATE user_quests
  SET claimed_at = NOW()
  WHERE id = v_user_quest_id
    AND claimed_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quest reward already claimed';
  END IF;

  UPDATE users
  SET xp = xp + v_quest_xp
  WHERE id = v_user_id
  RETURNING xp INTO v_new_total_xp;

  IF v_badge_reward IS NOT NULL THEN
    INSERT INTO user_badges (user_id, badge_id)
    VALUES (v_user_id, v_badge_reward)
    ON CONFLICT (user_id, badge_id) DO NOTHING;

    GET DIAGNOSTICS v_row_count = ROW_COUNT;
    v_badge_awarded := v_row_count > 0;
  END IF;

  RETURN jsonb_build_object(
    'xpGained', v_quest_xp,
    'newTotalXP', v_new_total_xp,
    'userQuestId', v_user_quest_id,
    'badgeAwarded', v_badge_awarded
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================
-- Function: Atomic badge equip
-- ============================================
CREATE OR REPLACE FUNCTION equip_badge_atomic(
  p_github_id TEXT,
  p_badge_id UUID,
  p_max_equipped INTEGER DEFAULT 3
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_badge_name TEXT;
  v_already_equipped BOOLEAN;
  v_equipped_count INTEGER;
BEGIN
  SELECT id
  INTO v_user_id
  FROM users
  WHERE github_id = p_github_id
  FOR UPDATE;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  PERFORM 1
  FROM user_badges
  WHERE user_id = v_user_id
  FOR UPDATE;

  SELECT b.name, ub.equipped
  INTO v_badge_name, v_already_equipped
  FROM user_badges ub
  JOIN badges b ON b.id = ub.badge_id
  WHERE ub.user_id = v_user_id
    AND ub.badge_id = p_badge_id
  FOR UPDATE OF ub;

  IF v_badge_name IS NULL THEN
    RAISE EXCEPTION 'You do not own this badge';
  END IF;

  IF v_already_equipped THEN
    RAISE EXCEPTION 'Badge is already equipped';
  END IF;

  SELECT COUNT(*)
  INTO v_equipped_count
  FROM user_badges
  WHERE user_id = v_user_id
    AND equipped = TRUE;

  IF v_equipped_count >= p_max_equipped THEN
    RAISE EXCEPTION 'Maximum % badges can be equipped', p_max_equipped;
  END IF;

  UPDATE user_badges
  SET equipped = TRUE
  WHERE user_id = v_user_id
    AND badge_id = p_badge_id
    AND equipped = FALSE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Badge is already equipped';
  END IF;

  RETURN jsonb_build_object(
    'badgeName', v_badge_name,
    'equippedCount', v_equipped_count + 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION claim_quest_reward_atomic(TEXT, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION claim_quest_reward_atomic(TEXT, UUID) TO service_role;

REVOKE ALL ON FUNCTION equip_badge_atomic(TEXT, UUID, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION equip_badge_atomic(TEXT, UUID, INTEGER) TO service_role;

-- ============================================
-- Row Level Security
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS users_select_own ON users;
CREATE POLICY users_select_own ON users
  FOR SELECT
  TO authenticated
  USING (github_id = requesting_github_id());

DROP POLICY IF EXISTS users_update_own ON users;
CREATE POLICY users_update_own ON users
  FOR UPDATE
  TO authenticated
  USING (github_id = requesting_github_id())
  WITH CHECK (github_id = requesting_github_id());

DROP POLICY IF EXISTS badges_public_read ON badges;
CREATE POLICY badges_public_read ON badges
  FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS quests_public_read ON quests;
CREATE POLICY quests_public_read ON quests
  FOR SELECT
  USING (is_active = TRUE);

DROP POLICY IF EXISTS user_quests_select_own ON user_quests;
CREATE POLICY user_quests_select_own ON user_quests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM users
      WHERE users.id = user_quests.user_id
        AND users.github_id = requesting_github_id()
    )
  );

DROP POLICY IF EXISTS user_badges_select_own ON user_badges;
CREATE POLICY user_badges_select_own ON user_badges
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM users
      WHERE users.id = user_badges.user_id
        AND users.github_id = requesting_github_id()
    )
  );
