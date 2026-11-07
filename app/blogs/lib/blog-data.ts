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
  /** Link-preview image (og:image), 16:9. Lives under public/. */
  image?: string;
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
      'A first-timer’s walkthrough: build a Switch room where agents prepare an export, a person signs off, and a release gate blocks stale drafts. From install to demo.',
    tags: ['switch', 'agents', 'tutorial', 'hackathon'],
    image: '/blog-assets/promise-keeper/poster.jpg',
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

I built it for the Flip the Switch hackathon, and this is the walkthrough I wanted
when I started: what Switch is, how the pieces fit, how I set it up, and where I got
stuck. If you have never opened Switch, you can follow it from the first install.

The example uses two distinct human responsibilities—requesting and approving—to
keep sign-off independent. It is not limited to two participants; teammates can join
the room and follow or contribute to the work. The screenshots below come from the
actual Discord run. The demo uses three synthetic sample orders and does not send
customer messages.

## Switch in 60 seconds

If you have never used Switch, this is the vocabulary the rest of the post relies on.

- **Room:** the place where people and agents work together. Rooms live in your
  messaging app (Slack, Microsoft Teams, Discord or Telegram), so the request, the
  handoffs and the approvals sit in the same conversation as everyone else.
- **Agent:** an AI coding agent that does work in the room. Switch works with Claude
  Code, Codex, Antigravity, Cursor and OpenCode, and you need an account with the one
  you choose. You address an agent with an @mention, and agents can @mention each
  other.
- **Switch Console:** the desktop app you use to set Switch up and run your agents.
- **Room instructions:** written once under the room's Configuration. Every agent
  reads them when it joins.
- **Room document:** a document stored on the Switch server for shared context.
  Agents use it; people can't open it from the chat app, and only the agent that
  created a document can change it. I treat each one as that agent's notebook and keep
  everything people need to see in the chat itself.
- **Template:** a saved room setup with blanks. One template can create agents, the
  room, its documents and a first message. Whoever runs it fills in the blanks and
  selects **Create all**.
- **switch-buddy:** the built-in agent that helps you create agents and rooms and
  connect your chat app.

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

## How each step maps to Switch

If you are deciding whether Switch fits your own workflow, this is the part to read.
Every step of the story leans on a specific Switch capability:

- **The requester asks, and the coordinator confirms the exact columns and rows.**
  A shared room, room instructions, and the real message author and reference.
- **The coordinator hands the failed check to the builder.** Agent-to-agent
  @mentions in the same room.
- **Scope, policy and progress stay in one place.** Shared room documents:
  \`signoff-rule\`, \`promise-decisions\` and \`export-task\`.
- **The requester is refused; the data owner signs the passing receipt.** Direct
  human messages in the room. The coordinator records the actual author and message
  reference, and local code checks them.
- **The sender drafts only against the data owner's current approval.** A handoff to
  a third agent, which runs the Python gate.
- **The requester changes the scope; the sender retracts its draft.** A new
  agreement in the room, a revision that invalidates the old approval, and a visible
  retraction notice from the sender.
- **A new team installs the whole workflow.** One parameterized template defines all
  three agents, the room, its first document and the kickoff.

Here is the whole system in one picture. The middle box is the Switch room; the right
column is plain local code that the agents call.

![How the pieces fit: the requester and data owner talk to the coordinator in one Switch room with the builder and sender. Local code checks the CSV, keeps the receipt ledger and runs the release gate.](/blog-assets/promise-keeper/architecture.svg)

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
available to every agent in the room. A reusable room template defines the three
agent roles and their shared room.

PromiseKeeper's Python code performs the deterministic file checks and maintains a
local receipt ledger. The sender's gate allows a draft only when the approved
receipt, current request and file still match: it exits 0 in that case, and exits 3
otherwise, which is the signal for the sender to refuse and retract. This keeps
collaboration in chat while making the release decision inspectable.

The demo is a trusted-workstation implementation. The coordinator passes the
observed chat author and message reference to a local gate; the local SQLite ledger
is not tamper-resistant. The sender posts a retraction notice, while the earlier
chat message remains visible. A production deployment can extend the pattern with
authenticated identity, protected audit storage and the organization's delivery
transport.

## Set it up yourself, from zero

Allow extra time for installing Switch Console and connecting a chat server; that is
where most of the time goes. You need a coding agent you are signed in to, Python
3.11 or newer, and a Discord or Slack workspace. The project itself uses only the
Python standard library.

1. **Install Switch Console** ([install guide](https://docs.switchagents.ai/switch-rooms/getting-started/install-switch-console)).
   On macOS, open the \`.dmg\` and drag Switch Console into Applications; the Windows
   and Linux builds are in early access. Open it and select **Get started**.
2. **Run Switch on this computer.** Choose **On this computer**, select **Start**,
   wait for "Local server is running", then continue. Pick the agent that powers
   switch-buddy. On a local server, switch-buddy only answers while Console is open.
3. **Connect your chat app** ([getting started](https://docs.switchagents.ai/switch-rooms/getting-started/index))
   and invite a second person. One of you requests, the other signs off, and each
   needs their own real account.
4. **Clone the [PromiseKeeper repository](https://github.com/Iamyashsiwach/promise-keeper)**
   and prepare a clean rehearsal copy. The copy contains the intentionally overbroad
   exporter, so the first check has a real issue to catch:

   \`\`\`sh
   python3 scripts/prepare_rehearsal.py ../promise-rehearsal
   \`\`\`

5. **Import the template.** In Console, open **Templates**, select **Import
   template**, paste \`switch-room.template.yaml\`, save it, then select **Use
   template**. Fill in a unique team prefix, your connected bridge, the actual
   requester and data owner usernames, an online machine, an installed provider, and
   the same absolute rehearsal folder for all three agents. Select **Create all**.
   Importing only saves the template; **Create all** is what creates the three agents
   and the room.
6. **Check before you start.** Both people joined, all three agents can read the
   folder, the coordinator can see real message authors and references, and it can
   create its room documents. If anything is missing, fix the setup first.
7. **Run the story.** Follow the ordered messages in
   [\`DEMO.md\`](https://github.com/Iamyashsiwach/promise-keeper/blob/main/DEMO.md). The
   data owner should open the generated CSV before approving its receipt. To run the
   project's own checks in the source checkout:

   \`\`\`sh
   python3 -m unittest -v
   \`\`\`

The template is where most of the Switch-specific work lives. This is an excerpt of
its parameters and the start of the first agent; the full file is in the repository.

\`\`\`yaml
version: 1
params:
  team:
    type: string
    default: promise
  directory:
    type: directory
    description: Absolute path to ONE prepared rehearsal checkout shared by all three agents
    required: true
  bridge:
    type: bridge
    default: [$first]
  requester:
    type: user
    description: Actual requester username on the selected messaging app
    required: true
  approver:
    type: user
    description: A DIFFERENT actual data owner username on the same app
    required: true
agents:
  - name: "{team}-coordinator"
    description: "PromiseKeeper coordinator"
    addressing: anyone
    directory: "{directory}"
    instructions: |
      You are {team}-coordinator in a Switch team room. Read README.md and DEMO.md.
      ...
\`\`\`

A field replaces its value everywhere it appears, including inside the agents'
instructions. That is how one file becomes three agents that all share one folder.

### Where first-timers get stuck

- **Nothing exists until you select Create all.** Importing a template only saves it.
- **Templates that create agents have requirements.** Agent management must be turned
  on for the server, and the machine each agent runs on must be online with its
  provider installed and signed in.
- **If a run stops partway,** select **Retry remaining steps**. Agents that already
  exist are not created again.
- **Point every agent at the same absolute folder,** so they all see the same CSV and
  ledger.
- **Use real usernames and two separate accounts.** A name typed into a message proves
  nothing, which is why the coordinator uses the actual message author and reference.
- **Verifying creates a new receipt.** Verification took the receipt from \`1:1\` to
  \`1:2\`. Verifying again after approval would replace the approved receipt, so the
  coordinator reads the status instead.
- **Room documents are notebooks for agents.** People can't open them from the chat
  app, so anything a person needs to see should also be said in the room.

## What I learned

The useful part of a multi-agent workflow is not just splitting work among agents.
It is making the handoff between agent output and human review explicit. A
versioned receipt gives the reviewer a concrete file to inspect, and clearing that
receipt when the request changes prevents the team from relying on outdated sign-off.

Three things I would tell another first-timer:

- **Put identity in code, not in the prompt.** The coordinator's instructions say to
  never accept "I am the data owner" from a message body. The gate checks the real
  author and message reference instead.
- **Tell agents when to stop.** Every agent is instructed to stop and report when a
  tool, file or identity is missing, instead of inventing a successful run.
- **A passing check is not a finished review.** The first export reported success and
  was still unsafe. The review that mattered was a person opening the actual file.

I also used Wispr Flow to dictate project-writing prompts and draft the article.
The [Flow Highlights card](/blog-assets/promise-keeper/wispr-insights.png) records 107 dictated words at
an average of 107 words per minute. I used typed and pasted commands too; the entire
project was not voice-built.

## Where to read more

- The [1:36 Discord walkthrough](/blog-assets/promise-keeper/promise-keeper-live-demo.mp4) shows the request, failed check, independent review, and stale-draft block.
- The [README](https://github.com/Iamyashsiwach/promise-keeper/blob/main/README.md) has the architecture and quick setup.
- Switch docs: [install Switch Console](https://docs.switchagents.ai/switch-rooms/getting-started/install-switch-console), [getting started](https://docs.switchagents.ai/switch-rooms/getting-started/index), [room templates](https://docs.switchagents.ai/switch-rooms/administer/room-templates) and [shared context](https://docs.switchagents.ai/switch-rooms/using/shared-context).`,
  },
];

export function getBlogPosts(): BlogPost[] {
  return [...posts].sort((a, b) => b.date.localeCompare(a.date));
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return posts.find(post => post.slug === slug);
}

/** 'Switch in 60 seconds' -> 'switch-in-60-seconds'. Anchors and the table of contents must agree. */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
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
