import { gsap } from 'gsap'
import { isReduced } from './smooth.js'

// Floating navbar: compresses to just the name while you scroll down, and
// expands again the moment you scroll up even slightly. Both transitions are
// driven by GSAP tweens on a shared timeline (width, gap and opacity move
// together) so they stay smooth in both directions.
//
//  - collapse: only after scrolling down past a threshold, animated power2.out
//  - expand: triggered by ANY upward scroll, fast and responsive

const THRESHOLD = 120 // scrollY after which the collapse may start

export function initNavbar() {
  const header = document.querySelector('.site-header')
  const nav = header && header.querySelector('.site-nav')
  if (!header || !nav || isReduced()) return

  let tl = null
  let collapsed = false
  let lastY = window.scrollY
  let ticking = false
  let suppressUntil = 0 // ms until which anchor-driven scrolling must not collapse

  function build() {
    if (tl) tl.kill()
    const startGap = parseFloat(getComputedStyle(header).gap) || 0
    const navW = nav.offsetWidth
    if (!navW) return

    gsap.set(nav, { width: navW, autoAlpha: 1, x: 0 })
    gsap.set(header, { gap: startGap })

    tl = gsap.timeline({ paused: true, defaults: { ease: 'none', duration: 1 } })
    tl.to(nav, { width: 0, autoAlpha: 0, x: 12 }, 0).to(header, { gap: 0 }, 0)

    if (collapsed) tl.progress(1)
  }

  function collapse() {
    if (collapsed || !tl) return
    collapsed = true
    gsap.to(tl, { progress: 1, duration: 0.5, ease: 'power2.out', overwrite: true })
  }

  function expand() {
    if (!collapsed || !tl) return
    collapsed = false
    gsap.to(tl, { progress: 0, duration: 0.55, ease: 'power2.out', overwrite: true })
  }

  const update = () => {
    ticking = false
    const y = window.scrollY
    // anchor/navigation scrolling (Work / About / Contact …) should not hide
    // the navbar while it travels down to the section
    if (performance.now() < suppressUntil) {
      if (collapsed) expand()
      lastY = y
      return
    }
    if (y > lastY + 2 && y > THRESHOLD) collapse()
    else if (y < lastY - 1) expand()
    lastY = y
  }

  const onScroll = () => {
    if (!ticking) {
      ticking = true
      requestAnimationFrame(update)
    }
  }

  // keep the navbar open whenever the user clicks any in-page anchor or the
  // brand link, even if the smooth scroll to that section travels far down
  document.addEventListener(
    'click',
    (e) => {
      const a = e.target.closest('a[href*="#"], a[href="/"], a[data-back]')
      if (!a) return
      expand()
      suppressUntil = performance.now() + 1800
    },
    true,
  )

  build()

  let resizeTimer = null
  const onResize = () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(build, 120)
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize)
}
