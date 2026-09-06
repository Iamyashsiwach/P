import { NextResponse } from 'next/server';
import { getGithub } from '@/app/lib/github';

/**
 * The terminal's `contributions`/`activity` command hits this instead of
 * importing app/lib/github.ts directly — that module reads GITHUB_TOKEN, and
 * a client component must never import a server-only module that touches a
 * secret, even one that never actually sends the token to the browser.
 *
 * Next 15 no longer caches GET route handlers by default, so this is explicit
 * about it — getGithub() itself is already cached for an hour via the fetch
 * layer, this just makes sure the response Next serves out of this route
 * follows the same hour, not zero.
 */
export const revalidate = 3600;
export const dynamic = 'force-static';

export async function GET() {
  const result = await getGithub();
  return NextResponse.json(result, {
    headers: { 'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400' },
  });
}
