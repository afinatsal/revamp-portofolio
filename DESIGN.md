# DESIGN.md — Afin Atsal portfolio

Personal portfolio (vanilla JS + Vite + GSAP) for Muhammad Afin Atsal,
AI/ML Engineer.

> **Origin note.** This build began as a study of the art direction, layout and
> motion of [bouayaben.com](https://bouayaben.com/) (Mehdi Bouayaben). The
> visual system below inherits that language: near-black editorial style,
> Archivo/Inter, film grain, hairline borders, giant display type, a WebGL2
> particle word and GSAP-driven reveals. All written content and the projects
> presented are Afin Atsal's.

## 1. Visual system

| Token | Value | Role |
|---|---|---|
| `--bg` | `#0a0a0a` | page background |
| `--ink` | `#f5f0eb` | paper-white text |
| `--ink-dim` | `#f5f0eb8c` | secondary text |
| `--line` | `#f5f0eb24` | hairlines |
| `--accent` | `#ff5c28` | signature orange (hero, links, selection) |
| per-project | `#4a7cff` `#40c8b8` `#ff5c28` `#f5cc08` `#a78bfa` `#e03a2e` | Lentera / People Counting / Visual Inspection / RAG / Cognitive / FLUENTI |

Type scale & spacing mirror the studied source (`--step-*`, `--space-*`,
`--gutter`, `--space-section`). Display Archivo, body Inter.

## 2. Home anatomy

```
header (fixed)                 Afin Atsal · Work About Contact
section#top.hero
  canvas.hero-field            WebGL2 semantic-particle field
  p.hero-eyebrow               AI/ML Engineer · Indonesia
  h1.hero-headline             "Building AI that earns / its place in production."
    em "production."           accent italic → fades into the particle word
  .hero-foot                   intro paragraph + "Scroll ↓"
section#work                    Selected Work (06 rows)
section#about                   sticky About label + lede, bio, capabilities, certifications
section#research                sticky Research label + paper (YOLOv12 + hierarchical classification)
section#contact                 "Let's talk." CTA + email/GitHub/LinkedIn + footer
overlays                        grain · page-transition (SVG curtain)
```

## 3. Case study anatomy (Lentera)

```
article.cs (--accent: #4a7cff)
  header.cs-head       ← Work · title lines "Lentera / read · see · walk" · summary · facts
  .cs-visual-bleed     pipeline diagram (camera → Gemini → speech, offline OCR fallback)
  § Context · § The problem
  .cs-quote            "The screen is optional when the camera can speak."
  § three modes diagram
  § What I built       04 numbered items
  § Decisions          04 dt/dd pairs
  § In one glance      outcome stats + closing paragraphs
  nav.cs-next          next project
```

## 4. Motion (inherited from the study)

- Hero intro: masked lines `yPercent 110→0`, eyebrow/foot fade after fonts.
- Particle field: WebGL2, ~24k–90k dots; the em word is sampled and condensed
  from particles after ~1.8s (DOM `<em>` fades); curl-flow ambient drift;
  cursor repels the fluid field, hover enlarges nearby dots; touch shimmer;
  off-screen gating; reduced-motion fallback.
- Character cursor-nudge (headline).
- Group reveals (work/about/research/contact) + per-element `.cs-reveal`.
- `[data-draw-len]` paths stroke-draw on scroll.
- SVG curtain route transition with per-route label + accent.
- Reduced motion disables all of the above.

## 5. Todo(ASSET/CONTENT)

- Write the remaining 5 project pages (`people-counting`, `visual-inspection`,
  `rag-chatbot`, `cognitive`, `fluenti`). Marked `data-todo` in home rows; they
  currently route to a "Case study in progress" placeholder.
- Replace screenshot imagery with real project screenshots when ready.
