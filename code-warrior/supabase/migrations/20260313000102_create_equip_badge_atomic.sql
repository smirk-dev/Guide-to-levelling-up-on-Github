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
