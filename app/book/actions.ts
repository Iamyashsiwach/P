'use server';

import { getBookPosts, type BookChapter } from './lib/book-data';
import { matchesGateAnswer } from './lib/gate';

type UnlockResult = { ok: true; chapters: BookChapter[] } | { ok: false };

// ponytail: no rate limit — chapter pages stay reachable by URL anyway, so a
// guesser gains little. Add a Vercel firewall rule on this action if that changes.
export async function unlockBook(answer: unknown): Promise<UnlockResult> {
  if (typeof answer !== 'string') return { ok: false };

  const accepted = process.env.BOOK_GATE_ANSWER;
  if (!accepted) {
    console.error('BOOK_GATE_ANSWER is not set — /book stays locked for everyone');
    return { ok: false };
  }
  if (!matchesGateAnswer(answer, accepted)) return { ok: false };

  return { ok: true, chapters: getBookPosts().map(({ slug, title }) => ({ slug, title })) };
}
