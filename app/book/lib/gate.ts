import { createHash, timingSafeEqual } from 'node:crypto';

const MAX_ANSWER_LENGTH = 64;

const normalize = (value: string) =>
  value.normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase();

// Hashing first gives timingSafeEqual the equal-length buffers it requires.
const digest = (value: string) => createHash('sha256').update(normalize(value)).digest();

/**
 * Checks a visitor's answer against BOOK_GATE_ANSWER. The env value may be a
 * comma-separated list so spelling variants ("fido,phido") both pass.
 * Fails closed: no configured answer means nobody gets in.
 */
export function matchesGateAnswer(input: string, accepted: string | undefined): boolean {
  if (!accepted || input.trim() === '' || input.length > MAX_ANSWER_LENGTH) return false;

  const guess = digest(input);
  // Every candidate is compared (no early exit) so timing never reveals which one matched.
  return accepted
    .split(',')
    .filter(candidate => candidate.trim() !== '')
    .reduce((hit, candidate) => timingSafeEqual(guess, digest(candidate)) || hit, false);
}
