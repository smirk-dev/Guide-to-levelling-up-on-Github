# Supabase Migrations Index

This folder contains the canonical migration history for the project.

## Important Rule
Do not edit, rename, or delete migrations that have already been pushed to remote environments.
Applied migration history must remain stable.

## Security/RLS Rollout (March 2026)
The security rollout was initially authored as one large migration, but Supabase CLI `v2.67.1` failed with:
`cannot insert multiple commands into a prepared statement`.

To keep rollout reliable, it was split into smaller migrations:

- `20260313000100_secure_rls_and_atomic_rewards.sql`
  - `requesting_github_id()` helper function
- `20260313000101_create_claim_quest_reward_atomic.sql`
  - atomic quest claim function
- `20260313000102_create_equip_badge_atomic.sql`
  - atomic badge equip function
- `20260313000103` through `20260313000123`
  - permissions, RLS enables, and policy create/drop steps split into single-purpose files

This split is intentional and should not be squashed retroactively.

## Working With New Migrations
1. Create new migrations with `supabase migration new <name>`.
2. Keep migrations idempotent when possible (`IF EXISTS` / `IF NOT EXISTS`).
3. Apply with `npm run db:push` from `code-warrior/`.
4. If the CLI reports parser issues, split migration statements into smaller files.
