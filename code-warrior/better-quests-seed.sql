-- Better Quests Migration
-- This file adds more meaningful and actionable quests to help users improve their GitHub profile
-- Run this in your Supabase SQL Editor after the initial schema setup

-- First, clear existing quests (optional - comment out if you want to keep them)
DELETE FROM user_quests;
DELETE FROM quests;

-- ============================================
-- BEGINNER QUESTS - Getting Started
-- ============================================
INSERT INTO quests (title, description, xp_reward, criteria_type, criteria_threshold, is_active) VALUES
(
  'First Repository',
  'Create your first GitHub repository. This is your first step into the world of code collaboration. Choose a project you''re passionate about!',
  50,
  'REPO_COUNT',
  1,
  true
),
(
  'Hello World Commits',
  'Make your first 10 commits. Each commit is a checkpoint in your code journey. Learn to write clear commit messages!',
  100,
  'COMMIT_COUNT',
  10,
  true
),
(
  'Community Voice',
  'Open your first issue on GitHub. Issues are how developers discuss bugs, feature requests, and improvements. Your voice matters!',
  75,
  'ISSUE_COUNT',
  1,
  true
);

-- ============================================
-- INTERMEDIATE QUESTS - Building Momentum
-- ============================================
INSERT INTO quests (title, description, xp_reward, criteria_type, criteria_threshold, is_active) VALUES
(
  'The Contributor',
  'Create and merge your first pull request. PRs are how you contribute to projects. Learn to fork, branch, and collaborate!',
  150,
  'PR_MERGED',
  1,
  true
),
(
  'Star Collector',
  'Receive 5 stars on your repositories. Stars show appreciation for your work. Make something others find useful!',
  200,
  'STAR_COUNT',
  5,
  true
),
(
  'Commit Champion',
  'Reach 50 total commits. Consistency is key! Make coding a daily habit.',
  250,
  'COMMIT_COUNT',
  50,
  true
),
(
  'Repository Builder',
  'Create 3 repositories. Diversify your projects - try different languages and technologies!',
  150,
  'REPO_COUNT',
  3,
  true
);

-- ============================================
-- ADVANCED QUESTS - Mastering Collaboration
-- ============================================
INSERT INTO quests (title, description, xp_reward, criteria_type, criteria_threshold, is_active) VALUES
(
  'Code Reviewer',
  'Review 5 pull requests. Help others improve their code. Sharing knowledge makes everyone better!',
  300,
  'REVIEW_COUNT',
  5,
  true
),
(
  'Popular Creator',
  'Earn 25 stars across your repositories. Create projects that solve real problems and document them well!',
  500,
  'STAR_COUNT',
  25,
  true
),
(
  'PR Master',
  'Submit and merge 10 pull requests. Whether to your own projects or others'', PRs are the currency of collaboration.',
  400,
  'PR_MERGED',
  10,
  true
),
(
  'Issue Hunter',
  'Create 10 issues. Good issues include clear descriptions, steps to reproduce, and possible solutions.',
  200,
  'ISSUE_COUNT',
  10,
  true
);

-- ============================================
-- EXPERT QUESTS - Elite Developer
-- ============================================
INSERT INTO quests (title, description, xp_reward, criteria_type, criteria_threshold, is_active) VALUES
(
  'Commit Legend',
  'Reach 500 commits. You''re building serious momentum! Keep pushing code daily.',
  1000,
  'COMMIT_COUNT',
  500,
  true
),
(
  'Star Power',
  'Achieve 100 stars total. Your projects are making an impact! Share them on social media and dev communities.',
  1500,
  'STAR_COUNT',
  100,
  true
),
(
  'Collaboration Master',
  'Complete 50 pull requests. You''re a true collaborator now. Consider contributing to major open source projects!',
  1200,
  'PR_MERGED',
  50,
  true
),
(
  'Portfolio Builder',
  'Create 10 repositories. Build a diverse portfolio showing different skills: web, mobile, CLI tools, libraries, etc.',
  600,
  'REPO_COUNT',
  10,
  true
);

-- ============================================
-- LEGENDARY QUESTS - Code Warrior Elite
-- ============================================
INSERT INTO quests (title, description, xp_reward, criteria_type, criteria_threshold, is_active) VALUES
(
  'Thousand Commit Warrior',
  'Reach 1000 total commits. You''re in the top tier of developers. Your consistency is legendary!',
  2500,
  'COMMIT_COUNT',
  1000,
  true
),
(
  'GitHub Celebrity',
  'Earn 500 stars total. Your projects are widely used and appreciated. You''re making a real impact!',
  5000,
  'STAR_COUNT',
  500,
  true
),
(
  'PR Deity',
  'Complete 100 pull requests. You''re a collaboration deity! Your contributions span countless projects.',
  3000,
  'PR_MERGED',
  100,
  true
);

-- ============================================
-- NOTE: Quest status tracking
-- ============================================
-- User quest progress is automatically tracked when users sync their stats
-- Quest completion is checked in /api/quests POST endpoint
-- Users can claim completed quests to receive XP and badges
