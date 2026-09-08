# Afin Atsal · Portfolio (vanilla JS + Vite + GSAP)

Personal portfolio of Muhammad Afin Atsal (AI/ML Engineer), built with plain
JavaScript, Vite and GSAP.

> **Design note.** The site structure, art direction and interaction language
> started as a study ("slicing") of [bouayaben.com](https://bouayaben.com/) by
> Mehdi Bouayaben, which itself uses GSAP. The layout, type scale, motion
> system and abstract diagram vocabulary follow that study; all copy, projects
> and content here are Afin Atsal's own. Replace any remaining external links
> or copy you do not own before publishing.

## Stack

- Vite (vanilla, no React)
- GSAP + ScrollTrigger (reveals, transitions, stroke-draw)
- WebGL2 particle hero (the accent word is formed from particles)
- Lenis smooth scrolling

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
```

```bash
npm run build      # output → dist/
npm run preview
```

Navigation uses the History API, so add an SPA fallback (rewrite all routes →
`/`) on your host so deep links like `/work/lentera` work on refresh.

## What's here

- **Home**: hero intro, WebGL2 particle headline, character cursor-nudge,
  Selected Work (6 projects), About, Research, Contact + footer.
- Full case-study pages for all 6 projects:
  Lentera (SVG diagrams) plus People Counting, Visual Inspection, RAG Boat
  Ticket Chatbot, Cognitive Performance and FLUENTI (driven by
  `src/js/data/cases.js`, with real screenshots for Visual Inspection and RAG).

## Structure

```
index.html                      # entry shell (root, curtain overlay, grain)
public/og-image.jpg             # link-preview image
src/
├── pages/                      # one HTML partial per routed page
│   ├── home.html
│   └── lentera.html
├── styles/main.css             # tokens + layout
└── js/
    ├── main.js                 # boot
    ├── app/                    # pointer, smooth scroll, transition, reveal, router
    ├── pages/                  # per-page mount/cleanup (home.js, lentera.js)
    ├── effects/split.js        # word/char splitter
    └── particles/field.js      # WebGL2 particle hero
```

## Editing content

- Home copy lives in `src/pages/home.html` (plain HTML).
- The Lentera case study lives in `src/pages/lentera.html`.
- To edit a non-Lentera project page, edit its entry in `src/js/data/cases.js`
  (text lives there; screenshots go in `public/work/`).
- Lentera has its own static page at `src/pages/lentera.html`.

## Reduced motion

`prefers-reduced-motion` disables Lenis, the particle field and all reveal
animations; content stays visible and diagrams render fully drawn.
