# yashsiwach.in

My portfolio. Next.js App Router, TypeScript, Tailwind, GSAP, and a WebGL hero.

```bash
npm install
npm run dev        # localhost:3000
```

`npm run build && npm start` is worth running before you trust anything about
scrolling — Lenis and ScrollTrigger behave differently in a production build.

## Layout

```
app/
  sections/    Hero, About, Log, Stack, Work, Contact — the page, in order
  components/
    chrome/    Nav, Cursor, ScrollProgress, HUD, SectionHeading
    motion/    SmoothScroll, Reveal, Magnetic, Marquee
    webgl/     Scene, TraceField, SceneGate, useWebGLGate
    icons/     the three brand marks lucide doesn't ship
  hooks/       useInView, usePrefersReducedMotion
  lib/
    content.ts every word on the site
    motion.ts  eases, durations, GSAP plugin registration
  book/        a separate long-form writing section
```

All copy lives in `app/lib/content.ts`. Adding a project is appending an object
to `work.projects` and dropping an image in `public/` — the Work list absorbs
any number of entries without a layout change.

## The hero

`app/components/webgl/TraceField.tsx` draws a request moving through a
fullstack system: Client → Edge → API → Queue → DB, five nodes joined by
CatmullRom curves with 40,000 points travelling along them.

Each curve is baked once into a texture of sampled positions, so the vertex
shader gets a particle's position from a single texture fetch. That means one
draw call, no per-frame CPU work, and no geometry updates.

Two layouts are baked — an orbital arrangement and a flat pipeline — and
`uMorph` lerps between them as you scroll, so the shape resolves into a
readable architecture diagram by the time you reach About. `uScatter` runs
1 → 0 on load, condensing the cloud onto the curves.

The accent colour marks arrival at a node, not speed: the curves are sampled by
arc length, so speed along one is constant and can't drive colour.

## Fallbacks

`useWebGLGate` decides whether a device gets the scene at all. It needs a
viewport ≥768px, 4+ cores, 4GB+ memory, a real WebGL2 context, and no
save-data — and it is off entirely under `prefers-reduced-motion`. The scene is
behind `next/dynamic`, so the ~174KB of three/R3F/drei is a chunk that phones
and reduced-motion users never request.

Everything else degrades the same way. Motion is authored so the end state is
what's in the markup and GSAP animates _from_ an offset — if a script fails, the
page still reads. Text is never hidden by CSS awaiting a reveal.

## Things worth knowing before you change something

- **Never set `scroll-behavior: smooth` while Lenis is running.** Lenis writes a
  scroll position every frame, CSS animates toward it, and the resulting scroll
  event feeds back into Lenis until the page locks up. `globals.css` scopes it
  off via the `lenis` class Lenis puts on `<html>`.
- **Don't animate a `repeat: -1` tween's `timeScale` through zero.** At zero its
  total duration is unbounded and the main thread hangs. `Marquee` keeps
  timeScale positive for speed and flips direction with `reversed()`.
- **Don't create tweens inside a ScrollTrigger `onUpdate`.** That's a tween per
  frame. Animate on state change, or use `quickTo`.
- One rAF for the whole site: Lenis is driven from `gsap.ticker`, and there is
  one shared WebGL canvas rather than one per section.
- No animated SVG gradients and no animated `filter: blur()`. An earlier version
  of this site animated 51 SVG gradients at once and crashed Firefox.

## Deploy

Vercel, on push to `main`. `next-sitemap` regenerates `sitemap.xml` and
`robots.txt` after each build; those are generated, not committed.
