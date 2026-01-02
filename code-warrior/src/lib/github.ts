// GitHub API wrapper for fetching user data
// Based on architecture.md Sync Engine requirements

interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  followers: number;
  following: number;
  public_repos: number;
  bio: string | null;
}

interface GitHubRepo {
  id: number;
  name: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
}

interface GitHubEvent {
  type: string;
  created_at: string;
  payload: any;
}

export interface GitHubStats {
  totalStars: number;
  totalRepos: number;
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
  totalReviews: number;
}

/**
 * Fetch GitHub user profile
 */
export async function fetchGitHubUser(
  username: string,
  accessToken?: string
): Promise<GitHubUser> {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  };

  // Use access token if available, otherwise fall back to API token
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  } else if (process.env.GITHUB_API_TOKEN) {
    headers.Authorization = `token ${process.env.GITHUB_API_TOKEN}`;
  }

  const response = await fetch(`https://api.github.com/users/${username}`, {
    headers,
    next: { revalidate: 900 }, // Cache for 15 minutes
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch user's repositories
 */
export async function fetchGitHubRepos(
  username: string,
  accessToken?: string
): Promise<GitHubRepo[]> {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  } else if (process.env.GITHUB_API_TOKEN) {
    headers.Authorization = `token ${process.env.GITHUB_API_TOKEN}`;
  }

  console.log('Fetching repos for username:', username);

  const response = await fetch(
    `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`,
    {
      headers,
      next: { revalidate: 900 },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('GitHub API error:', response.status, errorText);
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch user's recent events (commits, PRs, issues)
 */
export async function fetchGitHubEvents(
  username: string,
  accessToken?: string
): Promise<GitHubEvent[]> {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  } else if (process.env.GITHUB_API_TOKEN) {
    headers.Authorization = `token ${process.env.GITHUB_API_TOKEN}`;
  }

  const response = await fetch(
    `https://api.github.com/users/${username}/events?per_page=100`,
    {
      headers,
      next: { revalidate: 900 },
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Calculate comprehensive GitHub stats from API data
 * This is the core of the "Sync Engine" logic
 */
export async function calculateGitHubStats(
  username: string,
  accessToken?: string
): Promise<GitHubStats> {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  } else if (process.env.GITHUB_API_TOKEN) {
    headers.Authorization = `token ${process.env.GITHUB_API_TOKEN}`;
  }

  // Fetch repos to get stars and repo count
  const repos = await fetchGitHubRepos(username, accessToken);

  // Calculate total stars across all repos
  const totalStars = repos.reduce(
    (sum, repo) => sum + repo.stargazers_count,
    0
  );

  // Use GitHub Search API for more accurate counts
  const [prsResponse, issuesResponse, commitsResponse] = await Promise.all([
    // Search for PRs created by user
    fetch(`https://api.github.com/search/issues?q=type:pr+author:${username}`, {
      headers,
    }),
    // Search for issues created by user
    fetch(`https://api.github.com/search/issues?q=type:issue+author:${username}`, {
      headers,
    }),
    // Get user's events for commit count (best effort from recent activity)
    fetchGitHubEvents(username, accessToken),
  ]);

  let totalPRs = 0;
  let totalIssues = 0;
  
  if (prsResponse.ok) {
    const prsData = await prsResponse.json();
    totalPRs = prsData.total_count || 0;
  }

  if (issuesResponse.ok) {
    const issuesData = await issuesResponse.json();
    totalIssues = issuesData.total_count || 0;
  }

  // Count commits and reviews from recent events
  let totalCommits = 0;
  let totalReviews = 0;

  commitsResponse.forEach((event) => {
    switch (event.type) {
      case 'PushEvent':
        // Each PushEvent can contain multiple commits
        totalCommits += event.payload.commits?.length || 0;
        break;
      case 'PullRequestReviewEvent':
        totalReviews++;
        break;
    }
  });

  // If we have access token, try to get more accurate commit count from user's repos
  if (accessToken && repos.length > 0) {
    try {
      // Get commits from user's top repos (limit to 10 to avoid rate limits)
      const topRepos = repos.slice(0, 10);
      const commitCounts = await Promise.all(
        topRepos.map(async (repo) => {
          try {
            const commitsRes = await fetch(
              `https://api.github.com/repos/${username}/${repo.name}/commits?author=${username}&per_page=1`,
              { headers }
            );
            if (commitsRes.ok) {
              // Check Link header for pagination to get total count
              const linkHeader = commitsRes.headers.get('Link');
              if (linkHeader) {
                const match = linkHeader.match(/page=(\d+)>; rel="last"/);
                if (match) {
                  return parseInt(match[1], 10);
                }
              }
              // If no pagination, there's at least 1 commit if response is ok
              const commits = await commitsRes.json();
              return commits.length;
            }
            return 0;
          } catch {
            return 0;
          }
        })
      );
      
      const repoCommits = commitCounts.reduce((sum, count) => sum + count, 0);
      if (repoCommits > totalCommits) {
        totalCommits = repoCommits;
      }
    } catch (error) {
      console.error('Error fetching commit counts:', error);
    }
  }

  return {
    totalStars,
    totalRepos: repos.length,
    totalCommits,
    totalPRs,
    totalIssues,
    totalReviews,
  };
}
