ALTER TABLE users
ADD COLUMN IF NOT EXISTS streak_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS streak_best_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS streak_last_active_date DATE;

CREATE INDEX IF NOT EXISTS idx_users_streak_count
  ON users(streak_count DESC);
