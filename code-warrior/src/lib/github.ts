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
  const [repos, events] = await Promise.all([
    fetchGitHubRepos(username, accessToken),
    fetchGitHubEvents(username, accessToken),
  ]);

  // Calculate total stars across all repos
  const totalStars = repos.reduce(
    (sum, repo) => sum + repo.stargazers_count,
    0
  );

  // Count event types for commits, PRs, issues, reviews
  let totalCommits = 0;
  let totalPRs = 0;
  let totalIssues = 0;
  let totalReviews = 0;

  events.forEach((event) => {
    switch (event.type) {
      case 'PushEvent':
        // Each PushEvent can contain multiple commits
        totalCommits += event.payload.commits?.length || 0;
        break;
      case 'PullRequestEvent':
        if (event.payload.action === 'opened') {
          totalPRs++;
        }
        break;
      case 'IssuesEvent':
        if (event.payload.action === 'opened') {
          totalIssues++;
        }
        break;
      case 'PullRequestReviewEvent':
        totalReviews++;
        break;
    }
  });

  return {
    totalStars,
    totalRepos: repos.length,
    totalCommits,
    totalPRs,
    totalIssues,
    totalReviews,
  };
}
