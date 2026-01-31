-- ============================================
-- QUEST MAP MIGRATION
-- Expanded quest system with 20+ quests organized by map regions
-- Run this in your Supabase SQL Editor
-- ============================================

-- First, clear existing quests (optional - comment out if you want to keep them)
DELETE FROM user_quests;
DELETE FROM quests;

-- ============================================
-- REGION 1: STARTING VILLAGE (Beginner Quests)
-- These are the first quests every coder should complete
-- ============================================
INSERT INTO quests (title, description, xp_reward, criteria_type, criteria_threshold, is_active) VALUES
(
  'First Steps',
  'Create your first GitHub repository. Every great journey begins with a single step. This is where your coding adventure starts!',
  50,
  'REPO_COUNT',
  1,
  true
),
(
  'Hello World',
  'Make your first 5 commits. Commits are the building blocks of your code history. Start documenting your progress!',
  75,
  'COMMIT_COUNT',
  5,
  true
),
(
  'Bug Reporter',
  'Open your first issue on any repository. Issues help track bugs and feature requests. Your voice in the community matters!',
  60,
  'ISSUE_COUNT',
  1,
  true
),
(
  'The Apprentice',
  'Reach 10 total commits. Consistency is the key to mastery. Keep pushing code every day!',
  100,
  'COMMIT_COUNT',
  10,
  true
);

-- ============================================
-- REGION 2: FOREST OF COMMITS (Commit Mastery)
-- Building consistent coding habits
-- ============================================
INSERT INTO quests (title, description, xp_reward, criteria_type, criteria_threshold, is_active) VALUES
(
  'Commit Streak',
  'Reach 25 commits. You''re building momentum! Each commit brings you closer to mastery.',
  150,
  'COMMIT_COUNT',
  25,
  true
),
(
  'Code Cultivator',
  'Achieve 50 total commits. Your code garden is flourishing. Keep nurturing your projects!',
  250,
  'COMMIT_COUNT',
  50,
  true
),
(
  'Forest Dweller',
  'Create 3 repositories. Diversify your portfolio with different projects and technologies.',
  175,
  'REPO_COUNT',
  3,
  true
),
(
  'Century Coder',
  'Reach the milestone of 100 commits. A hundred steps into your coding journey - you''re unstoppable!',
  400,
  'COMMIT_COUNT',
  100,
  true
),
(
  'Project Architect',
  'Build 5 repositories. You''re becoming a true project architect with a diverse portfolio.',
  300,
  'REPO_COUNT',
  5,
  true
);

-- ============================================
-- REGION 3: COLLABORATION PEAKS (Teamwork Quests)
-- PRs, Reviews, and working with others
-- ============================================
INSERT INTO quests (title, description, xp_reward, criteria_type, criteria_threshold, is_active) VALUES
(
  'First Contribution',
  'Submit and merge your first pull request. PRs are how you contribute to the wider coding community!',
  200,
  'PR_MERGED',
  1,
  true
),
(
  'Code Reviewer Initiate',
  'Review your first pull request. Help others improve their code while learning new techniques!',
  175,
  'REVIEW_COUNT',
  1,
  true
),
(
  'Team Player',
  'Merge 5 pull requests. You''re becoming a valuable team contributor!',
  350,
  'PR_MERGED',
  5,
  true
),
(
  'Quality Guardian',
  'Complete 5 code reviews. Your feedback helps maintain high code quality across projects.',
  325,
  'REVIEW_COUNT',
  5,
  true
),
(
  'Issue Tracker',
  'Create 5 issues. Good issue tracking leads to better project management.',
  200,
  'ISSUE_COUNT',
  5,
  true
),
(
  'Collaboration Master',
  'Merge 10 pull requests. Your contributions are making a real impact on projects!',
  500,
  'PR_MERGED',
  10,
  true
),
(
  'Senior Reviewer',
  'Complete 10 code reviews. Your expertise is helping shape better code everywhere.',
  450,
  'REVIEW_COUNT',
  10,
  true
);

-- ============================================
-- REGION 4: STAR VALLEY (Recognition Quests)
-- Earning stars and recognition for your work
-- ============================================
INSERT INTO quests (title, description, xp_reward, criteria_type, criteria_threshold, is_active) VALUES
(
  'First Star',
  'Receive your first GitHub star. Someone appreciates your work! This is just the beginning.',
  150,
  'STAR_COUNT',
  1,
  true
),
(
  'Rising Star',
  'Earn 5 stars on your repositories. Your projects are gaining recognition in the community!',
  300,
  'STAR_COUNT',
  5,
  true
),
(
  'Star Collector',
  'Accumulate 15 stars. Your work is inspiring others. Keep creating amazing projects!',
  500,
  'STAR_COUNT',
  15,
  true
),
(
  'Community Favorite',
  'Reach 25 total stars. You''re becoming a recognized creator in the developer community!',
  750,
  'STAR_COUNT',
  25,
  true
),
(
  'Portfolio Master',
  'Build 10 repositories with diverse projects. A true full-stack portfolio!',
  600,
  'REPO_COUNT',
  10,
  true
);

-- ============================================
-- REGION 5: LEGENDARY SUMMIT (Elite Quests)
-- For the most dedicated coders
-- ============================================
INSERT INTO quests (title, description, xp_reward, criteria_type, criteria_threshold, is_active) VALUES
(
  'Commit Champion',
  'Achieve 250 total commits. Your dedication to coding is legendary!',
  1000,
  'COMMIT_COUNT',
  250,
  true
),
(
  'Star Magnet',
  'Earn 50 stars across all repositories. Your projects have massive appeal!',
  1200,
  'STAR_COUNT',
  50,
  true
),
(
  'PR Warrior',
  'Merge 25 pull requests. You''re a collaboration warrior, always helping projects grow.',
  900,
  'PR_MERGED',
  25,
  true
),
(
  'Thousand Commits',
  'Reach the legendary milestone of 500 commits. You''re in the top tier of dedicated coders!',
  2000,
  'COMMIT_COUNT',
  500,
  true
),
(
  'GitHub Celebrity',
  'Accumulate 100 stars. Your work is widely recognized and appreciated by developers worldwide!',
  2500,
  'STAR_COUNT',
  100,
  true
),
(
  'Open Source Legend',
  'Merge 50 pull requests. You''ve made significant contributions to countless projects!',
  2000,
  'PR_MERGED',
  50,
  true
),
(
  'Code Warrior Elite',
  'The ultimate achievement: 1000 commits. You are a true Code Warrior!',
  5000,
  'COMMIT_COUNT',
  1000,
  true
);

-- ============================================
-- VERIFICATION QUERY
-- Run this to see all quests organized by difficulty
-- ============================================
-- SELECT 
--   title,
--   criteria_type,
--   criteria_threshold,
--   xp_reward,
--   CASE 
--     WHEN criteria_threshold <= 10 THEN 'Starting Village'
--     WHEN criteria_type = 'COMMIT_COUNT' AND criteria_threshold <= 100 THEN 'Forest of Commits'
--     WHEN criteria_type IN ('PR_MERGED', 'REVIEW_COUNT') AND criteria_threshold <= 20 THEN 'Collaboration Peaks'
--     WHEN criteria_type = 'STAR_COUNT' AND criteria_threshold <= 50 THEN 'Star Valley'
--     ELSE 'Legendary Summit'
--   END as region
-- FROM quests
-- ORDER BY xp_reward ASC;

-- ============================================
-- NOTE: Quest Progress Tracking
-- ============================================
-- User quest progress is automatically tracked when users sync their GitHub stats
-- The sync endpoint (/api/sync) updates progress for all active quests
-- Users can claim completed quests to receive XP rewards
