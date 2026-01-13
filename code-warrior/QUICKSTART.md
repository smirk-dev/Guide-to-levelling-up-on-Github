# Quick Start: Supabase CLI Setup

Get your database changes synced automatically in **5 minutes**.

## 1. Install Supabase CLI

```bash
npm install -g supabase
```

## 2. Login & Link

```bash
# Login (opens browser)
supabase login

# Navigate to project
cd code-warrior

# Link to your remote project
supabase link
```

When prompted:
- Select your project from the list, OR
- Enter project ref manually (find it at: Supabase Dashboard → Settings → General → Reference ID)
- Enter your database password

## 3. Apply Current Migration

```bash
# Create the github_stats migration
supabase migration new add_github_stats

# This opens: supabase/migrations/YYYYMMDDHHMMSS_add_github_stats.sql
# Copy the contents from migrations/add-github-stats.sql into it

# Push to your database
supabase db push
```

✅ Done! The `github_stats` column is now in your database.

## 4. Save Project Ref (Optional but Recommended)

Create a `.env` file (not `.env.local`):
```bash
echo "PROJECT_REF=your-project-ref-here" > .env
```

Now you can use npm scripts:
```bash
npm run db:push      # Push migrations
npm run db:pull      # Pull remote schema
npm run db:types     # Generate TypeScript types
```

## Daily Workflow

### Making a Database Change

```bash
# 1. Create migration
npm run db:migration add_new_column

# 2. Edit supabase/migrations/YYYYMMDDHHMMSS_add_new_column.sql
# Write your SQL

# 3. Push to database
npm run db:push

# 4. Update TypeScript types
npm run db:types
```

That's it! No more manual SQL in Supabase dashboard.

---

## Complete Command Reference

```bash
# Create new migration
npm run db:migration your_migration_name

# Push all migrations to remote
npm run db:push

# Pull remote changes to migration file
npm run db:pull

# Generate TypeScript types
npm run db:types

# View local Supabase status (if using Docker)
npm run db:status
```

## Example: Add Quest Rarity Column

```bash
# 1. Create migration
npm run db:migration add_quest_rarity

# 2. Edit the file:
# ALTER TABLE quests ADD COLUMN rarity VARCHAR(20) DEFAULT 'common';

# 3. Push
npm run db:push

# 4. Update types
npm run db:types

# 5. Commit
git add supabase/migrations/* src/types/
git commit -m "feat: add quest rarity"
```

✅ Your database is updated and TypeScript types are in sync!

---

## Troubleshooting

**"supabase: command not found"**
```bash
npm install -g supabase
```

**"Could not find project"**
```bash
supabase link --project-ref your-project-ref
```
Get project ref from: https://supabase.com/dashboard/project/_/settings/general

**"Migration already applied"**
If you already ran the SQL manually, that's fine. Future changes should use migrations.

**Want to start fresh?**
```bash
# Pull current schema to create baseline migration
npm run db:pull

# This creates a migration with your current schema
```

---

## What You Get

✅ Version-controlled database schema
✅ No more manual SQL in dashboard
✅ Automatic TypeScript type generation
✅ Safe migrations (rollback supported)
✅ Team collaboration (everyone has same schema)
✅ CI/CD ready (auto-apply migrations on deploy)

---

**For full documentation, see:** [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
