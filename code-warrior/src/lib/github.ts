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

// GitHub Achievement badge structure (used internally)
export interface GitHubAchievement {
  id: string;
  name: string;
  tier: 'x1' | 'x2' | 'x3' | 'x4' | null; // null for non-tiered badges
  description: string;
  unlockedAt?: string;
}

// Badge criteria thresholds based on GitHub's actual achievement system
const BADGE_CRITERIA = {
  PULL_SHARK: { thresholds: [2, 16, 128, 512], stat: 'prs' as const },
  STARSTRUCK: { thresholds: [16, 128, 512, 4096], stat: 'stars' as const },
  GALAXY_BRAIN: { thresholds: [2, 8, 16, 32], stat: 'reviews' as const }, // Using reviews as proxy for discussion answers
  YOLO: { threshold: 1, stat: 'prs' as const }, // Single PR merged (simplified)
} as const;

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
 * Calculate GitHub achievement badges from stats
 * Since GitHub doesn't expose achievements via API, we calculate them locally
 * based on known criteria thresholds.
 */
export function calculateGitHubAchievements(stats: GitHubStats): GitHubAchievement[] {
  const achievements: GitHubAchievement[] = [];
  const now = new Date().toISOString();

  // Helper to determine tier based on thresholds
  const getTier = (value: number, thresholds: readonly number[]): 'x1' | 'x2' | 'x3' | 'x4' | null => {
    if (value >= thresholds[3]) return 'x4';
    if (value >= thresholds[2]) return 'x3';
    if (value >= thresholds[1]) return 'x2';
    if (value >= thresholds[0]) return 'x1';
    return null;
  };

  // Pull Shark - Based on merged PRs
  const pullSharkTier = getTier(stats.totalPRs, BADGE_CRITERIA.PULL_SHARK.thresholds);
  if (pullSharkTier) {
    achievements.push({
      id: `pull-shark-${pullSharkTier}`,
      name: 'Pull Shark',
      tier: pullSharkTier,
      description: `Merged ${stats.totalPRs} pull requests`,
      unlockedAt: now,
    });
  }

  // Starstruck - Based on stars received
  const starstruckTier = getTier(stats.totalStars, BADGE_CRITERIA.STARSTRUCK.thresholds);
  if (starstruckTier) {
    achievements.push({
      id: `starstruck-${starstruckTier}`,
      name: 'Starstruck',
      tier: starstruckTier,
      description: `Received ${stats.totalStars} stars`,
      unlockedAt: now,
    });
  }

  // Galaxy Brain - Based on reviews (proxy for discussion answers)
  const galaxyBrainTier = getTier(stats.totalReviews, BADGE_CRITERIA.GALAXY_BRAIN.thresholds);
  if (galaxyBrainTier) {
    achievements.push({
      id: `galaxy-brain-${galaxyBrainTier}`,
      name: 'Galaxy Brain',
      tier: galaxyBrainTier,
      description: `Provided ${stats.totalReviews} code reviews`,
      unlockedAt: now,
    });
  }

  // YOLO - Merged at least one PR (simplified - actual YOLO is PR without review)
  if (stats.totalPRs >= BADGE_CRITERIA.YOLO.threshold) {
    achievements.push({
      id: 'yolo',
      name: 'YOLO',
      tier: null,
      description: 'Merged a pull request',
      unlockedAt: now,
    });
  }

  // Arctic Code Vault Contributor - Based on commits (simplified)
  if (stats.totalCommits >= 100) {
    achievements.push({
      id: 'arctic-code-vault',
      name: 'Arctic Code Vault',
      tier: null,
      description: 'Contributed to the Arctic Code Vault',
      unlockedAt: now,
    });
  }

  // Public Sponsor - Based on having stars (community engagement proxy)
  if (stats.totalStars >= 10) {
    achievements.push({
      id: 'public-sponsor',
      name: 'Public Sponsor',
      tier: null,
      description: 'Active open source contributor',
      unlockedAt: now,
    });
  }

  return achievements;
}
