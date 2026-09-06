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

/** Fixed to calendar-year 2025 rather than the API's default rolling
 * 365-day window — a deliberate choice, not shown anywhere in the UI copy. */
const RANGE_FROM = '2025-01-01T00:00:00Z';
const RANGE_TO = '2026-01-01T00:00:00Z';

const QUERY = /* GraphQL */ `
  query ($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
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

/** Cached for an hour by Next's fetch cache — a portfolio doesn't need
 * live-to-the-second contribution data, and this keeps every render of
 * Proof.tsx plus every hit on /api/github off GitHub's rate limit. */
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
      body: JSON.stringify({
        query: QUERY,
        variables: { login: GITHUB_LOGIN, from: RANGE_FROM, to: RANGE_TO },
      }),
      next: { revalidate: 3600 },
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
