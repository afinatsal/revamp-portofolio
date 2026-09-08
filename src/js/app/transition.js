import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getLenis } from './smooth.js'

gsap.registerPlugin(ScrollTrigger)

// Page transition, recreated from the original site. Two distinct path
// geometries are used: a *cover* sweep (leading edge bows up, fill grows from
// the bottom) and a *reveal* sweep (fill is the top area shrinking upward, the
// edge bowing down) while the freshly swapped <main> zoom-settles from 1.015.
//
//   cover path  Nd(p) = Md(p) + " L 100 101 L 0 101 Z"   (fill below the edge)
//   reveal path Fd(p) = " M 0 -1 L 0 t Q 50 t+B 100 t L 100 -1 Z" (fill above)
//   edge paths  Md / Pd  bow ±13 units with sin(π·p)

const BOW = 13

const overlay = () => document.querySelector('.page-transition')
const curtain = () => overlay().querySelector('.pt-curtain')
const edge = () => overlay().querySelector('.pt-edge')
const label = () => overlay().querySelector('.pt-label')

// ---------------- path builders (1:1 with the original) ----------------
function coverEdge(p) {
  const t = 100 * (1 - p)
  return `M 0 ${t} Q 50 ${t - BOW * Math.sin(Math.PI * p)} 100 ${t}`
}
function coverFill(p) {
  return `${coverEdge(p)} L 100 101 L 0 101 Z`
}
function revealEdge(p) {
  const t = 100 * (1 - p)
  return `M 0 ${t} Q 50 ${t + BOW * Math.sin(Math.PI * p)} 100 ${t}`
}
function revealFill(p) {
  const t = 100 * (1 - p)
  return `M 0 -1 L 0 ${t} Q 50 ${t + BOW * Math.sin(Math.PI * p)} 100 ${t} L 100 -1 Z`
}

const setPaths = (el, edgeEl, fill, ed) => {
  el.setAttribute('d', fill)
  edgeEl.setAttribute('d', ed)
}

export function pauseScroll(paused) {
  const lenis = getLenis()
  if (!lenis) return
  if (paused) lenis.stop()
  else lenis.start()
}

// Cover: the curtain sweeps bottom→top over the outgoing page while the main
// content scales back and the destination label rises in.
export function cover({ label: text, accent } = {}) {
  const el = overlay()
  el.style.setProperty('--t-accent', accent || 'var(--accent)')
  el.classList.add('is-active')

  const pLabel = label()
  pLabel.textContent = text || ''
  pLabel.style.cssText = ''

  const proxy = { p: 0 }
  setPaths(curtain(), edge(), coverFill(0), coverEdge(0))

  return new Promise((resolve) => {
    gsap
      .timeline({ onComplete: resolve })
      .to(proxy, {
        p: 1,
        duration: 0.55,
        ease: 'expo.inOut',
        onUpdate: () => setPaths(curtain(), edge(), coverFill(proxy.p), coverEdge(proxy.p)),
      })
      .to(
        '#main',
        { scale: 0.98, autoAlpha: 0.9, transformOrigin: '50% 30%', duration: 0.55, ease: 'expo.inOut' },
        0,
      )
      .fromTo(
        pLabel,
        { autoAlpha: 0, yPercent: 80 },
        { autoAlpha: 1, yPercent: 0, duration: 0.35, ease: 'power3.out' },
        0.28,
      )
  })
}

// Reveal: the label lifts out first, then the curtain is pulled up (bottom of
// the new page appears first) while the new <main> zoom-settles from 1.015.
export function uncover() {
  return new Promise((resolve) => {
    const el = overlay()
    const pLabel = label()

    // outgoing content is gone — reset <main> so the reveal can re-zoom it
    gsap.set('#main', { clearProps: 'all' })

    const proxy = { p: 0 }
    setPaths(curtain(), edge(), revealFill(0), revealEdge(0))

    gsap
      .timeline({
        onComplete: () => {
          el.classList.remove('is-active')
          pLabel.style.cssText = ''
          edge().setAttribute('d', '')
          ScrollTrigger.refresh()
          resolve()
        },
      })
      .to(pLabel, { autoAlpha: 0, yPercent: -60, duration: 0.3, ease: 'power2.in' })
      .to(
        proxy,
        {
          p: 1,
          duration: 0.7,
          ease: 'expo.inOut',
          onUpdate: () => setPaths(curtain(), edge(), revealFill(proxy.p), revealEdge(proxy.p)),
        },
        0.08,
      )
      .fromTo(
        '#main',
        { scale: 1.015, transformOrigin: '50% 12%' },
        { scale: 1, duration: 0.7, ease: 'expo.out', clearProps: 'all' },
        0.2,
      )
  })
}
