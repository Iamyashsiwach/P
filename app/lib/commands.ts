import { profile, nav, about, certifications, work, log, stack, contact } from '@/app/lib/content';

export type CommandResult =
  | { kind: 'text'; lines: string[] }
  | { kind: 'goto'; href: string; lines?: string[] }
  | { kind: 'link'; href: string; lines?: string[] }
  | { kind: 'theme'; next: 'paper' | 'blueprint' | 'toggle'; lines?: string[] }
  | { kind: 'sound'; next: 'on' | 'off' | 'toggle'; lines?: string[] }
  | { kind: 'music'; next: 'on' | 'off' | 'toggle'; lines?: string[] }
  | { kind: 'clear' }
  | { kind: 'close'; lines?: string[] };

export type Command = {
  id: string;
  /** All phrasings that trigger this command, plain-English first — the
   * point of this whole file. `whoami` can exist for people who already
   * know it, but `about me` has to work identically, or a visitor who has
   * never opened a terminal gets nothing out of this. */
  aliases: string[];
  /** Shown in `help` and as a suggestion chip. */
  description: string;
  /** A few of these become the clickable chips on first boot. */
  suggested?: boolean;
  run: (args: string) => CommandResult;
};

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const projectsBySlug = new Map(work.projects.map(p => [slugify(p.title), p]));
const stackGroupsByLabel = new Map(stack.groups.map(g => [g.label.toLowerCase(), g]));

const HELP_INTRO = [
  'Hi — ask me something, or try one of these:',
  ...['about me', 'see projects', 'skills', 'say hi'].map(c => `  ${c}`),
];

export const commands: Command[] = [
  {
    id: 'help',
    aliases: ['help', '?', 'what can you do', 'commands'],
    description: 'Show what this thing can do',
    run: () => ({ kind: 'text', lines: HELP_INTRO }),
  },
  {
    id: 'about',
    aliases: ['about me', 'who is this', 'whoami', 'about', 'bio'],
    description: 'A short bio',
    suggested: true,
    run: () => ({
      kind: 'text',
      lines: [profile.statement, '', about.paragraphs[0]],
    }),
  },
  {
    id: 'projects',
    aliases: ['see projects', 'projects', 'work', 'ls work', 'portfolio'],
    description: 'List things I shipped',
    suggested: true,
    run: () => ({
      kind: 'goto',
      href: '#work',
      lines: [
        'Jumping to Work. Here is what is there:',
        ...work.projects.map(
          (p, i) =>
            `  ${i + 1}. ${p.title} (${p.year}) — type "open ${slugify(p.title)}" for one of these`
        ),
      ],
    }),
  },
  {
    id: 'open-project',
    aliases: ['open'],
    description: 'open <project> — jump to one project',
    run: args => {
      const key = slugify(args);
      const project = projectsBySlug.get(key);
      if (!project) {
        return {
          kind: 'text',
          lines: [
            `No project matches "${args.trim()}". Try one of:`,
            ...work.projects.map(p => `  ${slugify(p.title)}`),
          ],
        };
      }
      const lines = [`${project.title} — ${project.year}, ${project.role}`, project.blurb];
      return project.href
        ? { kind: 'link', href: project.href, lines }
        : { kind: 'goto', href: '#work', lines };
    },
  },
  {
    id: 'stack',
    aliases: ['skills', 'stack', 'what do you use', 'tech stack'],
    description: 'What I reach for',
    suggested: true,
    run: args => {
      const key = args.trim().toLowerCase();
      const group = key ? stackGroupsByLabel.get(key) : null;
      if (group) {
        return {
          kind: 'text',
          lines: [`${group.label}:`, ...group.items.map(i => `  ${i.name} — ${i.note}`)],
        };
      }
      return {
        kind: 'goto',
        href: '#stack',
        lines: [
          'Jumping to Stack. Groups: ' + stack.groups.map(g => g.label).join(', ') + '.',
          `Try "stack ${stack.groups[0].label.toLowerCase()}" for detail on one group.`,
        ],
      };
    },
  },
  {
    id: 'certs',
    aliases: ['certifications', 'certs', 'licenses'],
    description: 'What I went and got certified in',
    run: () => ({
      kind: 'goto',
      href: '#certifications',
      lines: [
        'Jumping to Certifications:',
        ...certifications.items.map(c => `  ${c.title} — ${c.issuer}`),
      ],
    }),
  },
  {
    id: 'log',
    aliases: ['log', 'changelog', 'timeline'],
    description: 'Talks, hackathons, and what came of them',
    run: () => {
      const recent = log.years[0]?.entries.slice(0, 3) ?? [];
      return {
        kind: 'goto',
        href: '#log',
        lines: [
          'Jumping to the Log. Most recent:',
          ...recent.map(entry => `  ${entry.date} — ${entry.title}`),
        ],
      };
    },
  },
  {
    id: 'proof',
    aliases: ['contributions', 'activity', 'shipped days', 'proof', 'streak'],
    description: 'See how consistently I show up',
    suggested: true,
    run: () => ({
      kind: 'goto',
      href: '#proof',
      lines: ['Jumping to Proof — real GitHub activity, not just claims.'],
    }),
  },
  {
    id: 'contact',
    aliases: ['say hi', 'contact', 'get in touch', 'hire me'],
    description: 'How to reach me',
    suggested: true,
    run: () => ({
      kind: 'goto',
      href: '#contact',
      lines: [contact.line, `Email: ${profile.email}`, `Or: ${profile.phone}`],
    }),
  },
  {
    id: 'email',
    aliases: ['email', 'mail'],
    description: 'Just the email address',
    run: () => ({ kind: 'text', lines: [profile.email] }),
  },
  {
    id: 'resume',
    aliases: ['resume', 'cv', 'résumé'],
    description: 'Open my résumé',
    run: () => ({
      kind: 'link',
      href: profile.resume,
      lines: ['Opening the résumé in a new tab.'],
    }),
  },
  {
    id: 'github',
    aliases: ['github', 'gh'],
    description: 'My GitHub profile',
    run: () => {
      const gh = profile.socials.find(s => s.label === 'GitHub');
      return gh
        ? { kind: 'link', href: gh.href, lines: [`Opening ${gh.href}`] }
        : { kind: 'text', lines: ['No GitHub link on file.'] };
    },
  },
  {
    id: 'theme',
    aliases: ['theme', 'blueprint mode', 'blueprint', 'normal mode'],
    description: 'Switch between Normal and Blueprint',
    suggested: true,
    run: args => {
      const a = args.trim().toLowerCase();
      if (a.includes('normal') || a.includes('paper') || a.includes('light')) {
        return { kind: 'theme', next: 'paper', lines: ['Back to Normal.'] };
      }
      if (a.includes('blueprint') || a.includes('dark')) {
        return { kind: 'theme', next: 'blueprint', lines: ['Welcome to Blueprint.'] };
      }
      return { kind: 'theme', next: 'toggle', lines: ['Flipping the switch.'] };
    },
  },
  {
    id: 'sound',
    aliases: ['sound', 'sound on', 'sound off'],
    description: 'Turn UI sound on or off',
    run: args => {
      const a = args.trim().toLowerCase();
      if (a === 'off' || a.includes('off')) {
        return { kind: 'sound', next: 'off', lines: ['Sound off.'] };
      }
      if (a === 'on' || a.includes('on')) {
        return { kind: 'sound', next: 'on', lines: ['Sound on.'] };
      }
      return { kind: 'sound', next: 'toggle', lines: ['Flipping sound.'] };
    },
  },
  {
    id: 'music',
    aliases: ['music', 'music on', 'music off', 'radio'],
    description: 'Turn the background radio on or off',
    run: args => {
      const a = args.trim().toLowerCase();
      if (a === 'off' || a.includes('off')) {
        return { kind: 'music', next: 'off', lines: ['Music off.'] };
      }
      if (a === 'on' || a.includes('on')) {
        return { kind: 'music', next: 'on', lines: ['Music on.'] };
      }
      return { kind: 'music', next: 'toggle', lines: ['Flipping the radio.'] };
    },
  },
  // Separate entries, not aliases on `sound` above: run() only sees leftover
  // argument text, not which alias matched, so "mute" would have no way to
  // tell itself apart from a bare "sound" and would wrongly fall through to
  // toggle instead of always meaning off.
  {
    id: 'mute',
    aliases: ['mute'],
    description: 'Turn sound off',
    run: () => ({ kind: 'sound', next: 'off', lines: ['Sound off.'] }),
  },
  {
    id: 'unmute',
    aliases: ['unmute'],
    description: 'Turn sound on',
    run: () => ({ kind: 'sound', next: 'on', lines: ['Sound on.'] }),
  },
  {
    id: 'clear',
    aliases: ['clear', 'cls'],
    description: 'Clear this screen',
    run: () => ({ kind: 'clear' }),
  },
  {
    id: 'exit',
    aliases: ['exit', 'close', 'quit', 'bye'],
    description: 'Close this',
    run: () => ({ kind: 'close', lines: ['See you around.'] }),
  },
  // A few things worth finding by accident.
  {
    id: 'sudo',
    aliases: ['sudo'],
    description: '',
    run: () => ({ kind: 'text', lines: ['Nice try. You do not need root — just say hi.'] }),
  },
  {
    id: 'uptime',
    aliases: ['uptime'],
    description: '',
    run: () => {
      const sec = Math.max(0, Math.round(performance.now() / 1000));
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return { kind: 'text', lines: [`This tab has been open ${m}m ${s}s.`] };
    },
  },
];

const suggestedCommands = commands.filter(c => c.suggested);

function normalize(input: string) {
  return input.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** 3 = exact phrase, 2 = one is a prefix of the other, 1 = loose overlap,
 * 0 = no relation. The loose tier is permissive on purpose for the live
 * suggestion list (it should help as you type) but resolveCommand below
 * refuses to act on it alone — a score of 1 is "maybe," not "run this." */
function scoreAlias(alias: string, q: string): number {
  if (alias === q) return 3;
  if (alias.startsWith(q) || q.startsWith(alias)) return 2;
  if (alias.includes(q) || q.includes(alias)) return 1;
  return 0;
}

function rank(query: string) {
  const q = normalize(query);
  return commands
    .filter(c => c.description)
    .map(c => ({ c, best: Math.max(...c.aliases.map(a => scoreAlias(a.toLowerCase(), q))) }))
    .filter(s => s.best > 0)
    .sort((a, b) => b.best - a.best);
}

/** Everything a visitor might reasonably type, flattened for the live
 * suggestion list — plain phrasing and terse aliases side by side. */
export function suggestions(query: string, limit = 6): Command[] {
  const q = normalize(query);
  if (!q) return suggestedCommands;
  return rank(q)
    .slice(0, limit)
    .map(s => s.c);
}

/** Resolves free-typed input to a command + its remaining argument text.
 * Returns null rather than guessing when nothing clears a real bar — an
 * honest "not sure what that means" beats confidently running the wrong
 * command on a near-miss. */
export function resolveCommand(input: string): { command: Command; args: string } | null {
  const q = normalize(input);
  if (!q) return null;

  // Exact phrase match first — "about me" must win outright, not fall
  // through to word-by-word parsing.
  for (const c of commands) {
    if (c.aliases.some(a => a.toLowerCase() === q)) return { command: c, args: '' };
  }

  // Then verb + argument — "open tonmate", "stack graphics".
  const [verb, ...rest] = q.split(' ');
  for (const c of commands) {
    if (c.aliases.some(a => a.toLowerCase() === verb)) {
      return { command: c, args: rest.join(' ') };
    }
  }

  // Last resort: only a prefix-level match (score >= 2) is confident enough
  // to run outright; a loose substring overlap (score 1) stays a suggestion,
  // not an action.
  const [top] = rank(q);
  return top && top.best >= 2 ? { command: top.c, args: '' } : null;
}

export function navLabelForHref(href: string): string {
  return nav.find(item => item.href === href)?.label ?? href;
}
