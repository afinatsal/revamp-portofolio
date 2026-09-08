import { gsap } from 'gsap'
import lenteraHtml from '../../pages/lentera.html?raw'
import { isReduced } from '../app/smooth.js'
import { revealEach, initStrokeDraws } from '../app/reveal.js'
import { initCarousels } from '../data/cases.js'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default {
  html: lenteraHtml,
  label: 'Lentera',
  title: 'Lentera · Afin Atsal',
  desc: 'A native iOS companion for blind and low-vision users. It reads text, recognises objects and detects obstacles through the camera, and speaks everything back in Indonesian.',
  accent: '#4a7cff',

  mount(root) {
    const reduced = isReduced()
    const ctx = gsap.context(() => {}, root)
    const cleanupCarousels = initCarousels(root)

    // ------------------------------------------- title lines (clip reveal)
    const lines = root.querySelectorAll('.cs-title-line .cs-title-inner')
    if (!reduced && lines.length) {
      gsap.set(lines, { yPercent: 110 })
      ctx.add(() => {
        gsap
          .timeline({ defaults: { ease: 'expo.out' } })
          .to(lines, { yPercent: 0, duration: 1.4, stagger: 0.12 }, 0.15)
      })
    }

    // ------------------------------------------- in-view reveals + drawings
    if (!reduced) {
      ctx.add(() => {
        revealEach(root, '.cs-reveal', 32, 'top 88%')
        initStrokeDraws(root)
      })
    } else {
      initStrokeDraws(root)
    }

    const refresh = () => ScrollTrigger.refresh()
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh)

    return () => {
      ctx.revert()
      cleanupCarousels()
    }
  },
}
