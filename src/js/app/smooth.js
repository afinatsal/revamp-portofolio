import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

let lenis = null

export function isReduced() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function initSmoothScroll() {
  if (isReduced()) return null

  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.6,
  })

  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)

  return lenis
}

export function getLenis() {
  return lenis
}

// scroll instantly (used at the apex of a page transition). Lenis must be
// briefly runnable to flush an immediate jump, otherwise a stopped Lenis keeps
// the previous scroll offset and the next page appears scrolled down.
export function scrollToTopInstant() {
  const wasStopped = lenis ? lenis.isStopped : false
  if (lenis) lenis.start()
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true })
  window.scrollTo(0, 0)
  if (lenis && wasStopped) lenis.stop()
}

export function scrollToTopSmooth() {
  if (lenis) lenis.scrollTo(0)
  else window.scrollTo({ top: 0, behavior: 'smooth' })
}

export function scrollToHash(hash) {
  const el = document.querySelector(hash)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { offset: 0 })
  else el.scrollIntoView({ behavior: 'smooth' })
}
