CREATE INDEX IF NOT EXISTS idx_users_leaderboard_xp_rank
  ON users(xp DESC, rank_tier, id);

CREATE INDEX IF NOT EXISTS idx_user_quests_user_status_claimed
  ON user_quests(user_id, status, claimed_at);

CREATE INDEX IF NOT EXISTS idx_user_quests_quest_user
  ON user_quests(quest_id, user_id);
