import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { isReduced } from './smooth.js'

gsap.registerPlugin(ScrollTrigger)

// One group reveal, driven by a single trigger element — e.g. the About grid:
// gsap.from('.about-reveal', { autoAlpha:0, y:40, ... scrollTrigger:{trigger, start:'top 72%'} })
export function revealGroup({ trigger, selector, y = 40, duration = 1.1, stagger = 0.12, start = 'top 75%' }) {
  if (isReduced()) return null
  const tween = gsap.from(selector, {
    autoAlpha: 0,
    y,
    duration,
    ease: 'expo.out',
    stagger,
    scrollTrigger: { trigger, start },
  })
  return tween
}

// Reveal each matching element as it scrolls into view (used on case studies).
export function revealEach(root, selector = '.cs-reveal', y = 32, start = 'top 85%') {
  if (isReduced()) return []
  const items = gsap.utils.toArray(selector, root)
  return items.map((el) =>
    gsap.from(el, {
      autoAlpha: 0,
      y,
      duration: 1,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start },
    }),
  )
}

// Animate the stroke-draw of every SVG figure in a page: elements tagged with
// `data-draw-len` carry an inline stroke-dashoffset == length (pre-drawn
// hidden state in the markup); this tween walks each offset to 0 when the
// figure enters the viewport.
export function initStrokeDraws(root) {
  const figures = gsap.utils.toArray('.cv', root)
  if (isReduced()) {
    figures.forEach((fig) => {
      fig.querySelectorAll('[data-draw-len]').forEach((el) => el.style.strokeDashoffset = '0')
    })
    return []
  }

  return figures.map((fig) => {
    const draws = fig.querySelectorAll('[data-draw-len]')
    const tween = gsap.to(draws, {
      strokeDashoffset: 0,
      duration: 1.4,
      ease: 'power2.out',
      stagger: 0.18,
      scrollTrigger: { trigger: fig, start: 'top 82%' },
    })
    return tween
  })
}
