import { profile } from '@/app/lib/content';

/**
 * Server-only. GITHUB_TOKEN must never reach the client bundle — this module
 * is imported only by an async server component (Proof.tsx) and a route
 * handler (api/github/route.ts), never by anything with 'use client'.
 *
 * The contribution calendar is GraphQL-only; there is no REST equivalent.
 */

const GITHUB_LOGIN = (() => {
  const gh = profile.socials.find(s => s.label === 'GitHub');
  const match = gh?.href.match(/github\.com\/([^/]+)/);
  return match?.[1] ?? 'iamyashsiwach';
})();

/** Seconds GitHub responses are cached for, server-side. The section polls
 * /api/github while it's on screen, so this is what "live" means in
 * practice — and it keeps even heavy traffic to one call per minute. */
const REVALIDATE = 60;

// No from/to: GitHub then uses a rolling window ending now (the past year),
// so the stats keep moving. This used to be pinned to calendar-year 2025,
// which quietly stopped counting anything new on Jan 1.
const QUERY = /* GraphQL */ `
  query ($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              weekday
              contributionCount
            }
          }
        }
      }
    }
  }
`;

export type ContributionDay = { date: string; weekday: number; count: number };
export type ContributionWeek = ContributionDay[];

export type GithubStats = {
  totalContributions: number;
  activeDays: number;
  longestStreak: number;
  weeks: ContributionWeek[];
};

export type GithubResult =
  | { ok: true; data: GithubStats }
  | { ok: false; reason: 'no-token' | 'rate-limited' | 'error' };

function computeStreak(days: ContributionDay[]): number {
  let longest = 0;
  let current = 0;
  for (const day of days) {
    if (day.count > 0) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }
  return longest;
}

/** Cached for REVALIDATE seconds by Next's fetch cache, which keeps every
 * render of Proof.tsx plus every hit on /api/github off GitHub's rate limit. */
export async function getGithub(): Promise<GithubResult> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return { ok: false, reason: 'no-token' };

  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: QUERY, variables: { login: GITHUB_LOGIN } }),
      next: { revalidate: REVALIDATE },
    });

    if (res.status === 401 || res.status === 403) {
      return { ok: false, reason: res.status === 403 ? 'rate-limited' : 'no-token' };
    }
    if (!res.ok) return { ok: false, reason: 'error' };

    const json = await res.json();
    if (json.errors?.length) {
      const rateLimited = json.errors.some((e: { type?: string }) => e.type === 'RATE_LIMITED');
      return { ok: false, reason: rateLimited ? 'rate-limited' : 'error' };
    }

    const calendar = json.data?.user?.contributionsCollection?.contributionCalendar;
    if (!calendar) return { ok: false, reason: 'error' };

    const weeks: ContributionWeek[] = calendar.weeks.map(
      (week: {
        contributionDays: { date: string; weekday: number; contributionCount: number }[];
      }) =>
        week.contributionDays.map(d => ({
          date: d.date,
          weekday: d.weekday,
          count: d.contributionCount,
        }))
    );

    const allDays = weeks.flat();
    const activeDays = allDays.filter(d => d.count > 0).length;
    const longestStreak = computeStreak(allDays);

    return {
      ok: true,
      data: {
        totalContributions: calendar.totalContributions,
        activeDays,
        longestStreak,
        weeks,
      },
    };
  } catch {
    return { ok: false, reason: 'error' };
  }
}

export type ActivityItem = { id: string; text: string; url: string; date: string };
export type ActivityResult =
  | { ok: true; data: ActivityItem[] }
  | { ok: false; reason: 'no-token' | 'rate-limited' | 'error' };

type GithubEvent = {
  id: string;
  type: string;
  created_at: string;
  repo?: { name: string };
  payload?: {
    action?: string;
    ref_type?: string;
    pull_request?: { merged?: boolean };
  };
};

/** Translates a raw public event into a plain-English line — never the raw
 * GitHub event type. Returns null for event types not worth surfacing here
 * (stars, branch pushes, comments) so the feed stays a "what I shipped"
 * list, not a firehose of every micro-action. */
function describeEvent(e: GithubEvent): ActivityItem | null {
  const full = e.repo?.name ?? '';
  const url = `https://github.com/${full}`;
  const base = { id: e.id, url, date: e.created_at };

  // The full "owner/repo" form, not just the repo half — some real repos
  // (this site's own is one) have single-letter names, which read as a
  // broken placeholder on their own. "owner/repo" is unambiguous either way.
  switch (e.type) {
    case 'PushEvent':
      // The public events API no longer includes a commit count or list on
      // this payload (verified against the live endpoint — payload here is
      // just push_id/ref/head/before), so this never claims a number it
      // cannot back up.
      return { ...base, text: `Pushed to ${full}` };
    case 'PullRequestEvent': {
      const action = e.payload?.action;
      // Verified against the live endpoint: this API reports a merge as its
      // own action: 'merged', not action: 'closed' + pull_request.merged —
      // that's the webhook payload's shape, not this one. Handling both
      // keeps this correct if that ever changes.
      if (action === 'merged' || (action === 'closed' && e.payload?.pull_request?.merged)) {
        return { ...base, text: `Merged a pull request in ${full}` };
      }
      if (action === 'opened') return { ...base, text: `Opened a pull request in ${full}` };
      return null;
    }
    case 'CreateEvent':
      if (e.payload?.ref_type === 'repository') {
        return { ...base, text: `Started a new project: ${full}` };
      }
      return null;
    case 'ReleaseEvent':
      return { ...base, text: `Published a release in ${full}` };
    default:
      return null;
  }
}

/** Recent public activity — a REST endpoint, unlike the calendar, so this
 * is a plain GET rather than GraphQL. Same token, same cache window. */
export async function getRecentActivity(): Promise<ActivityResult> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return { ok: false, reason: 'no-token' };

  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_LOGIN}/events/public?per_page=30`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
        },
        next: { revalidate: REVALIDATE },
      }
    );

    if (res.status === 401) return { ok: false, reason: 'no-token' };
    if (res.status === 403) return { ok: false, reason: 'rate-limited' };
    if (!res.ok) return { ok: false, reason: 'error' };

    const events: GithubEvent[] = await res.json();
    const items = events
      .map(describeEvent)
      .filter((item): item is ActivityItem => item !== null)
      .slice(0, 5);

    return { ok: true, data: items };
  } catch {
    return { ok: false, reason: 'error' };
  }
}
