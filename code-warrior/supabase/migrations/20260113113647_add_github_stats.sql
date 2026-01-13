-- Migration: Add github_stats column to users table
-- Date: 2026-01-13
-- Purpose: Store GitHub metrics for RPG stat calculations

-- Add github_stats column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'users'
    AND column_name = 'github_stats'
  ) THEN
    ALTER TABLE users ADD COLUMN github_stats JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add comment
COMMENT ON COLUMN users.github_stats IS 'Stores GitHub metrics (stars, repos, commits, prs, issues, reviews) for RPG stat calculation';