# Database Migration Instructions

## Issue: Sync Cooldown on New Users

If you're seeing "Sync on cooldown" errors for new users, you need to update your Supabase database.

## Steps to Fix

### 1. Open Supabase Dashboard
Go to your Supabase project: https://jweandidatlorjrweanc.supabase.co

### 2. Navigate to SQL Editor
- Click on "SQL Editor" in the left sidebar
- Click "New query"

### 3. Run the Migration
Copy and paste this SQL and click "Run":

```sql
-- Fix last_synced_at to allow NULL for new users
ALTER TABLE users 
  ALTER COLUMN last_synced_at DROP DEFAULT,
  ALTER COLUMN last_synced_at DROP NOT NULL;

-- Optional: Reset cooldown for existing users (uncomment if needed)
-- UPDATE users SET last_synced_at = NULL;
```

### 4. Verify the Change
Run this query to confirm the column is now nullable:

```sql
SELECT column_name, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'last_synced_at';
```

You should see:
- `is_nullable`: `YES`
- `column_default`: `NULL` or empty

### 5. Restart Your Dev Server
```bash
# Stop the current server (Ctrl+C)
npm run dev
```

### 6. Test the Fix
1. Clear your browser cache and cookies for `localhost:3000`
2. Sign out if you're logged in
3. Sign in again
4. You should now be able to sync successfully without cooldown errors

## What This Does

- **Before**: New users had `last_synced_at` set to the current timestamp, triggering cooldown
- **After**: New users have `last_synced_at` as `NULL`, allowing immediate first sync
- **Cooldown**: Still applies after the first sync (5 minutes between syncs)

## Error Messages You Should See Now

Instead of empty objects, you'll see detailed errors like:

✅ **Good Error Messages:**
```
Sync failed with status: 429
Sync error details: {
  "error": "Sync on cooldown",
  "message": "Please wait 245 seconds before syncing again",
  "waitTime": 245
}
```

❌ **Old (Bad) Error Messages:**
```
Sync failed: {}
Error loading user: {}
```

## Still Having Issues?

Check the browser console for detailed logs:
- "Loading user data for:" - Shows session info
- "Querying Supabase for user:" - Shows database query
- "Supabase query result:" - Shows if user was found
- "Fetching GitHub stats for:" - Shows GitHub API call
- "GitHub stats calculated:" - Shows computed stats
- "User successfully updated:" - Confirms sync completion

All errors now include full details and stack traces.