ALTER TABLE quests
ADD COLUMN IF NOT EXISTS season_name TEXT,
ADD COLUMN IF NOT EXISTS season_starts_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS season_ends_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_quests_season_window
  ON quests(is_active, season_starts_at, season_ends_at);
