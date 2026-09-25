import { NextResponse } from 'next/server';
import { getGithub, getRecentActivity } from '@/app/lib/github';

/**
 * The Proof section's live refresh and the terminal's `contributions`/
 * `activity` command hit this instead of importing app/lib/github.ts
 * directly — that module reads GITHUB_TOKEN, and a client component must
 * never import a server-only module that touches a secret, even one that
 * never actually sends the token to the browser.
 *
 * Next 15 no longer caches GET route handlers by default, so this is explicit
 * about it: one minute, matching the fetch cache in github.ts. (Segment
 * config must be a literal, so it can't import that constant.)
 */
export const revalidate = 60;
export const dynamic = 'force-static';

export async function GET() {
  const [contributions, activity] = await Promise.all([getGithub(), getRecentActivity()]);
  return NextResponse.json(
    { contributions, activity },
    {
      headers: {
        'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
      },
    }
  );
}
