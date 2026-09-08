import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cover, uncover, pauseScroll } from './transition.js'
import { scrollToTopInstant, scrollToHash, scrollToTopSmooth } from './smooth.js'
import { isReduced } from './smooth.js'

import home from '../pages/home.js'
import lentera from '../pages/lentera.js'
import archive from '../pages/archive.js'
import { caseModule } from '../data/cases.js'

gsap.registerPlugin(ScrollTrigger)

const PAGES = [
  {
    test: (p) => p === '/',
    module: home,
  },
  {
    test: (p) => p === '/work',
    module: archive,
  },
  {
    test: (p) => p === '/work/lentera',
    module: lentera,
  },
]

for (const slug of ['people-counting', 'visual-inspection', 'rag-chatbot', 'cognitive', 'fluenti', 'ailabs', 'thesis', 'chatbots', 'pneumonia']) {
  PAGES.push({ test: (p) => p === `/work/${slug}`, module: caseModule(slug) })
}

function slugTitle(slug) {
  const map = {
    lentera: 'Lentera',
    'people-counting': 'People Counting System',
    'visual-inspection': 'Visual Inspection System',
    'rag-chatbot': 'RAG Boat Ticket Chatbot',
    cognitive: 'Cognitive Performance Prediction',
    fluenti: 'FLUENTI',
  }
  return map[slug] || 'Project'
}

function fallbackPage(slug) {
  const title = slugTitle(slug)
  const accents = {
    lentera: '#4a7cff',
    'people-counting': '#40c8b8',
    'visual-inspection': '#ff5c28',
    'rag-chatbot': '#f5cc08',
    cognitive: '#a78bfa',
    fluenti: '#e03a2e',
  }
  const html = `
    <article class="cs" style="--accent:${accents[slug] || '#ff5c28'};">
      <div class="cs-missing container">
        <a class="cs-back link" href="/">← Work</a>
        <h1 class="cs-missing-title">${title}</h1>
        <p class="label">Case study in progress.</p>
      </div>
    </article>
  `
  return {
    html,
    label: title,
    accent: accents[slug] || '#ff5c28',
    title: `${title} · Afin Atsal`,
    desc: '',
    mount() {
      gsap.set(document.querySelector('.cs-missing-title'), { autoAlpha: 0, y: 40 })
      gsap.to(document.querySelector('.cs-missing-title'), { autoAlpha: 1, y: 0, duration: 1, ease: 'expo.out', delay: 0.3 })
    },
    cleanup() {},
  }
}

function resolve(path) {
  const page = PAGES.find((p) => p.test(path))
  if (page) return page.module
  const m = /^\/work\/([a-z-]+)$/.exec(path)
  return m ? fallbackPage(m[1]) : null
}

let active = null // { path, cleanup }
let main = null
let navigating = false

function setMeta(page) {
  document.title = page.title || document.title
  const desc = document.querySelector('meta[name="description"]')
  if (desc && page.desc) desc.setAttribute('content', page.desc)
  let ogUrl = document.querySelector('meta[property="og:url"]')
  if (ogUrl) ogUrl.setAttribute('content', window.location.origin + (page.path || '/'))
}

// Point any "back" link at the page we actually came from (e.g. from the All
// Projects archive, back goes to /work instead of the home page).
function attachBack(prevPath) {
  const el = document.querySelector('main [data-back]')
  if (!el) return
  const target = prevPath && prevPath.startsWith('/work') ? prevPath : '/'
  el.setAttribute('href', target)
  if (target === '/work') el.textContent = '← Work'
  else if (target === '/') el.textContent = '← Home'
  else el.textContent = '← Back'
}

function renderInto(page) {
  main.innerHTML = page.html
  const cleanup = page.mount ? page.mount(main) : () => {}
  return cleanup
}

// The actual swap, always followed by a transition in `navigate`.
async function swap(path, opts = {}) {
  const page = resolve(path)
  if (!page) return
  const prevPath = active ? active.path : '/'

  pauseScroll(true)
  await cover({
    label: opts.label || (page.label || ''),
    accent: opts.accent || page.accent,
  })

  if (active && active.cleanup) {
    try { active.cleanup() } catch (e) {}
  }

  const cleanup = renderInto(page)
  scrollToTopInstant()

  setMeta({ ...page, path })
  attachBack(prevPath)

  // let fonts/layout settle before triggers measure
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  ScrollTrigger.refresh()

  active = { path, cleanup }
  await uncover()
  pauseScroll(false)

  if (opts.hash) {
    await new Promise((r) => requestAnimationFrame(r))
    scrollToHash('#' + opts.hash)
  }
}

export async function go(path, opts = {}) {
  if (navigating) return
  if (path === active?.path && !opts.hash) return

  const full = opts.hash ? `${path}#${opts.hash}` : path
  navigating = true
  try {
    await swap(path, opts)
    history.pushState({ path }, '', full)
  } finally {
    navigating = false
  }
}

function stripHash(url) {
  return url.split('#')[0]
}

export function initRouter() {
  main = document.querySelector('#main')

  // initial paint — first visit, no curtain
  const path = stripHash(window.location.pathname)
  const page = resolve(path)
  if (page) {
    const cleanup = renderInto(page)
    setMeta({ ...page, path })
    active = { path, cleanup }
    ScrollTrigger.refresh()
    if (window.location.hash) scrollToHash(window.location.hash)
  }

  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    const anchor = e.target.closest('a[href]')
    if (!anchor) return
    const url = new URL(anchor.href, window.location.origin)
    if (url.origin !== window.location.origin) return
    if (anchor.target === '_blank') return

    const p = stripHash(url.pathname)
    const hash = url.hash.slice(1)

    // same page → smooth scroll to the hash (anchor sections on the home page)
    if (p === (active?.path || stripHash(window.location.pathname))) {
      if (hash) {
        e.preventDefault()
        scrollToHash('#' + hash)
      } else if (p === '/') {
        e.preventDefault()
        scrollToTopSmooth()
      }
      return
    }

    e.preventDefault()
    const label = anchor.getAttribute('data-label') || undefined
    const accent = anchor.getAttribute('data-accent') || undefined
    go(p, { hash, label, accent })
  })

  window.addEventListener('popstate', async () => {
    const p = stripHash(window.location.pathname)
    const page = resolve(p)
    if (!page) return
    const prevPath = active ? active.path : '/'
    pauseScroll(true)
    await cover({ label: page.label || '', accent: page.accent })
    if (active && active.cleanup) active.cleanup()
    const cleanup = renderInto(page)
    scrollToTopInstant()
    setMeta({ ...page, path: p })
    attachBack(prevPath)
    await new Promise((r) => requestAnimationFrame(r))
    ScrollTrigger.refresh()
    active = { path: p, cleanup }
    await uncover()
    pauseScroll(false)
  })
}
