import { proof } from '@/app/lib/content';
import {
  getGithub,
  getRecentActivity,
  type GithubStats,
  type ActivityItem,
} from '@/app/lib/github';
import { SectionHeading } from '@/app/components/chrome/SectionHeading';

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
            <span data-numeric className="shrink-0 font-mono text-xs text-ink-mute">
              {timeAgo(item.date)}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/**
 * Async server component: getGithub()/getRecentActivity() run at
 * request/build time on the server, so real data (or an honest failure) is
 * in the initial HTML — no client-side loading spinner for something this
 * low-stakes.
 */
export async function Proof() {
  const [result, activityResult] = await Promise.all([getGithub(), getRecentActivity()]);
  const stats = result.ok ? result.data : null;
  const activity = activityResult.ok ? activityResult.data : null;

  return (
    <section id="proof" aria-labelledby="proof-heading" className="section-rhythm">
      <div className="grid-shell">
        <SectionHeading id="proof-heading" eyebrow={proof.eyebrow} title={proof.heading} />

        <div className="col-span-12 mt-16 md:col-span-7">
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
            <p className="mt-3 font-mono text-xs text-ink-mute">
              {stats.totalContributions.toLocaleString('en-US')} contributions · longest streak{' '}
              {stats.longestStreak} {stats.longestStreak === 1 ? 'day' : 'days'}
            </p>
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
      </div>
    </section>
  );
}

export default Proof;
