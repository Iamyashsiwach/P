import { parse, type DefaultTreeAdapterTypes } from 'parse5';
import type { ContributionDay, ContributionWeek } from './github';

type Node = DefaultTreeAdapterTypes.Node;

function textContent(node: Node): string {
  if (node.nodeName === '#text' && 'value' in node) return node.value;
  return 'childNodes' in node ? node.childNodes.map(textContent).join('') : '';
}

/** GitHub's public calendar includes exact counts in tooltips, keyed to
 * each cell's id. Cells are ordered by weekday in the HTML, not by date. */
export function parseContributionCalendar(html: string): ContributionWeek[] | null {
  const cells: { id: string; date: string }[] = [];
  const counts = new Map<string, number>();

  function visit(node: Node) {
    if ('attrs' in node) {
      const attrs = Object.fromEntries(node.attrs.map(attr => [attr.name, attr.value]));
      if (node.tagName === 'td' && attrs['data-date']) {
        cells.push({ id: attrs.id, date: attrs['data-date'] });
      }
      if (node.tagName === 'tool-tip' && attrs.for) {
        const match = textContent(node)
          .trim()
          .match(/^(No|[\d,]+) contributions? on\b/i);
        if (match) {
          counts.set(
            attrs.for,
            match[1].toLowerCase() === 'no' ? 0 : Number(match[1].replace(/,/g, ''))
          );
        }
      }
    }
    if ('childNodes' in node) node.childNodes.forEach(visit);
  }
  visit(parse(html));

  // A sign-in/error page or changed markup must never become a fake zero.
  if (cells.length === 0) return null;
  cells.sort((a, b) => a.date.localeCompare(b.date));

  const weeks: ContributionWeek[] = [];
  let previousTime: number | undefined;
  for (const cell of cells) {
    const time = Date.parse(`${cell.date}T00:00:00Z`);
    const count = counts.get(cell.id);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(cell.date) ||
      !Number.isFinite(time) ||
      new Date(time).toISOString().slice(0, 10) !== cell.date ||
      count === undefined ||
      !Number.isSafeInteger(count) ||
      (previousTime !== undefined && time - previousTime !== 86_400_000)
    ) {
      return null;
    }

    const day: ContributionDay = { date: cell.date, weekday: new Date(time).getUTCDay(), count };
    if (weeks.length === 0 || day.weekday === 0) weeks.push([]);
    weeks[weeks.length - 1].push(day);
    previousTime = time;
  }
  return weeks;
}
