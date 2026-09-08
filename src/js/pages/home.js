import { gsap } from 'gsap'
import homeHtml from '../../pages/home.html?raw'
import { splitWordsChars } from '../effects/split.js'
import { initHeroField } from '../particles/field.js'
import { pointer } from '../app/pointer.js'
import { isReduced } from '../app/smooth.js'
import { revealGroup } from '../app/reveal.js'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const DEFAULT_EM = () => '#ff5c28'

export default {
  html: homeHtml,
  label: 'Home',
  title: 'Afin Atsal · AI/ML Engineer',
  desc: 'AI/ML engineer building computer vision, RAG and LLM systems that solve real problems, from research to production.',
  accent: DEFAULT_EM(),

  mount(root) {
    const reduced = isReduced()
    const ctx = gsap.context(() => {}, root)

    // ------------------------------------------------------------- hero text
    const headline = root.querySelector('.hero-headline')
    const chars = headline ? splitWordsChars(headline) : []
    const lines = root.querySelectorAll('.hero-line-inner')
    const heroFoot = root.querySelectorAll('.hero-eyebrow, .hero-foot > *')

    if (!reduced) {
      gsap.set(lines, { yPercent: 110 })
      gsap.set(heroFoot, { autoAlpha: 0, y: 24 })

      const runIntro = () => {
        ctx.add(() => {
          gsap
            .timeline({ defaults: { ease: 'expo.out' } })
            .to(lines, { yPercent: 0, duration: 1.4, stagger: 0.12 }, 0.15)
            .to(heroFoot, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.08 }, 0.7)
        })
      }
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(runIntro)
      else runIntro()
    }

    // -------------------------------------------------------- char nudge
    // characters drift gently away from the cursor within ~150px, eased.
    let nudgeCleanup = () => {}
    if (!reduced && chars.length) {
      const el = chars
      const state = el.map(() => ({ x: 0, y: 0, tx: 0, ty: 0 }))
      const centers = []
      let raf = null

      const measure = () => {
        centers.length = 0
        for (let i = 0; i < el.length; i++) {
          const r = el[i].getBoundingClientRect()
          centers.push({ x: r.left + r.width / 2, y: r.top + r.height / 2 })
        }
      }
      measure()
      // re-measure once fonts/layout settle and once the intro reveal lands
      const timers = [
        setTimeout(() => measure(), 250),
        setTimeout(() => measure(), 2400),
      ]
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => setTimeout(() => measure(), 0))
      }
      window.addEventListener('resize', measure)
      window.addEventListener('scroll', measure, { passive: true })

      const onTick = () => {
        for (let i = 0; i < el.length; i++) {
          const st = state[i]
          const c = centers[i]
          const dx = c.x - pointer.x
          const dy = c.y - pointer.y
          const dist = Math.hypot(dx, dy)
          if (dist < 150 && dist > 0.01) {
            const f = (1 - dist / 150) * 14
            st.tx = (dx / dist) * f
            st.ty = ((dy / dist) * f) * 0.6
          } else {
            st.tx = 0
            st.ty = 0
          }
          st.x += (st.tx - st.x) * 0.14
          st.y += (st.ty - st.y) * 0.14
          el[i].style.transform = `translate(${st.x.toFixed(2)}px, ${st.y.toFixed(2)}px)`
        }
      }
      gsap.ticker.add(onTick)

      nudgeCleanup = () => {
        timers.forEach(clearTimeout)
        window.removeEventListener('resize', measure)
        window.removeEventListener('scroll', measure)
        gsap.ticker.remove(onTick)
      }
    }

    // -------------------------------------------------------- WebGL field
    const canvas = root.querySelector('.hero-field')
    const field = reduced ? null : initHeroField(canvas)

    // ------------------------------------------------------------- reveals
    ctx.add(() => {
      if (reduced) return
      revealGroup({ trigger: '#work', selector: '.work .section-head', y: 32, duration: 1, stagger: 0, start: 'top 82%' })
      revealGroup({ trigger: '#work', selector: '.work-row', y: 48, duration: 1.1, stagger: 0.12, start: 'top 80%' })
      revealGroup({ trigger: '#about', selector: '.about-reveal', y: 40, duration: 1.1, stagger: 0.12, start: 'top 72%' })
      revealGroup({ trigger: '#research', selector: '.rs-reveal', y: 36, duration: 1, stagger: 0.1, start: 'top 75%' })
      revealGroup({ trigger: '#certification', selector: '.cert-reveal', y: 32, duration: 1, stagger: 0.08, start: 'top 80%' })
      revealGroup({ trigger: '#contact', selector: '.contact-reveal', y: 48, duration: 1.1, stagger: 0.12, start: 'top 75%' })
    })

    const refresh = () => ScrollTrigger.refresh()
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh)

    return () => {
      ctx.revert()
      nudgeCleanup()
      if (field) field.destroy()
    }
  },
}
