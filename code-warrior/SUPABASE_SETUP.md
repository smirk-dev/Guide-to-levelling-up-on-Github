# Supabase Local Development Setup

This guide sets up Supabase CLI so you can manage database changes locally and sync them automatically.

## Step 1: Install Supabase CLI

### Windows (using npm)
```bash
npm install -g supabase
```

### Verify installation
```bash
supabase --version
```

## Step 2: Link to Your Remote Supabase Project

Navigate to your project directory:
```bash
cd code-warrior
```

Login to Supabase:
```bash
supabase login
```
This will open a browser window. Authorize the CLI.

Link to your remote project:
```bash
supabase link --project-ref your-project-ref
```

**Finding your project-ref:**
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to Settings → General
4. Copy the "Reference ID" (looks like: `abcdefghijklmnop`)

You'll be prompted for your database password. This is the password you set when creating the project.

## Step 3: Pull Existing Schema (Optional)

If you already have tables in your remote database:
```bash
supabase db pull
```

This creates a migration file with your current schema in `supabase/migrations/`.

## Step 4: Initialize Supabase (if not already done)

If you haven't linked yet, initialize:
```bash
supabase init
```

This creates a `supabase/` folder with:
```
supabase/
├── config.toml          # Supabase configuration
├── seed.sql             # Initial data
└── migrations/          # Database migrations
    └── YYYYMMDDHHMMSS_initial.sql
```

## Step 5: Create Your First Migration

Apply the github_stats column migration:
```bash
supabase migration new add_github_stats_column
```

This creates a new migration file. Edit it:
```sql
-- supabase/migrations/YYYYMMDDHHMMSS_add_github_stats_column.sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS github_stats JSONB DEFAULT '{}'::jsonb;
COMMENT ON COLUMN users.github_stats IS 'Stores GitHub metrics for RPG stat calculation';
```

## Step 6: Apply Migrations Locally (Optional - requires Docker)

Start local Supabase:
```bash
supabase start
```

This starts a local Supabase instance with Docker. Your local database will be at:
- API URL: `http://localhost:54321`
- Database URL: `postgresql://postgres:postgres@localhost:54322/postgres`

Apply migrations locally:
```bash
supabase db reset
```

## Step 7: Push Migrations to Remote

Push your migrations to production:
```bash
supabase db push
```

This applies all migrations in `supabase/migrations/` to your remote database.

**IMPORTANT:** This is destructive if you have `supabase db reset` migrations. Review carefully!

## Step 8: Generate TypeScript Types (Automatic)

Generate types from your database schema:
```bash
supabase gen types typescript --local > src/types/supabase.ts
```

Or for remote:
```bash
supabase gen types typescript --project-id your-project-ref > src/types/supabase.ts
```

Add this to your `package.json`:
```json
{
  "scripts": {
    "supabase:types": "supabase gen types typescript --project-id your-project-ref > src/types/supabase.ts",
    "supabase:push": "supabase db push",
    "supabase:pull": "supabase db pull"
  }
}
```

Now you can run:
```bash
npm run supabase:types    # Generate types
npm run supabase:push     # Push migrations to remote
npm run supabase:pull     # Pull remote schema changes
```

## Workflow: Making Database Changes

### Method 1: Create Migration First (Recommended)

1. **Create migration:**
   ```bash
   supabase migration new add_quest_rarity
   ```

2. **Edit the migration file:**
   ```sql
   -- supabase/migrations/YYYYMMDDHHMMSS_add_quest_rarity.sql
   ALTER TABLE quests ADD COLUMN rarity VARCHAR(20) DEFAULT 'common';
   ```

3. **Test locally (optional):**
   ```bash
   supabase db reset  # Resets local DB and applies all migrations
   ```

4. **Push to production:**
   ```bash
   supabase db push
   ```

5. **Regenerate types:**
   ```bash
   npm run supabase:types
   ```

### Method 2: Make Changes in Dashboard, Then Pull

1. Make changes in Supabase dashboard UI
2. Pull changes to create migration:
   ```bash
   supabase db pull
   ```
3. Commit the generated migration file

## Environment Variables

Update your `.env.local`:
```bash
# For local development (if using supabase start)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from supabase start output>

# For production
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

You can switch between local/remote by changing these values.

## Useful Commands

```bash
# Start local Supabase (requires Docker)
supabase start

# Stop local Supabase
supabase stop

# View local database URL and keys
supabase status

# Create new migration
supabase migration new migration_name

# List migrations
supabase migration list

# Push migrations to remote
supabase db push

# Pull remote schema to migration
supabase db pull

# Reset local database (applies all migrations)
supabase db reset

# Generate TypeScript types
supabase gen types typescript --local > src/types/supabase.ts

# View logs
supabase logs
```

## Troubleshooting

### "Docker is not running"
You need Docker Desktop installed to use `supabase start`. Download from: https://www.docker.com/products/docker-desktop/

If you don't want to use Docker, you can skip local development and just use:
- `supabase migration new` - Create migrations
- `supabase db push` - Push to remote
- `supabase gen types` - Generate types from remote

### "Could not connect to project"
Make sure you're linked:
```bash
supabase link --project-ref your-project-ref
```

### "Migration already exists"
If you manually ran SQL in dashboard, pull it first:
```bash
supabase db pull
```

## Best Practices

1. **Always create migrations for schema changes** - Never manually edit SQL in dashboard
2. **Commit migrations to git** - So your team has the same schema
3. **Test migrations locally first** - Use `supabase db reset` to test
4. **Regenerate types after schema changes** - Keep TypeScript types in sync
5. **Use descriptive migration names** - `add_quest_rarity` not `migration_1`

## Example: Adding a New Feature

Let's say you want to add quest categories:

```bash
# 1. Create migration
supabase migration new add_quest_categories

# 2. Edit supabase/migrations/YYYYMMDDHHMMSS_add_quest_categories.sql
# ALTER TABLE quests ADD COLUMN category VARCHAR(50);
# UPDATE quests SET category = 'combat' WHERE criteria_type IN ('PR_MERGED', 'COMMIT_COUNT');
# UPDATE quests SET category = 'social' WHERE criteria_type IN ('STAR_COUNT', 'ISSUE_COUNT');

# 3. Test locally (optional)
supabase db reset

# 4. Push to production
supabase db push

# 5. Update types
npm run supabase:types

# 6. Commit
git add supabase/migrations/* src/types/supabase.ts
git commit -m "feat: add quest categories"
```

Now your database is updated and your TypeScript types are in sync!

## Migration File Structure

Migration files are SQL and should be idempotent (safe to run multiple times):

```sql
-- Good: Uses IF NOT EXISTS
ALTER TABLE users ADD COLUMN IF NOT EXISTS github_stats JSONB DEFAULT '{}'::jsonb;

-- Bad: Will error if column exists
ALTER TABLE users ADD COLUMN github_stats JSONB DEFAULT '{}'::jsonb;
```

## CI/CD Integration

Add to `.github/workflows/deploy.yml`:

```yaml
- name: Apply database migrations
  run: |
    npm install -g supabase
    supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
    supabase db push
  env:
    SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

This automatically applies migrations when you push to main!

---

**TL;DR - Quick Setup:**

```bash
# Install
npm install -g supabase

# Login
supabase login

# Link to project
supabase link --project-ref your-project-ref

# Create migration
supabase migration new your_migration_name

# Edit supabase/migrations/YYYYMMDDHHMMSS_your_migration_name.sql

# Push to remote
supabase db push

# Generate types
supabase gen types typescript --project-id your-project-ref > src/types/supabase.ts
```

Done! Now all schema changes are version-controlled and automatic.
