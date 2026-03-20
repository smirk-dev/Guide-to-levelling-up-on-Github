# Code Warrior Implementation Backlog

This backlog converts high-level improvement ideas into issue-sized execution tasks.

Status legend:
- TODO: not started
- IN PROGRESS: being worked on
- DONE: completed
- BLOCKED: external dependency or decision needed

Effort legend:
- S: up to 0.5 day
- M: 1 to 2 days
- L: 3 to 5 days

---

## P0 (Critical): Reliability, Security, Data Integrity

### CW-001: Add API auth guard test coverage
- Priority: P0
- Effort: M
- Status: DONE
- Goal: Ensure every protected API route rejects unauthorized requests.
- Scope:
  - Add tests for 401 behavior for protected routes.
  - Include positive authorized-path tests for baseline sanity.
- File targets:
  - src/app/api/sync/route.ts
  - src/app/api/quests/claim/route.ts
  - src/app/api/badges/equip/route.ts
  - src/app/api/badges/unequip/route.ts
  - src/app/api/quests/route.ts
  - src/lib/__tests__/
- Acceptance criteria:
  - Unauthorized requests return 401 on all protected routes.
  - Authorized requests reach business logic path.
  - Tests run in CI.
- Completion notes:
  - Added route-level auth guard tests in `src/app/api/__tests__/auth-guards.test.ts`.
  - Covered unauthorized and authorized baseline paths for sync, quests, claim, equip, and unequip endpoints.

### CW-002: Add idempotency to quest reward claims
- Priority: P0
- Effort: L
- Status: DONE
- Goal: Prevent duplicate reward grants in retry/race conditions.
- Scope:
  - Add idempotency key support in claim flow.
  - Persist and validate key per user and action.
  - Ensure repeated requests are safe and return deterministic response.
- File targets:
  - src/app/api/quests/claim/route.ts
  - src/lib/request-validation.ts
  - supabase/migrations/
  - src/types/database.ts
- Acceptance criteria:
  - Duplicate request with same key does not duplicate XP or rewards.
  - Concurrent claim calls remain correct.
  - Database constraints enforce safety.
- Completion notes:
  - Added persistent idempotency table via migration `supabase/migrations/20260313000124_create_api_idempotency_keys.sql`.
  - Implemented quest claim idempotency handling with reservation (`PENDING`), replay (`COMPLETED`), and conflict handling for in-progress duplicates.
  - Added `Idempotency-Key` validation utility and tests.

### CW-003: Add server-side rate limiting on high-risk endpoints
- Priority: P0
- Effort: M
- Status: DONE
- Goal: Reduce abuse and accidental endpoint spam.
- Scope:
  - Add per-user and per-IP limits for sync/claim/equip endpoints.
  - Return clear 429 responses with retry guidance.
- File targets:
  - src/lib/rate-limit.ts
  - src/app/api/sync/route.ts
  - src/app/api/quests/claim/route.ts
  - src/app/api/badges/equip/route.ts
  - src/app/api/badges/unequip/route.ts
- Acceptance criteria:
  - Limits are enforced and configurable.
  - 429 responses include machine-readable retry metadata.
  - No regression in normal usage.
- Completion notes:
  - Added per-IP and per-user rate limiting for `sync`, `questClaim`, `badgeEquip`, and `badgeUnequip` endpoints.
  - 429 responses now include retry metadata (`retryAfter`, `Retry-After`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`).

### CW-004: Add audit events for XP and reward mutations
- Priority: P0
- Effort: L
- Status: DONE
- Goal: Make XP and reward changes traceable and debuggable.
- Scope:
  - Create append-only audit table.
  - Record source action, delta, entity IDs, and timestamp.
  - Write events from claim/equip/sync mutation paths.
- File targets:
  - supabase/migrations/
  - src/app/api/sync/route.ts
  - src/app/api/quests/claim/route.ts
  - src/app/api/badges/equip/route.ts
  - src/types/database.ts
- Acceptance criteria:
  - Every XP/reward mutation writes an audit row.
  - Audit schema supports basic investigations.
  - No hot-path latency spikes beyond acceptable threshold.
- Completion notes:
  - Added audit event table and indexes in migration `supabase/migrations/20260313000125_create_audit_events_and_atomic_logging.sql`.
  - Added transactional audit inserts in atomic SQL functions for quest claim and badge equip flows.
  - Added sync API route audit logging for XP/rank/stat updates.

### CW-005: CI quality gates for lint, typecheck, tests
- Priority: P0
- Effort: S
- Status: DONE
- Goal: Stop broken code from merging.
- Scope:
  - Add GitHub Actions workflow for lint/typecheck/tests.
  - Require green checks for merges to main.
- File targets:
  - .github/workflows/
  - code-warrior/package.json
- Acceptance criteria:
  - PRs run all checks automatically.
  - Failing checks block merge.
- Completion notes:
  - Added GitHub Actions workflow at `.github/workflows/code-warrior-ci.yml`.
  - Added `typecheck` and `test` scripts in `code-warrior/package.json`.

---

## P1 (High): Performance and Core UX

### CW-006: Split sync into quick sync and full sync modes
- Priority: P1
- Effort: L
- Status: DONE
- Goal: Improve sync speed and reduce GitHub API load.
- Scope:
  - Implement quick sync path for recent deltas.
  - Keep full sync on schedule/manual trigger.
  - Surface sync type in API response.
- File targets:
  - src/app/api/sync/route.ts
  - src/lib/github.ts
  - src/lib/game-logic.ts
  - src/types/api.ts
- Acceptance criteria:
  - Quick sync median latency significantly lower than full sync.
  - No incorrect XP/rank regressions between modes.
  - User can force full sync when needed.
- Completion notes:
  - Added `mode` support on sync API (`quick` by default, `full` when requested or when cache is stale/missing).
  - Added sync metadata persistence under `github_stats.sync_meta` to track quick/full executions.
  - Added `syncMode`, `requestedMode`, and `usedCachedStats` in sync responses.
  - Frontend dashboard/quests now request quick sync by default (first sync uses full mode).

### CW-007: Add stale-while-revalidate dashboard fetch strategy
- Priority: P1
- Effort: M
- Status: DONE
- Goal: Render existing stats immediately while refresh runs in background.
- Scope:
  - Show cached user profile/stats first.
  - Trigger background refresh and merge updates.
  - Display clear sync state and last-updated timestamp.
- File targets:
  - src/app/dashboard/page.tsx
  - src/app/providers.tsx
  - src/components/rpg/CharacterSheet.tsx
- Acceptance criteria:
  - Time-to-first-visible-data improves.
  - User sees explicit sync states: idle, syncing, failed, updated.
- Completion notes:
  - Added local cache bootstrapping for dashboard data via `initialData` from `localStorage` and persisted revalidation updates.
  - Enabled SWR-style behavior with `staleTime`, mount refetch, and window-focus refetch in dashboard query.
  - Added explicit sync UI state display (`idle`, `syncing`, `failed`, `updated`) and last-updated timestamp banner.

### CW-008: Add database indexes for leaderboard and quest queries
- Priority: P1
- Effort: M
- Status: DONE
- Goal: Reduce query latency under growth.
- Scope:
  - Profile key query patterns.
  - Add indexes for high-traffic filters/sorts.
  - Validate with before/after query plans.
- File targets:
  - supabase/migrations/
  - src/app/api/leaderboard/route.ts
  - src/app/api/quests/route.ts
- Acceptance criteria:
  - Leaderboard and quest API p95 latency improves.
  - No negative write-performance surprise.
- Completion notes:
  - Added migration `supabase/migrations/20260313000128_add_query_performance_indexes.sql`.
  - Added leaderboard index on `users(xp DESC, rank_tier, id)` and quest progress indexes on `user_quests` lookup paths.
  - Added seasonal quest window index in `supabase/migrations/20260313000127_add_seasonal_quest_fields.sql`.

### CW-009: Improve API error normalization and user-facing messages
- Priority: P1
- Effort: M
- Status: DONE
- Goal: Make failures understandable and recoverable.
- Scope:
  - Standardize API error payloads.
  - Map common failure types (auth, rate limit, GitHub upstream).
  - Improve toast and inline error states.
- File targets:
  - src/types/api.ts
  - src/lib/request-validation.ts
  - src/components/notifications/NotificationProvider.tsx
  - src/app/dashboard/error.tsx
  - src/app/error.tsx
- Acceptance criteria:
  - Consistent error schema across major endpoints.
  - User sees actionable recovery text.
- Completion notes:
  - Added shared API error response helper in `src/lib/api-response.ts` and new API error types in `src/types/api.ts`.
  - Normalized error payloads in sync, quests, claim, equip, and unequip routes.

---

## P2 (Medium): Product Growth and Engagement

### CW-010: Add progression insights panel (XP breakdown)
- Priority: P2
- Effort: M
- Status: DONE
- Goal: Explain where XP came from after each sync.
- Scope:
  - Show per-source XP deltas (commits, PRs, issues, stars, reviews).
  - Show rank progress and next milestone hints.
- File targets:
  - src/lib/game-logic.ts
  - src/components/rpg/CharacterSheet.tsx
  - src/app/dashboard/page.tsx
- Acceptance criteria:
  - Users can see XP source breakdown per sync.
  - Milestone guidance is visible and accurate.
- Completion notes:
  - Added reusable XP breakdown model in `src/lib/game-logic.ts` (`XP_WEIGHTS`, `getXPBreakdown`).
  - Integrated progression insights into quick dashboard tab (`XP Breakdown`, next-rank delta, streak callout).
  - Wired dashboard query data into `QuickViewTab` with rank milestone and per-source XP rendering.

### CW-011: Introduce daily/weekly streak system
- Priority: P2
- Effort: L
- Status: DONE
- Goal: Improve retention with lightweight recurring goals.
- Scope:
  - Define streak rule and grace behavior.
  - Add streak tracking fields and display components.
  - Award small bonus XP safely.
- File targets:
  - supabase/migrations/
  - src/lib/game-logic.ts
  - src/app/api/sync/route.ts
  - src/components/rpg/
- Acceptance criteria:
  - Streak updates correctly over time zones and edge cases.
  - Bonus logic cannot be abused by retries.
- Completion notes:
  - Added streak schema fields in `supabase/migrations/20260313000126_add_streak_columns.sql`.
  - Implemented UTC date-based streak progression logic in sync flow with reset/continue behavior.
  - Added bounded streak bonus XP during sync and persisted streak metadata for observability.

### CW-012: Seasonal quest packs
- Priority: P2
- Effort: M
- Status: DONE
- Goal: Keep content fresh without redeploying core logic.
- Scope:
  - Add season metadata and activation windows.
  - Load active season quests from DB.
- File targets:
  - supabase/migrations/
  - src/app/api/quests/route.ts
  - src/components/rpg/QuestCard.tsx
  - better-quests-seed.sql
- Acceptance criteria:
  - Seasons can be activated/deactivated via DB config.
  - Users only see active quests.
- Completion notes:
  - Added seasonal fields migration `supabase/migrations/20260313000127_add_seasonal_quest_fields.sql`.
  - Added seasonal filtering helpers in `src/lib/seasonal-quests.ts`.
  - Applied seasonal filtering to quest fetch/progress and sync quest-enrollment paths.

---

## Test and Observability Track (Cross-Cutting)

### CW-013: E2E happy path tests
- Priority: P1
- Effort: L
- Status: DONE
- Goal: Catch regressions in the main gameplay loop.
- Scope:
  - Sign in flow
  - Sync flow
  - Quest claim flow
  - Badge equip flow
- File targets:
  - code-warrior/tests/e2e/
  - package.json
- Acceptance criteria:
  - E2E suite runs in CI on pull requests.
  - Critical path is covered and stable.
- Completion notes:
  - Added Playwright test scaffold and Chromium project config in `playwright.config.ts`.
  - Added smoke coverage in `tests/e2e/smoke.spec.ts` for landing CTA and protected quest-claim API contract.
  - Added CI E2E execution steps (`npx playwright install chromium` + `npm run test:e2e`).

### CW-014: Structured server logging and correlation IDs
- Priority: P1
- Effort: M
- Status: DONE
- Goal: Make production troubleshooting faster.
- Scope:
  - Add request correlation IDs.
  - Log key lifecycle points for sync and reward endpoints.
  - Redact sensitive values by default.
- File targets:
  - src/app/api/sync/route.ts
  - src/app/api/quests/claim/route.ts
  - src/app/api/badges/equip/route.ts
  - src/lib/
- Acceptance criteria:
  - Related logs are traceable per request.
  - Sensitive fields are not logged.
- Completion notes:
  - Added request context utility in `src/lib/request-context.ts` for request ID generation and contextual logging.
  - Added `X-Request-Id` response headers and contextual logs to sync, quest-claim, and badge-equip routes.
  - Kept logs focused on operational metadata (IDs, status context, route errors) without secrets.

---

## Suggested Execution Order (First 4 Weeks)

Week 1
- CW-005 CI gates
- CW-001 API auth tests
- CW-009 error normalization

Week 2
- CW-003 rate limiting
- CW-002 idempotent claims
- CW-004 audit events

Week 3
- CW-006 quick/full sync split
- CW-008 DB indexes

Week 4
- CW-007 stale-while-revalidate dashboard
- CW-010 progression insights panel
- CW-013 E2E happy paths

---

## Definition of Done (For Any Backlog Item)
- Feature or fix merged with tests.
- No TypeScript or lint errors in touched files.
- API behavior documented if contracts changed.
- Rollback strategy noted for DB/schema changes.
- User-visible behavior validated in local run.
