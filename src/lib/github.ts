export interface RepoSummary {
  name: string;
  body: string;
  language?: string;
  languageColor?: string;
  starCount: number;
  forkCount: number;
  isPublic: boolean;
  updatedAt: string;
}

function getToken(): string {
  const token = import.meta.env.ASTRO_GITHUB_TOKEN;
  if (!token) {
    throw new Error("ASTRO_GITHUB_TOKEN is not set");
  }
  return token;
}

async function graphql(query: string) {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ query }),
  });
  const json = await res.json();
  if (!res.ok || !json.data) {
    const msg = json.message || JSON.stringify(json.errors ?? json);
    throw new Error(`GitHub API error: ${msg}`);
  }
  return json.data;
}

/** Read-through file cache used in dev so we don't hammer the API on HMR. */
async function withDevCache<T>(
  cacheFile: string,
  fetcher: () => Promise<T>,
): Promise<T> {
  const isDev = import.meta.env.DEV;
  if (isDev) {
    try {
      const fs = await import("fs/promises");
      const path = await import("path");
      const cached = JSON.parse(
        await fs.readFile(path.resolve(cacheFile), "utf-8"),
      );
      if (Date.now() - cached.timestamp < 60 * 60 * 1000) {
        console.log(`Using cached data from ${cacheFile}`);
        return cached.data;
      }
    } catch {
      console.log(`No valid cache at ${cacheFile}, fetching from GitHub...`);
    }
  }

  const data = await fetcher();

  if (isDev) {
    try {
      const fs = await import("fs/promises");
      const path = await import("path");
      const cachePath = path.resolve(cacheFile);
      await fs.mkdir(path.dirname(cachePath), { recursive: true });
      await fs.writeFile(
        cachePath,
        JSON.stringify({ timestamp: Date.now(), data }, null, 2),
        "utf-8",
      );
      console.log(`Cached data to ${cacheFile}`);
    } catch (error) {
      console.error("Failed to write cache:", error);
    }
  }

  return data;
}

const summarize = (repo: any): RepoSummary => ({
  name: repo.name,
  body: repo.description || "",
  language: repo.primaryLanguage?.name,
  languageColor: repo.primaryLanguage?.color,
  starCount: repo.stargazerCount,
  forkCount: repo.forkCount,
  isPublic: !repo.isPrivate,
  updatedAt: repo.updatedAt,
});

const REPO_FIELDS = `
  name
  description
  url
  homepageUrl
  openGraphImageUrl
  isPrivate
  stargazerCount
  forkCount
  updatedAt
  primaryLanguage {
    name
    color
  }
`;

/** Own (non-fork) repos with at least one star, newest activity first. */
export function getAllRepositories(): Promise<RepoSummary[]> {
  return withDevCache(".cache/repositories.json", async () => {
    const data = await graphql(`query {
      viewer {
        repositories(first: 100, ownerAffiliations: OWNER, isFork: false, isArchived: false, orderBy: {field: UPDATED_AT, direction: DESC}) {
          nodes { ${REPO_FIELDS} }
        }
      }
    }`);
    return data.viewer.repositories.nodes
      .filter((repo: any) => repo.stargazerCount >= 1)
      .map(summarize);
  });
}

/** Forks where at least one of our PRs was merged upstream. */
export function getForkedRepositories(): Promise<RepoSummary[]> {
  return withDevCache(".cache/forks.json", async () => {
    const data = await graphql(`query {
      viewer {
        login
        repositories(first: 100, ownerAffiliations: OWNER, isFork: true, isArchived: false, orderBy: {field: UPDATED_AT, direction: DESC}) {
          nodes {
            ${REPO_FIELDS}
            parent {
              nameWithOwner
            }
          }
        }
      }
    }`);

    const login = data.viewer.login;
    const repos = data.viewer.repositories.nodes;

    const reposWithContributions = await Promise.all(
      repos.map(async (repo: any) => {
        const parent = repo.parent?.nameWithOwner;
        if (!parent) return null;
        try {
          const searchData = await graphql(
            `query { search(query: "is:pr author:${login} repo:${parent} is:merged", type: ISSUE, first: 1) { issueCount } }`,
          );
          return (searchData.search?.issueCount ?? 0) > 0 ? repo : null;
        } catch {
          return null;
        }
      }),
    );

    return reposWithContributions.filter(Boolean).map(summarize);
  });
}

export interface GitHubStats {
  totalContributions: number;
  followers: number;
  totalRepos: number;
}

/** Contribution + follower counts for the stats section. */
export function getGitHubStats(): Promise<GitHubStats> {
  return withDevCache(".cache/stats.json", async () => {
    const data = await graphql(`query {
      viewer {
        followers { totalCount }
        repositories(ownerAffiliations: OWNER, isFork: false) { totalCount }
        contributionsCollection {
          contributionCalendar { totalContributions }
        }
      }
    }`);
    return {
      totalContributions:
        data.viewer.contributionsCollection.contributionCalendar
          .totalContributions,
      followers: data.viewer.followers.totalCount,
      totalRepos: data.viewer.repositories.totalCount,
    };
  });
}
