'use client';

import { useEffect, useRef, useState } from 'react';
import { proof, profile } from '@/app/lib/content';
import type { ActivityItem, ActivityResult, GithubResult, GithubStats } from '@/app/lib/github';

const REFRESH_MS = 60_000;
const GITHUB_URL =
  profile.socials.find(s => s.label === 'GitHub')?.href ?? 'https://github.com/iamyashsiwach';
const GITHUB_HANDLE = GITHUB_URL.replace(/\/$/, '').split('/').pop();

/** 5 buckets of --signal opacity, same idea as GitHub's own calendar —
 * 0 is the empty-cell background, 1-4 scale with how much happened that day. */
function bucket(count: number): number {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 10) return 3;
  return 4;
}

const ALPHA = [0.08, 0.28, 0.48, 0.7, 1];

function Heatmap({ stats }: { stats: GithubStats | null }) {
  const weeks =
    stats?.weeks ?? Array.from({ length: 53 }, () => Array.from({ length: 7 }, () => null));

  // A single flat grid, not weeks-nested-in-a-grid — nesting a 7-row grid
  // inside each column of an outer 7-row grid meant every week was placed as
  // ONE auto-placed item, so the 53 weeks got spread across 7 rows x ~8
  // columns instead of 7 rows x 53 columns: the whole thing rendered as a
  // handful of very tall stretched bars instead of a compact calendar.
  // Explicit fixed-pixel row/column tracks avoid that ambiguity entirely.
  const cells = weeks.flatMap(week => Array.from({ length: 7 }, (_, di) => week[di] ?? null));

  return (
    <div
      aria-hidden="true"
      data-print-hide
      className="grid gap-[3px] overflow-x-auto pb-2"
      style={{
        gridTemplateRows: 'repeat(7, 10px)',
        gridAutoFlow: 'column',
        gridAutoColumns: '10px',
      }}
    >
      {cells.map((day, i) => {
        const alpha = day ? ALPHA[bucket((day as { count: number }).count)] : 0;
        return (
          <div
            key={i}
            className={stats ? 'h-[10px] w-[10px] bg-signal' : 'h-[10px] w-[10px] bg-paper-2'}
            style={stats ? { opacity: alpha } : undefined}
          />
        );
      })}
    </div>
  );
}

function timeAgo(iso: string): string {
  const minutes = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function ActivityFeed({ items }: { items: ActivityItem[] | null }) {
  if (!items) {
    return <p className="text-sm text-ink-mute">{proof.activityUnavailable}</p>;
  }
  if (items.length === 0) {
    return <p className="text-sm text-ink-mute">Nothing public in the last little while.</p>;
  }
  return (
    <ul>
      {items.map(item => (
        <li key={item.id} className="border-b border-border">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-baseline justify-between gap-4 py-4 transition-colors hover:text-signal"
          >
            <span className="text-sm text-ink-dim">{item.text}</span>
            {/* The server rendered this against its own clock, possibly a
                minute or more ago — the client's first render is allowed to
                disagree, then keeps it current. */}
            <span
              data-numeric
              suppressHydrationWarning
              className="shrink-0 font-mono text-xs text-ink-mute"
            >
              {timeAgo(item.date)}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/**
 * The parts of the Proof section that change. Starts from the data the
 * server already put in the HTML, then — only while the section is on
 * screen and the tab is visible — refetches /api/github every minute, so
 * stats and the activity feed stay current and the "Xm ago" labels keep
 * moving. Nothing is fetched at page load, so it costs the initial load
 * nothing. A failed refresh keeps the last good data rather than flipping
 * the section to "unavailable".
 */
export function ProofLive({
  initialStats,
  initialActivity,
}: {
  initialStats: GithubStats | null;
  initialActivity: ActivityItem[] | null;
}) {
  const column = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState(initialStats);
  const [activity, setActivity] = useState(initialActivity);
  const [, setTick] = useState(0);

  useEffect(() => {
    const el = column.current?.closest('section') ?? column.current;
    if (!el) return;
    let timer: number | undefined;

    const refresh = async () => {
      if (document.visibilityState !== 'visible') return;
      try {
        const res = await fetch('/api/github');
        if (res.ok) {
          const json: { contributions: GithubResult; activity: ActivityResult } = await res.json();
          if (json.contributions.ok) setStats(json.contributions.data);
          if (json.activity.ok) setActivity(json.activity.data);
        }
      } catch {
        // Keep what's on screen; the next tick tries again.
      }
      setTick(t => t + 1);
    };

    const io = new IntersectionObserver(([entry]) => {
      window.clearInterval(timer);
      if (entry.isIntersecting) {
        refresh();
        timer = window.setInterval(refresh, REFRESH_MS);
      }
    });
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearInterval(timer);
    };
  }, []);

  return (
    <>
      <div ref={column} className="col-span-12 mt-16 md:col-span-7">
        {/* The sentence carries the point on its own — the grid behind it
            is backup for anyone who wants to look closer, not the other
            way round. A non-technical visitor should never need to read
            a contribution calendar to get what this section is saying. */}
        <p className="max-w-2xl font-display text-display-m text-ink">
          {stats
            ? proof.captionTemplate(stats.activeDays)
            : 'Real work, logged in public — GitHub keeps the receipts.'}
        </p>
        {stats ? (
          <>
            <p className="mt-3 font-mono text-xs text-ink-mute">
              {stats.totalContributions.toLocaleString('en-US')} contributions · longest streak{' '}
              {stats.longestStreak} {stats.longestStreak === 1 ? 'day' : 'days'}
            </p>
            <p className="mt-2 flex items-center gap-2 font-mono text-xs text-ink-mute">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-signal motion-safe:animate-pulse"
              />
              <span>
                {proof.note} ·{' '}
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline-offset-4 transition-colors hover:text-ink hover:underline"
                >
                  @{GITHUB_HANDLE} ↗
                </a>
              </span>
            </p>
          </>
        ) : (
          <p className="mt-3 font-mono text-xs text-ink-mute">{proof.unavailable}</p>
        )}

        <div className="mt-8 overflow-x-auto">
          <Heatmap stats={stats} />
        </div>
      </div>

      <div className="col-span-12 mt-16 md:col-span-4 md:col-start-9">
        <p className="mono-label border-b border-border pb-3">Recently</p>
        <div className="mt-2">
          <ActivityFeed items={activity} />
        </div>
      </div>
    </>
  );
}

export default ProofLive;
