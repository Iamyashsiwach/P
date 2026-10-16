import { NextResponse } from 'next/server';
import { getGithub, getRecentActivity } from '@/app/lib/github';

/**
 * The Proof section's live refresh and the terminal's `contributions`/
 * `activity` command hit this instead of importing app/lib/github.ts
 * directly — that module reads GITHUB_TOKEN, and a client component must
 * never import a server-only module that touches a secret, even one that
 * never actually sends the token to the browser.
 *
 * Run at request time, keeping the shared upstream fetch cache in github.ts.
 * Do not prerender or CDN-cache a missing-token/upstream failure response.
 */
export const revalidate = 0;

export async function GET() {
  const [contributions, activity] = await Promise.all([getGithub(), getRecentActivity()]);
  return NextResponse.json(
    { contributions, activity },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}
