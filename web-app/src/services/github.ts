export async function fetchGitHubStats(username: string) {
    try {
        const response = await fetch(`https://api.github.com/users/${username}`);
        if (!response.ok) throw new Error('User not found');
        const data = await response.json();

        // We can also fetch events or other endpoints for more granular data
        // For now, let's just return the basic profile stats
        return {
            repos: data.public_repos,
            followers: data.followers,
            created_at: data.created_at,
            // Note: PRs/Stars requiring more complex queries (Search API or GraphQL)
            // We will mock deep stats for now or use Search API
        };
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function checkQuestRequirement(username: string, metric: string, target: number): Promise<boolean> {
    // In a real app, this would use the GitHub Search API to count PRs, etc.
    // For prototype, we will fetch basic stats or mock the Search API call
    // to avoid rate limits during dev/demo.

    if (metric === 'prs') {
        // Mock check for PRs - in reality: search?q=author:username type:pr
        console.log(`Checking PRs for ${username}...`);
        // Let's assume everyone has at least 1 PR for the demo goodness if they exist
        const stats = await fetchGitHubStats(username);
        return !!stats;
    }

    if (metric === 'stars') {
        // Check total stars received (requires iterating repos)
        // Simplified: Check if they have at least 1 follower as a proxy for 'social proof' for now
        // or just return true for demo
        const stats = await fetchGitHubStats(username);
        return !!stats && stats.followers > 0;
    }

    return false;
}
