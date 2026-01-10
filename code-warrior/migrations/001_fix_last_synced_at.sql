-- Migration: Fix last_synced_at default value to allow NULL
-- Date: 2026-01-10
-- Purpose: Allow new users to sync immediately without cooldown

-- Update the users table to allow NULL for last_synced_at
ALTER TABLE users 
  ALTER COLUMN last_synced_at DROP DEFAULT,
  ALTER COLUMN last_synced_at DROP NOT NULL;

-- Update existing users who have the default timestamp to NULL
-- This allows them to sync immediately if needed
-- (Optional - uncomment if you want to reset all users' cooldowns)
-- UPDATE users SET last_synced_at = NULL WHERE last_synced_at IS NOT NULL;

-- Verify the change
SELECT column_name, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'last_synced_at';
