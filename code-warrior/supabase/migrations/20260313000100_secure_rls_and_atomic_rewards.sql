CREATE OR REPLACE FUNCTION requesting_github_id()
RETURNS TEXT AS $$
  SELECT COALESCE(auth.jwt() ->> 'sub', '');
$$ LANGUAGE sql STABLE;

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