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

// GitHub Achievement badge structure
export interface GitHubAchievement {
  name: string;
  tier?: string; // 'x1', 'x2', 'x3', 'x4' for tiered achievements
  iconUrl: string;
  unlockedAt?: string;
}

// Contribution calendar day structure
export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4; // intensity level for heatmap coloring
}

/**
 * Fetch user's contribution calendar for the past year using GraphQL API
 */
export async function fetchContributionCalendar(
  username: string,
  accessToken?: string
): Promise<ContributionDay[]> {
  if (!accessToken) {
    console.warn('No access token provided for contribution calendar');
    return [];
  }

  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                contributionLevel
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables: { username } }),
    });

    if (!response.ok) {
      console.error('GraphQL API error:', response.status);
      return [];
    }

    const data = await response.json();
    const weeks = data.data?.user?.contributionsCollection?.contributionCalendar?.weeks || [];

    // Flatten weeks into array of days
    const contributions: ContributionDay[] = [];
    for (const week of weeks) {
      for (const day of week.contributionDays) {
        contributions.push({
          date: day.date,
          count: day.contributionCount,
          level: mapContributionLevel(day.contributionLevel),
        });
      }
    }

    return contributions;
  } catch (error) {
    console.error('Error fetching contribution calendar:', error);
    return [];
  }
}

// Map GitHub's contribution level strings to numeric values
function mapContributionLevel(level: string): 0 | 1 | 2 | 3 | 4 {
  switch (level) {
    case 'NONE': return 0;
    case 'FIRST_QUARTILE': return 1;
    case 'SECOND_QUARTILE': return 2;
    case 'THIRD_QUARTILE': return 3;
    case 'FOURTH_QUARTILE': return 4;
    default: return 0;
  }
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

  // If we have access token, use GraphQL API for accurate commit count
  if (accessToken) {
    try {
      const graphqlQuery = {
        query: `
          query($username: String!) {
            user(login: $username) {
              contributionsCollection {
                totalCommitContributions
                restrictedContributionsCount
              }
            }
          }
        `,
        variables: { username }
      };

      const graphqlResponse = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(graphqlQuery),
      });

      if (graphqlResponse.ok) {
        const graphqlData = await graphqlResponse.json();
        const contributions = graphqlData.data?.user?.contributionsCollection;
        if (contributions) {
          totalCommits = contributions.totalCommitContributions + (contributions.restrictedContributionsCount || 0);
        }
      }
    } catch (error) {
      console.error('Error fetching commit count via GraphQL:', error);
      // Fall back to event-based count if GraphQL fails
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

/**
 * Fetch user's GitHub achievement badges
 * Note: GitHub doesn't provide a public API for achievements yet,
 * so we'll need to scrape the profile page or use a proxy service
 */
export async function fetchGitHubAchievements(
  username: string,
  accessToken?: string
): Promise<GitHubAchievement[]> {
  try {
    // For now, return empty array as GitHub doesn't expose achievements via API
    // In the future, we can:
    // 1. Scrape from profile page (https://github.com/username?tab=achievements)
    // 2. Use a third-party service that extracts this data
    // 3. Wait for GitHub to add this to their API

    // Placeholder: return common achievements based on stats
    const stats = await calculateGitHubStats(username, accessToken);
    const achievements: GitHubAchievement[] = [];

    // Generate achievements based on stats (simplified version)
    if (stats.totalPRs >= 1) {
      achievements.push({
        name: 'Pull Shark',
        tier: stats.totalPRs >= 128 ? 'x4' : stats.totalPRs >= 64 ? 'x3' : stats.totalPRs >= 16 ? 'x2' : 'x1',
        iconUrl: '/achievements/pull-shark.png',
      });
    }

    if (stats.totalRepos >= 1) {
      achievements.push({
        name: 'Quickdraw',
        tier: stats.totalRepos >= 32 ? 'x4' : stats.totalRepos >= 16 ? 'x3' : stats.totalRepos >= 8 ? 'x2' : 'x1',
        iconUrl: '/achievements/quickdraw.png',
      });
    }

    if (stats.totalIssues + stats.totalPRs >= 1) {
      achievements.push({
        name: 'YOLO',
        iconUrl: '/achievements/yolo.png',
      });
    }

    return achievements;
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return [];
  }
}
