'use client';
import React, { useCallback, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AnimatePresence, MotionConfig, motion, useAnimationControls } from 'framer-motion';
import { unlockBook } from '../actions';
import type { BookChapter } from '../lib/book-data';
import { BookNavbar } from './BookNavbar';

type Status = 'idle' | 'wrong' | 'error';

// Critically damped: the wall settles, it doesn't bounce.
const SETTLE = { type: 'spring', bounce: 0, duration: 0.6 } as const;
const MATERIALIZE = {
  initial: { opacity: 0, y: 12, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, filter: 'blur(6px)' },
  transition: SETTLE,
};

const PILL =
  'inline-flex min-h-11 items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/80 px-5 py-2.5 ' +
  'text-sm font-serif tracking-wide text-neutral-300 backdrop-blur-xl transition-[transform,background-color,color] ' +
  'duration-150 hover:bg-neutral-800 hover:text-neutral-100 active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100';

/**
 * Friends-and-family wall for /book. It renders on every load — nothing is
 * remembered, so a reload brings the wall back. The chapter list is not in the
 * page until the server has accepted the answer.
 */
export function BookGate() {
  const [chapters, setChapters] = useState<BookChapter[] | null>(null);
  const [answer, setAnswer] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  // Keys the alert text: an identical repeat attempt still gets a fresh node, so it is re-announced.
  const [attempt, setAttempt] = useState(0);
  const [pending, startTransition] = useTransition();
  const shake = useAnimationControls();
  const inputRef = useRef<HTMLInputElement>(null);
  // The input unmounts on unlock; hand focus to the new heading so keyboard and
  // screen-reader users land on the change instead of <body>. Stable identity = runs once on mount.
  const focusHeading = useCallback(
    (node: HTMLHeadingElement | null) => node?.focus({ preventScroll: true }),
    []
  );

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (pending || answer.trim() === '') return;

    startTransition(async () => {
      try {
        const result = await unlockBook(answer);
        if (result.ok) {
          setChapters(result.chapters);
          return;
        }
        setStatus('wrong');
        setAttempt(count => count + 1);
        shake.start({ x: [0, -8, 8, -5, 5, 0], transition: { duration: 0.4 } });
        // Leave the guess selected so the next attempt is one keystroke away.
        inputRef.current?.select();
      } catch {
        setStatus('error');
        setAttempt(count => count + 1);
      }
    });
  };

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait" initial={false}>
        {chapters ? (
          <motion.div key="chapters" className="w-full max-w-3xl" {...MATERIALIZE}>
            <div className="text-center mb-20">
              <h1
                ref={focusHeading}
                tabIndex={-1}
                className="text-6xl md:text-8xl font-serif font-light text-neutral-200 mb-6 tracking-tight focus-visible:outline-none"
              >
                Chapters
              </h1>
              <p className="text-sm text-neutral-600 font-serif tracking-widest uppercase">
                Yash Siwach
              </p>
            </div>

            <div className="space-y-1">
              {chapters.map((chapter, index) => {
                const chapterMatch = chapter.title.match(/Chapter (\d+)/i);
                const chapterNumber = chapterMatch ? chapterMatch[1] : index + 1;

                return (
                  <Link key={chapter.slug} href={`/book/${chapter.slug}`} className="group block">
                    <div className="flex items-baseline gap-6 py-6 border-b border-neutral-900 hover:border-neutral-700 transition-colors duration-300">
                      <span className="text-sm text-neutral-600 font-mono w-12 flex-shrink-0">
                        {String(chapterNumber).padStart(2, '0')}
                      </span>
                      <div className="flex-grow">
                        <h3 className="text-xl font-serif text-neutral-300 group-hover:text-neutral-100 transition-colors duration-300">
                          {chapter.title}
                        </h3>
                      </div>
                      <span className="text-xs text-neutral-700 font-mono flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-20 text-center">
              <Link
                href="/"
                className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors font-serif tracking-wider"
              >
                ← Portfolio
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div key="wall" className="w-full max-w-md text-center" {...MATERIALIZE}>
            <p className="text-sm text-neutral-400 font-serif tracking-widest uppercase mb-6">
              Chapters
            </p>
            <h1 className="text-4xl md:text-5xl font-serif font-light text-neutral-200 tracking-tight leading-[1.1] mb-5">
              A quiet corner, for friends and family.
            </h1>
            <p className="font-serif text-neutral-400 leading-relaxed mb-10">
              These chapters are personal writing, shared with a few people for now. Looking for my
              work? The portfolio is this way.
            </p>

            <Link href="/" className={PILL}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              See my portfolio
            </Link>

            <form onSubmit={submit} className="mt-14 pt-10 border-t border-neutral-900" noValidate>
              <label htmlFor="book-gate-answer" className="block font-serif text-neutral-400 mb-5">
                Family or a friend? Tell me the name of Yash&apos;s dog to come in.
              </label>
              <motion.div animate={shake} className="flex items-center gap-3">
                <input
                  ref={inputRef}
                  id="book-gate-answer"
                  type="text"
                  value={answer}
                  onChange={event => {
                    setAnswer(event.target.value);
                    if (status !== 'idle') setStatus('idle');
                  }}
                  readOnly={pending}
                  maxLength={64}
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  enterKeyHint="go"
                  aria-invalid={status === 'wrong'}
                  aria-describedby="book-gate-status"
                  className="min-w-0 flex-1 bg-transparent border-b border-neutral-500 px-1 py-2 text-lg font-serif text-neutral-200 placeholder:text-neutral-700 transition-colors duration-300 focus-visible:outline-none focus-visible:border-neutral-400"
                />
                <button type="submit" disabled={pending || answer.trim() === ''} className={PILL}>
                  {pending ? 'Checking…' : 'Enter'}
                </button>
              </motion.div>
              <p
                id="book-gate-status"
                role="alert"
                className="mt-4 h-5 text-sm font-serif text-neutral-400"
              >
                {status !== 'idle' && (
                  <span key={attempt}>
                    {status === 'wrong'
                      ? 'Not quite. Try again.'
                      : "Couldn't check just now. Try again in a moment."}
                  </span>
                )}
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Outside the motion wrapper: its filter would become the containing block for `fixed`. */}
      {chapters && <BookNavbar />}
    </MotionConfig>
  );
}

export default BookGate;
