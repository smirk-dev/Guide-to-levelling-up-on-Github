import { Octokit } from '@octokit/rest';

export async function fetchGitHubStats(accessToken) {
    const octokit = new Octokit({ auth: accessToken });

    try {
        // Fetch user profile
        const { data: user } = await octokit.users.getAuthenticated();

        // Fetch repositories
        const { data: repos } = await octokit.repos.listForAuthenticatedUser({
            per_page: 100,
            sort: 'updated'
        });

        // Calculate total stars received
        const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);

        // Fetch total commits (approximate from recent activity)
        const { data: events } = await octokit.activity.listEventsForAuthenticatedUser({
            per_page: 100
        });

        const commitEvents = events.filter(e => e.type === 'PushEvent');
        const recentCommits = commitEvents.reduce((sum, event) => {
            return sum + (event.payload.commits?.length || 0);
        }, 0);

        // Fetch PRs (search API)
        const { data: prSearch } = await octokit.search.issuesAndPullRequests({
            q: `author:${user.login} type:pr`,
            per_page: 1
        });

        // Fetch Issues
        const { data: issueSearch } = await octokit.search.issuesAndPullRequests({
            q: `author:${user.login} type:issue`,
            per_page: 1
        });

        return {
            username: user.login,
            avatarUrl: user.avatar_url,
            name: user.name,
            bio: user.bio,
            followers: user.followers,
            publicRepos: user.public_repos,
            totalStars,
            totalPRs: prSearch.total_count,
            totalIssues: issueSearch.total_count,
            accountAge: Math.floor((Date.now() - new Date(user.created_at)) / (1000 * 60 * 60 * 24 * 365)),
            // Note: Total commits require iterating all repos - expensive!
            // For now, we'll use a placeholder or fetch from profile
            estimatedCommits: recentCommits * 10 // Rough estimate
        };
    } catch (error) {
        console.error('Error fetching GitHub stats:', error);
        throw error;
    }
}

export function calculateAchievements(stats) {
    const achievements = [];

    // Commits achievements
    if (stats.estimatedCommits >= 4000) achievements.push({ id: 'commits', rank: 'SSS' });
    else if (stats.estimatedCommits >= 2000) achievements.push({ id: 'commits', rank: 'SS' });
    else if (stats.estimatedCommits >= 1000) achievements.push({ id: 'commits', rank: 'S' });
    else if (stats.estimatedCommits >= 500) achievements.push({ id: 'commits', rank: 'AAA' });
    else if (stats.estimatedCommits >= 200) achievements.push({ id: 'commits', rank: 'AA' });
    else if (stats.estimatedCommits >= 100) achievements.push({ id: 'commits', rank: 'A' });
    else if (stats.estimatedCommits >= 10) achievements.push({ id: 'commits', rank: 'B' });
    else if (stats.estimatedCommits >= 1) achievements.push({ id: 'commits', rank: 'C' });

    // Stars achievements
    if (stats.totalStars >= 2000) achievements.push({ id: 'stars', rank: 'SSS' });
    else if (stats.totalStars >= 700) achievements.push({ id: 'stars', rank: 'SS' });
    else if (stats.totalStars >= 200) achievements.push({ id: 'stars', rank: 'S' });
    else if (stats.totalStars >= 100) achievements.push({ id: 'stars', rank: 'AAA' });
    else if (stats.totalStars >= 50) achievements.push({ id: 'stars', rank: 'AA' });
    else if (stats.totalStars >= 30) achievements.push({ id: 'stars', rank: 'A' });
    else if (stats.totalStars >= 10) achievements.push({ id: 'stars', rank: 'B' });
    else if (stats.totalStars >= 1) achievements.push({ id: 'stars', rank: 'C' });

    // PRs achievements
    if (stats.totalPRs >= 1000) achievements.push({ id: 'prs', rank: 'SSS' });
    else if (stats.totalPRs >= 500) achievements.push({ id: 'prs', rank: 'SS' });
    else if (stats.totalPRs >= 200) achievements.push({ id: 'prs', rank: 'S' });
    else if (stats.totalPRs >= 100) achievements.push({ id: 'prs', rank: 'AAA' });
    else if (stats.totalPRs >= 50) achievements.push({ id: 'prs', rank: 'AA' });
    else if (stats.totalPRs >= 20) achievements.push({ id: 'prs', rank: 'A' });
    else if (stats.totalPRs >= 10) achievements.push({ id: 'prs', rank: 'B' });
    else if (stats.totalPRs >= 1) achievements.push({ id: 'prs', rank: 'C' });

    return achievements;
}

export function calculateLevel(stats) {
    // Simple XP formula: stars * 10 + PRs * 5 + commits * 1
    const xp = (stats.totalStars * 10) + (stats.totalPRs * 5) + (stats.estimatedCommits * 1);
    const level = Math.floor(xp / 100) + 1;
    const currentXP = xp % 100;
    const xpToNextLevel = 100;

    return { level, currentXP, xpToNextLevel, totalXP: xp };
}
