import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { isReduced } from '../app/smooth.js'

gsap.registerPlugin(ScrollTrigger)

// Case-study slugs rendered inside this site.
const PAGE_SLUGS = new Set([
  'lentera', 'people-counting', 'visual-inspection', 'rag-chatbot', 'cognitive', 'fluenti',
  'ailabs', 'thesis', 'chatbots', 'pneumonia',
])

// Every project ever built; each links to its own detail page inside the site.
const PROJECTS = [
  { slug: 'lentera', title: 'Lentera', meta: 'Personal · iOS Accessibility', year: '2026', accent: '#4a7cff' },
  { slug: 'ailabs', title: 'AI Labs', meta: 'AfinLabs · Studio website', year: '2026', accent: '#a78bfa' },
  { slug: 'people-counting', title: 'People Counting System', meta: 'X-Camp, XLSmart · Computer Vision', year: 'Jan 2026', accent: '#40c8b8' },
  { slug: 'visual-inspection', title: 'Visual Inspection System', meta: 'X-Camp, XLSmart · Vision AI', year: '2025', accent: '#ff5c28' },
  { slug: 'rag-chatbot', title: 'RAG Boat Ticket Chatbot', meta: 'Amman Mineral · LLM & RAG', year: '2025', accent: '#f5cc08' },
  { slug: 'thesis', title: 'Multi-Stage Waste Detection', meta: 'Thesis · YOLOv12 + HSCN', year: '2026', accent: '#4a7cff' },
  { slug: 'chatbots', title: 'Chatbots Platform', meta: 'AfinLabs · One engine, many bots', year: '2026', accent: '#e03a2e' },
  { slug: 'cognitive', title: 'Cognitive Performance Prediction', meta: 'UB Capstone · Biosignal ML', year: '2025', accent: '#a78bfa' },
  { slug: 'fluenti', title: 'FLUENTI', meta: 'UB Capstone · LLM Fine-tuning', year: '2024-25', accent: '#e03a2e' },
  { slug: 'pneumonia', title: 'Pneumonia X-Ray Detection', meta: 'Personal · Medical Imaging', year: '2024', accent: '#40c8b8' },
]

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const html = `<article class="cs">
  <header class="cs-head container">
    <a class="cs-back link" href="/" data-back>← Home</a>
    <h1 class="cs-title">
      <span class="sr-only">All projects I have built.</span>
      <span aria-hidden="true">
        <span class="cs-title-line"><span class="cs-title-inner">All</span></span>
        <span class="cs-title-line"><span class="cs-title-inner">projects</span></span>
      </span>
    </h1>
    <p class="cs-summary">A running archive of everything I have built: shipped products, internships, my thesis, capstones and side projects.</p>
  </header>
  <div class="archive container">
    <ul class="work-list">
      ${PROJECTS.map(
        (p, i) => {
          const inner = `
            <span class="work-index">${String(i + 1).padStart(2, '0')}</span>
            <h3 class="work-title">${esc(p.title)}</h3>
            <p class="work-meta">${esc(p.meta)}</p>
            <span class="work-year">${esc(p.year)}</span>`
          if (p.url) {
            return `
        <li class="work-row archive-row">
          <a class="work-link" href="${p.url}" target="_blank" rel="noopener noreferrer" data-label="${esc(p.title)}" data-accent="${p.accent}">${inner}
            <span class="work-arrow" aria-hidden="true">↗</span>
          </a>
        </li>`
          }
          if (PAGE_SLUGS.has(p.slug)) {
            return `
        <li class="work-row archive-row">
          <a class="work-link" href="/work/${p.slug}" data-label="${esc(p.title)}" data-accent="${p.accent}">${inner}
            <span class="work-arrow" aria-hidden="true">→</span>
          </a>
        </li>`
          }
          return `
        <li class="work-row archive-row">
          <div class="work-link archive-link-static">${inner}</div>
        </li>`
        },
      ).join('')}
    </ul>
    <p class="archive-note">Every project opens its own case page on this site.</p>
  </div>
</article>`

export default {
  html,
  label: 'All projects',
  title: 'All projects · Afin Atsal',
  desc: 'A running archive of everything Muhammad Afin Atsal has built.',
  accent: '#ff5c28',

  mount(root) {
    const reduced = isReduced()
    const ctx = gsap.context(() => {}, root)

    const lines = root.querySelectorAll('.cs-title-line .cs-title-inner')
    if (!reduced && lines.length) {
      gsap.set(lines, { yPercent: 110 })
      ctx.add(() => {
        gsap.timeline({ defaults: { ease: 'expo.out' } }).to(lines, { yPercent: 0, duration: 1.4, stagger: 0.12 }, 0.15)
      })
    }

    const rows = root.querySelectorAll('.archive-row')
    if (!reduced && rows.length) {
      gsap.set(rows, { autoAlpha: 0, y: 40 })
      ctx.add(() => {
        gsap.to(rows, {
          autoAlpha: 1,
          y: 0,
          duration: 1.1,
          ease: 'expo.out',
          stagger: 0.08,
          scrollTrigger: { trigger: root.querySelector('.archive'), start: 'top 85%' },
        })
      })
    }

    const refresh = () => ScrollTrigger.refresh()
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh)

    return () => {
      ctx.revert()
    }
  },
}
