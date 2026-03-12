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
