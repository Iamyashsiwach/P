// No imports on purpose: blog-data.test.mjs transpiles this file on its own.

export interface BlogPost {
  slug: string;
  title: string;
  /** ISO date (YYYY-MM-DD); sorts correctly as a plain string. */
  date: string;
  excerpt: string;
  tags: string[];
  /** Markdown. Raw HTML is not rendered. Escape backticks as \` inside the template literal. */
  content: string;
  /** Shown above the text. Files live under public/. */
  video?: { src: string; poster: string; captions: string; caption: string };
}

// To publish: add an entry. Slugs are the URL (blogs.yashsiwach.in/<slug>).
// Local images go in public/ and are linked by absolute path; the test fails on a dead link.
const posts: BlogPost[] = [
  {
    slug: 'promisekeeper-switch',
    title: 'From “done” to signed off: building PromiseKeeper with Switch',
    date: '2026-11-07',
    excerpt:
      'An agent can finish a task and still get it wrong. A Switch room where agents prepare an export, a person signs off, and a gate blocks stale drafts.',
    tags: ['agents', 'switch', 'workflows'],
    video: {
      src: '/blog-assets/promise-keeper/promise-keeper-live-demo.mp4',
      poster: '/blog-assets/promise-keeper/poster.jpg',
      captions: '/blog-assets/promise-keeper/captions.vtt',
      caption:
        'The 1:36 Discord run: request, failed check, independent review, stale-draft block.',
    },
    content: `An AI agent can finish a task and still produce the wrong result. It might include
an extra column in a customer export, miss a requirement, or keep working from an
approval that no longer applies.

PromiseKeeper is a team workflow for catching those problems before work moves
forward. It brings a requester, three specialist agents, and a designated data owner
into one Switch room. The agents prepare and check a customer export; a person
reviews the verified file; and a release gate blocks a stale draft if the request
changes.

The example uses two distinct human responsibilities—requesting and approving—to
keep sign-off independent. It is not limited to two participants; teammates can join
the room and follow or contribute to the work.

The screenshots below come from the actual Discord run. The demo uses three
synthetic sample orders and does not send customer messages.

## Why put this workflow in team chat?

When a request, an agent's work, and a person's approval live in different places,
it is easy to lose track of what was agreed or which version was reviewed. Switch
gives people and agents a shared room for the request, handoffs, and current context.

For this workflow, the Switch room connects three role-based agents:

- **Coordinator:** confirms the requested columns and rows, records the agreement,
  and routes work to the right agent.
- **Builder:** creates the CSV, fixes problems found by the checks, and produces a
  verified receipt for the current file.
- **Sender:** checks the approved receipt before preparing a message draft and
  rechecks it if the scope changes.

The designated data owner reviews the actual file and approves it from their own
Discord account. The requester cannot approve their own request.

![Requester and data owner confirming the workflow in their shared Discord room.](/blog-assets/promise-keeper/tutorial-01-scope.jpg)

## Catch the first version's privacy mistake

The request is specific: export all three sample orders with \`order_number\` and
\`total\`, in that order. Keep exactly three data rows. Never include \`email\` or
\`internal_notes\`.

The rehearsal begins with an intentionally overbroad exporter. Its first CSV
contains those extra fields. The coordinator checks the artifact and flags the
problem before review. The error points to the row and column without echoing the
matched email value.

That first failure is part of the story: a task can report success and still produce
an unsafe file. PromiseKeeper checks the result against the request instead of
treating completion as proof of correctness.

![The first check catches extra fields and email before independent review.](/blog-assets/promise-keeper/tutorial-02-privacy-check.jpg)

## Give every reviewed file its own receipt

The builder fixes the exporter and generates the CSV again. The checker verifies
the ordered columns, row count and shape, configured deny patterns, and file hash.
The passing result receives a versioned receipt. In the recorded run, the receipt is
\`1:2\`; when you run the demo, use the receipt shown by your own run.

The designated data owner opens the actual CSV, checks its three rows and columns,
then approves that receipt from their own account. The requester tries to approve it
first, and the workflow refuses. The coordinator records the reviewer's observed
Discord identity and message reference with the verified file.

![The corrected three-row export passes verification and receives a reviewable receipt.](/blog-assets/promise-keeper/tutorial-03-receipt.jpg)

![The requester cannot self-approve; the designated data owner approves the file.](/blog-assets/promise-keeper/tutorial-04-approval.jpg)

## Make a changed request start a fresh review

After approval, the requester changes the scope and asks to add \`email\`. The
workflow records a new revision and clears the previous verification and approval.
The original approval remains in the history, but it no longer authorizes the
changed request.

The email deny rule remains active. The sender checks the new revision, receives a
blocked result, marks its earlier local draft as retracted, and posts a visible
retraction notice in the room. The workflow does not silently reuse a review of the
old file for new requirements.

![A changed request clears approval and the sender retracts its stale draft.](/blog-assets/promise-keeper/tutorial-05-retraction.jpg)

## What Switch handles—and what the code checks

Switch is the coordination layer: it connects the requester, reviewer and agents in
the same room, carries handoffs, and keeps shared instructions and workflow context
visible. A reusable room template defines the three agent roles and their shared
room.

PromiseKeeper's Python code performs the deterministic file checks and maintains a
local receipt ledger. The sender's gate allows a draft only when the approved
receipt, current request and file still match. This keeps collaboration in chat
while making the release decision inspectable.

The demo is a trusted-workstation implementation. The coordinator passes the
observed chat author and message reference to a local gate; the local SQLite ledger
is not tamper-resistant. The sender posts a retraction notice, while the earlier
chat message remains visible. A production deployment can extend the pattern with
authenticated identity, protected audit storage and the organization's delivery
transport.

## Run the workflow yourself

You need Switch Console, a signed-in coding provider, Python 3.11 or newer, and a
Discord or Slack workspace. The project uses the Python standard library.

1. Clone the [PromiseKeeper repository](https://github.com/Iamyashsiwach/promise-keeper)
   and move into the project directory.
2. Prepare a new rehearsal copy. This copy contains the intentionally overbroad
   exporter so the initial check has a real issue to catch:

   \`\`\`sh
   python3 scripts/prepare_rehearsal.py ../promise-rehearsal
   \`\`\`

3. In Switch Console, import \`switch-room.template.yaml\`. Connect your Discord or
   Slack bridge, choose the installed agent provider, and set the requester,
   designated data owner, and the same absolute rehearsal folder for all three
   agents. Then create the agents and room.
4. Confirm both people joined and the agents can access the shared folder. Follow
   the ordered messages in [\`DEMO.md\`](https://github.com/Iamyashsiwach/promise-keeper/blob/main/DEMO.md). The designated data owner should
   inspect the generated CSV before approving its receipt.
5. To run the project's checks in the source checkout, use:

   \`\`\`sh
   python3 -m unittest -v
   \`\`\`

The [README](https://github.com/Iamyashsiwach/promise-keeper/blob/main/README.md) has the architecture and quick setup. The
[1:36 Discord walkthrough](/blog-assets/promise-keeper/promise-keeper-live-demo.mp4) shows the request, failed
check, independent review, and stale-draft block.

## What I learned

The useful part of a multi-agent workflow is not just splitting work among agents.
It is making the handoff between agent output and human review explicit. A
versioned receipt gives the reviewer a concrete file to inspect, and clearing that
receipt when the request changes prevents the team from relying on outdated sign-off.

I also used Wispr Flow to dictate project-writing prompts and draft the article.
The [Flow Highlights card](/blog-assets/promise-keeper/wispr-insights.png) records 107 dictated words at
an average of 107 words per minute. I used typed and pasted commands too; the entire
project was not voice-built.`,
  },
  {
    slug: 'hello-world',
    title: 'Hello, world',
    date: '2026-11-07',
    excerpt: 'What this is, and what to expect.',
    tags: ['meta'],
    content: `I write things down once I have finished figuring them out, mostly so I stop figuring them out again.

Expect notes on building for the web (Next.js, Three.js, the occasional shader), cloud and infrastructure on AWS, and whatever I am learning at work. Every so often something with no business being a hobby, like archery, will sneak in.

Posts show up here when they are done, not before.`,
  },
];

export function getBlogPosts(): BlogPost[] {
  return [...posts].sort((a, b) => b.date.localeCompare(a.date));
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return posts.find(post => post.slug === slug);
}

/** '2026-11-07' -> '7 Nov 2026'. UTC so the date never shifts with the reader's timezone. */
export function formatPostDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
