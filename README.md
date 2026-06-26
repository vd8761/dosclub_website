# Descience Open Source Club — Website

A clean, animation-rich marketing site for the **Descience Open Source Club**.
Light theme on a green palette built around the logo green (`#65AD53`), with
GSAP-powered parallax and scroll-driven text effects.

## Tech stack

| Concern        | Choice                                  |
| -------------- | --------------------------------------- |
| Framework      | Next.js 16 (App Router) + React 19      |
| Styling        | Tailwind CSS v4 (CSS-first `@theme`)    |
| Animation      | GSAP 3 + ScrollTrigger                  |
| Smooth scroll  | Lenis (synced to the GSAP ticker)       |
| Fonts          | Space Grotesk (display) + JetBrains Mono|
| Deploy target  | Vercel (zero-config)                    |

## Highlights

- **Interactive ASCII hero** (`AsciiField`) — a canvas field of code/open-source glyphs that flows with scroll position + velocity and reveals a spotlight of characters under the cursor.
- **"Commit timeline" header** — each section is a node on a git-style branch line; the active section lights up (IntersectionObserver), with a live pulsing CTA and a scroll-progress branch line. No generic top bar.
- **Scroll-driven text effects:**
  - `RevealText` — masked word/character reveals, optionally scrubbed to scroll (section headings).
  - `ScrollHighlightText` — read-along word-by-word highlight, powering the **Manifesto** section.
  - **Velocity-reactive marquee** that skews with scroll speed.
- **Horizontal pinned "Domains"** section on desktop that gracefully stacks vertically on mobile.
- **Scroll-drawn progress rail** in the Journey timeline and a **FAQ accordion**.
- **Real partner logos** (MBCIE, PERI, Touchmark) extracted from the design, in `public/partners/`.
- **Animated stat counters**, magnetic buttons and a desktop custom cursor.
- Fully **responsive** with a mobile slide-in menu, and respects `prefers-reduced-motion`.

## Theming

All colors are CSS variables in `src/app/globals.css` under `@theme`. To shift the
palette, edit the green family tokens (`--color-green`, `--color-green-dark`,
`--color-forest`, `--color-moss`, `--color-leaf`) and the surface tokens
(`--color-ink`, `--color-fg`, etc.). The legacy `--color-violet/cyan/lime/pink`
names are kept as aliases onto the green family so utility classes keep working.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Editing content

All copy, events, team members and partners live in a single file:

```
src/data/site.ts
```

Update events, stats, team and partner lists there — every section reads from it.
The `stats` numbers (members / workshops) are sensible placeholders — swap in real figures.

## Project structure

```
src/
  app/            layout, global styles (design tokens), page composition, favicon
  components/     section components (Hero, Domains, Journey, …) + UI primitives
  data/site.ts    all editable content
  lib/gsap.ts     GSAP plugin registration
```

## Deploying to Vercel

This is a standard Next.js app — Vercel detects it automatically.

1. Push the repo to GitHub.
2. Import it in the Vercel dashboard (or run `vercel` with the CLI).
3. No environment variables or special config required.

The contact form opens the visitor's email client via `mailto:`. To collect
submissions server-side instead, wire the form in `src/components/Join.tsx` to a
Vercel Function or a form provider.
