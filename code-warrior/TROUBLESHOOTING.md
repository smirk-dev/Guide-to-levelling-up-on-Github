# Troubleshooting Guide

## Recent Fixes (2026-01-10)

### Sync Cooldown Issues Fixed

**Problem:** New users were getting "Sync on cooldown" errors immediately after creation.

**Root Cause:** The `last_synced_at` column had a default value of `NOW()`, causing immediate cooldown for new users.

**Solution:** 
1. Updated sync API to skip cooldown check when `last_synced_at` is `NULL`
2. Modified user creation to set `last_synced_at` as `NULL` for new users
3. Added migration to update existing database schema

**To Apply Migration:**
Run this SQL in your Supabase SQL Editor:
```sql
ALTER TABLE users 
  ALTER COLUMN last_synced_at DROP DEFAULT,
  ALTER COLUMN last_synced_at DROP NOT NULL;
```

### Enhanced Error Logging

**Problem:** Error messages showing as empty objects `{}` in console.

**Solution:**
- All errors now show detailed messages with JSON stringification
- Added comprehensive logging throughout the sync process
- GitHub API errors now show status codes and response details
- Supabase errors show error codes, messages, and hints

## Console Errors Fixed

### Error Loading User / Supabase Error

**Problem:** Empty error objects `{}` being logged to console.

**Solution:** 
1. Updated error logging to show actual error messages and details
2. Added proper error handling with descriptive messages
3. Added debug logging throughout the data loading process

### Changes Made:

1. **Dashboard Page** (`src/app/dashboard/page.tsx`):
   - Improved error logging to display actual error messages instead of empty objects
   - Added validation checks for session data
   - Added warning when access token is missing
   - Added detailed logging for Supabase queries and GitHub API calls

2. **NextAuth Route** (`src/app/api/auth/[...nextauth]/route.ts`):
   - Added access token to session object
   - Added debug logging for JWT callback
   - Improved session callback to pass token data

3. **Supabase Client** (`src/lib/supabase.ts`):
   - Enhanced error message when environment variables are missing
   - Added debug logging for missing variables

## How to Debug Further

If you still see errors, check the console for these new detailed logs:

1. **Session Issues:**
   - Look for: "Session data:", "Loading user data for:"
   - Verify that `githubId`, `username`, and `hasAccessToken` are present

2. **Supabase Issues:**
   - Look for: "Querying Supabase for user:", "Supabase query result:"
   - Check if the error message indicates a missing table or connection issue

3. **GitHub API Issues:**
   - Look for: "GitHub API error:" with status code
   - Check if the access token is valid

## Environment Variables Checklist

Make sure your `.env.local` file has all these variables set:

- ✅ `NEXTAUTH_SECRET` - Random secret for NextAuth
- ✅ `NEXTAUTH_URL` - Should be `http://localhost:3000` for development
- ✅ `GITHUB_CLIENT_ID` - From GitHub OAuth App
- ✅ `GITHUB_CLIENT_SECRET` - From GitHub OAuth App
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

## Common Issues

### 1. User Not Found in Database
**Symptom:** "User not found in database, triggering initial sync..."

**Solution:** The app will automatically create a new user by calling `/api/sync`. This is normal for first-time users.

### 2. Missing Access Token
**Symptom:** "No access token found in session - GitHub API calls may fail"

**Solution:** 
- Sign out and sign in again to refresh the session
- Check that GitHub OAuth scopes include `read:user` and `public_repo`

### 3. Supabase Connection Error
**Symptom:** Errors with Supabase URL or keys

**Solution:**
- Verify `.env.local` has correct Supabase credentials
- Restart the development server after changing environment variables
- Check Supabase dashboard to ensure the project is active

## Next Steps

1. Restart the development server:
   ```bash
   npm run dev
   ```

2. Clear your browser cache and cookies for `localhost:3000`

3. Sign out and sign in again to refresh your session

4. Check the console for the new detailed error messages

If issues persist, the detailed logs will now show exactly where the problem is occurring.
