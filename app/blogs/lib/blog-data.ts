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
  {
    slug: 'one-nextjs-app-many-subdomains',
    title: 'One Next.js app, several subdomains',
    date: '2026-11-07',
    excerpt:
      'How this blog is served from the same Next.js deployment as my portfolio, using host-based rewrites, and what to check before trusting the setup.',
    tags: ['nextjs', 'vercel', 'architecture'],
    content: `This blog lives at \`blogs.yashsiwach.in\`, but it is not a separate project. It is a folder, \`app/blogs\`, inside the same Next.js app and the same Vercel deployment as my portfolio. A request for the blog host is rewritten onto that folder, and nothing else about the app changes.

I picked this over a second project for the usual lazy reasons: one build, one pipeline, one set of design tokens, and nothing to keep in sync. The cost is that the blog and the portfolio ship together, which I am fine with.

## The routing

Next.js rewrites can match on the host header with \`has\`. The whole setup is a few lines in \`next.config.js\`:

\`\`\`js
const BLOGS_HOST = 'blogs.yashsiwach.in';
const onBlogsHost = [{ type: 'host', value: BLOGS_HOST }];

module.exports = {
  async rewrites() {
    return {
      // Before the filesystem: '/' is also the portfolio's home page.
      beforeFiles: [{ source: '/', has: onBlogsHost, destination: '/blogs' }],
      // After the filesystem, so files in public/ still win.
      afterFiles: [{ source: '/:slug', has: onBlogsHost, destination: '/blogs/:slug' }],
    };
  },
};
\`\`\`

Order matters here. \`/\` already exists as a page, so the rewrite has to run before the filesystem is consulted. \`/:slug\` would swallow \`/favicon.ico\` and \`/robots.txt\`, so it runs after, once real files have had their turn.

## Keep the prefix private

Rewrites are invisible, which means \`/blogs/some-post\` still works on every host unless you say otherwise. I redirect it both ways:

\`\`\`js
async redirects() {
  return [
    // On the blog host the prefix is redundant.
    { source: '/blogs', has: onBlogsHost, destination: '/', permanent: true },
    { source: '/blogs/:path*', has: onBlogsHost, destination: '/:path*', permanent: true },
    // Everywhere else the folder should not exist.
    { source: '/blogs', missing: onBlogsHost, destination: '/', permanent: true },
    { source: '/blogs/:path*', missing: onBlogsHost, destination: '/', permanent: true },
  ];
},
\`\`\`

## Give each host its own metadata

Relative canonical and Open Graph URLs resolve against \`metadataBase\`, which my root layout sets to the portfolio. A nested layout overrides it for the whole subtree:

\`\`\`ts
export const metadata: Metadata = { metadataBase: new URL('https://blogs.yashsiwach.in') };
\`\`\`

Without it, every canonical on the blog would point at the other site.

## Testing without the real domain

\`localhost\` and preview URLs never match the host, so the rewrites do not fire. Two ways around that:

- Against a running build, send the header yourself: \`curl -H "Host: blogs.yashsiwach.in" localhost:3000/\`.
- In a browser, temporarily change the host constant to \`blogs.localhost\`. Chrome resolves \`*.localhost\` to your own machine, so \`http://blogs.localhost:3000\` reaches your dev server.

## Things I would check again

- **Add the domain after the code is deployed, not before.** Until the rewrite is live, the new host happily serves the main site's home page.
- **Give the new host its own \`robots.txt\` and \`sitemap.xml\`,** and exclude the folder from the main sitemap. A sitemap on one host cannot list URLs on another.
- **Test the request, not the file.** Anything in \`public/\` that shares the redirected prefix gets caught by the redirect, which is a story for another post.

If the domain's DNS is already on Vercel, adding the subdomain to the project is the last step.`,
  },
  {
    slug: 'the-redirect-that-404d-my-blog-images',
    title: 'The redirect that quietly 404’d my blog images',
    date: '2026-11-07',
    excerpt:
      'A file that exists is not a URL that works. How a host redirect swallowed my assets, and the test I added so it cannot happen again.',
    tags: ['nextjs', 'debugging', 'testing'],
    content: `I added a video and five screenshots to a post, put them in \`public/blogs/promise-keeper/\`, and the page showed a dark empty box where the video should be.

The files were there. A test that asks "does this file exist" would have passed. The bug was in the URL.

## What happened

This blog is served on its own host (see the previous post on subdomains). On that host a redirect removes the \`/blogs\` prefix, so \`blogs.yashsiwach.in/blogs/some-post\` lands on \`/some-post\`. For pages, that rule is correct.

My assets lived at \`/blogs/promise-keeper/poster.jpg\`. The browser asked for exactly that URL, the redirect matched \`/blogs/:path*\`, and it sent the request to \`/promise-keeper/poster.jpg\`. That path does not exist, and the only rewrite on the host matches a single segment, so the request ended in a 404.

The order is what makes it quiet. Next.js applies redirects before it looks at the filesystem, so a rule written for pages also catches anything under \`public/\` that happens to share the prefix. Nothing errors at build time, and nothing looks wrong in the editor.

## How I found it

The page showed a spinner and nothing else, so instead of guessing I asked the page what it had requested:

\`\`\`js
const video = document.querySelector('video');
fetch(video.poster).then(response => response.status); // 404
\`\`\`

The poster, the video and the captions all came back 404 while the files sat on disk. Following the redirect by hand made the reason obvious.

## The fix

Move the assets out of the redirected prefix, to \`public/blog-assets/\`, and update the links. Nothing else changed.

## The guard

The fix is one move. The lasting part is a check. A test I already had verified that every local link in every post pointed at a real file. I added one more assertion that rejects the prefix the host redirects:

\`\`\`js
assert.ok(!link.startsWith('/blogs/'), \`\${post.slug}: \${link} is under the /blogs prefix\`);
assert.ok(existsSync(publicDir + link), \`\${post.slug}: missing public\${link}\`);
\`\`\`

Now a dead link and a link the redirect would eat both fail before anything ships.

## The general version

"The file exists" and "the URL works" are different claims. Whenever a rewrite, a redirect or a base path sits in front of static files, test the request, not the file.`,
  },
  {
    slug: 'testing-typescript-on-node-20-without-a-runner',
    title: 'Testing a TypeScript module on Node 20 without adding a runner',
    date: '2026-11-07',
    excerpt:
      'No test runner, Node 20 cannot run .ts, and I wanted one check that fails when my data is wrong. The compiler already in node_modules was enough.',
    tags: ['testing', 'typescript', 'node'],
    content: `This blog's posts live in one TypeScript file: an array of objects and a few small helpers. I wanted a test that fails if I publish a post with a bad slug or a dead image link. The repository has no test runner, and Node 20 cannot execute \`.ts\` files directly.

There were three ways out. I could add Vitest, Jest or \`tsx\`, which is a dependency for about forty lines of checks. I could upgrade Node, since 22.6 and later have \`--experimental-strip-types\`. Or I could use something already installed. \`typescript\` is a dev dependency of any Next.js project, and \`transpileModule\` turns a module into JavaScript in memory.

## The trick

\`\`\`js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('./blog-data.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { getBlogPosts } = await import(
  'data:text/javascript;base64,' + Buffer.from(outputText).toString('base64')
);
\`\`\`

Run it with \`node --test app/blogs/lib\`. No config, no install, no build step.

## The one constraint

The module under test cannot import anything. A \`data:\` URL has no filesystem to resolve relative paths against, so an \`import './other'\` inside it fails. I kept \`blog-data.ts\` free of imports and left a comment saying why, so nobody tidies one in later.

## What to test

Examples such as "this slug exists" go stale. Invariants do not. The checks that earned their place:

- posts are sorted newest first;
- slugs are unique and URL-safe;
- every local image, video and caption link points to a file that exists;
- no link is relative, because relative links break on a post URL;
- every heading gets a unique anchor.

Each one loops over whatever data exists today, so adding a post adds coverage without touching the test.

## When not to do this

\`transpileModule\` strips types and checks nothing, so type errors are still the job of \`next build\`. If the module needs imports, JSX or mocks, install a real runner. This approach is for the case where a plain function and a data file are all you need to check.`,
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
