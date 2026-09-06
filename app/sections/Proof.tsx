import { proof, log, work, certifications, type LogEntry } from '@/app/lib/content';
import { getGithub, type GithubStats } from '@/app/lib/github';
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

  return (
    <div
      aria-hidden="true"
      className="grid grid-flow-col grid-rows-7 gap-[3px] overflow-x-auto pb-2"
    >
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-rows-7 gap-[3px]">
          {Array.from({ length: 7 }, (_, di) => {
            const day = week[di] as { count: number } | null | undefined;
            const alpha = day ? ALPHA[bucket(day.count)] : 0;
            return (
              <div
                key={di}
                className={stats ? 'h-[10px] w-[10px] bg-signal' : 'h-[10px] w-[10px] bg-paper-2'}
                style={stats ? { opacity: alpha } : undefined}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

/**
 * Async server component: getGithub() runs at request/build time on the
 * server, so real data (or an honest failure) is in the initial HTML —
 * no client-side loading spinner for something this low-stakes.
 */
export async function Proof() {
  const result = await getGithub();
  const stats = result.ok ? result.data : null;

  // Every number here is read off log/work/certifications directly rather
  // than retyped, so it cannot drift from what those sections already say.
  type Receipt = { value: number; prefix?: string; suffix?: string; label: string };

  const metricEntries = log.years
    .flatMap(y => y.entries as unknown as LogEntry[])
    .filter((e): e is LogEntry & { metric: NonNullable<LogEntry['metric']> } => Boolean(e.metric));

  const receipts: Receipt[] = [
    ...metricEntries.map(e => ({
      value: e.metric.value,
      prefix: e.metric.prefix,
      suffix: e.metric.suffix,
      label: `${e.metric.label} — ${e.title}`,
    })),
    { value: work.projects.length, label: 'projects shipped, start to finish' },
    { value: certifications.items.length, label: 'certifications completed' },
  ];

  return (
    <section id="proof" aria-labelledby="proof-heading" className="section-rhythm">
      <div className="grid-shell">
        <SectionHeading id="proof-heading" eyebrow={proof.eyebrow} title={proof.heading} />

        <div className="col-span-12 mt-16">
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

        {/* Receipts: a horizontal, natively-scrollable strip rather than a
            Draggable+Inertia carousel — four short cards don't carry enough
            weight to justify the extra dependency surface and the
            allowNativeTouchScrolling gotcha that comes with it; a plain
            scroll-snap row is just as swipeable on a phone. */}
        <div className="col-span-12 mt-16">
          <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
            {receipts.map((r, i) => (
              <li key={i} className="w-[220px] shrink-0 snap-start border border-border p-5">
                <p data-numeric className="font-mono text-display-m text-signal">
                  {r.prefix}
                  {r.value.toLocaleString('en-US')}
                  {r.suffix}
                </p>
                <p className="mt-2 text-xs leading-snug text-ink-mute">{r.label}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default Proof;
