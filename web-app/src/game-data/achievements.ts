import type { Achievement, Quest } from '../types/game';

export const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'commits',
        category: 'Commits',
        name: 'Commit Master',
        tiers: [
            { rank: 'C', title: 'First Commit', requirement: 1, xpReward: 50, description: 'Your journey begins!' },
            { rank: 'B', title: 'Middle Committer', requirement: 10, xpReward: 100, description: 'Building momentum' },
            { rank: 'A', title: 'High Committer', requirement: 100, xpReward: 300, description: 'Consistent coder' },
            { rank: 'AA', title: 'Hyper Committer', requirement: 200, xpReward: 500, description: 'Regular contributor' },
            { rank: 'AAA', title: 'Ultra Committer', requirement: 500, xpReward: 1000, description: 'Focused development' },
            { rank: 'S', title: 'Super Committer', requirement: 1000, xpReward: 2000, description: 'Serious dedication' },
            { rank: 'SS', title: 'Deep Committer', requirement: 2000, xpReward: 4000, description: 'Long-term work' },
            { rank: 'SSS', title: 'God Committer', requirement: 4000, xpReward: 10000, description: 'Legendary status' },
        ]
    },
    {
        id: 'stars',
        category: 'Stars',
        name: 'Stargazer',
        tiers: [
            { rank: 'C', title: 'First Star', requirement: 1, xpReward: 50, description: 'First appreciation' },
            { rank: 'B', title: 'Middle Star', requirement: 10, xpReward: 150, description: 'Building momentum' },
            { rank: 'A', title: 'You are a Star', requirement: 30, xpReward: 400, description: 'Growing recognition' },
            { rank: 'AA', title: 'High Star', requirement: 50, xpReward: 600, description: 'Useful tools' },
            { rank: 'AAA', title: 'Super Star', requirement: 100, xpReward: 1200, description: 'Great documentation' },
            { rank: 'S', title: 'Stargazer', requirement: 200, xpReward: 2500, description: 'Quality over quantity' },
            { rank: 'SS', title: 'High Stargazer', requirement: 700, xpReward: 5000, description: 'Multiple successful repos' },
            { rank: 'SSS', title: 'Super Stargazer', requirement: 2000, xpReward: 15000, description: 'Viral project creation' },
        ]
    },
    {
        id: 'prs',
        category: 'PRs',
        name: 'Pull Shark',
        tiers: [
            { rank: 'C', title: 'First Pull', requirement: 1, xpReward: 50, description: 'First contribution' },
            { rank: 'B', title: 'Middle Puller', requirement: 10, xpReward: 150, description: 'Getting involved' },
            { rank: 'A', title: 'High Puller', requirement: 20, xpReward: 300, description: 'Growing contributor' },
            { rank: 'S', title: 'Super Puller', requirement: 200, xpReward: 2000, description: 'Serious collaborator' },
            { rank: 'SSS', title: 'God Puller', requirement: 1000, xpReward: 10000, description: 'Open source champion' },
        ]
    }
];

export const INITIAL_QUESTS: Quest[] = [
    {
        id: 'setup-profile',
        title: 'Profile Foundation',
        description: 'Create a special repository with your username to activate your Profile README.',
        xpReward: 100,
        isCompleted: false,
        category: 'Community',
        requirement: { type: 'manual' }
    },
    {
        id: 'first-pr',
        title: 'First Contribution',
        description: 'Merge your first Pull Request to any public repository.',
        xpReward: 150,
        isCompleted: false,
        category: 'PRs',
        requirement: { type: 'api_check', metric: 'prs', target: 1 }
    },
    {
        id: 'star-hunter',
        title: 'Star Hunter',
        description: ' earn your first star on one of your repositories.',
        xpReward: 100,
        isCompleted: false,
        category: 'Stars',
        requirement: { type: 'api_check', metric: 'stars', target: 1 }
    }
];
