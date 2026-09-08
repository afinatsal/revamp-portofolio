import { gsap } from 'gsap'

// Global pointer state — a smoothed cursor position consumed by the hero
// char-nudge effect and the WebGL particle field. Mirrors the original site's
// single shared mouse tracker (lerped on gsap's ticker, touch-aware).
export const pointer = { x: -9e4, y: -9e4, tx: -9e4, ty: -9e4 }

let started = false

export function initPointer() {
  if (started) return
  started = true

  const offscreen = () => {
    pointer.tx = -9e4
    pointer.ty = -9e4
    pointer.x = -9e4
    pointer.y = -9e4
  }

  window.addEventListener(
    'pointermove',
    (e) => {
      pointer.tx = e.clientX
      pointer.ty = e.clientY
    },
    { passive: true },
  )

  window.addEventListener(
    'pointerdown',
    (e) => {
      pointer.tx = e.clientX
      pointer.ty = e.clientY
      if (e.pointerType === 'touch') {
        pointer.x = e.clientX
        pointer.y = e.clientY
      }
    },
    { passive: true },
  )

  const lift = (e) => {
    if (e.pointerType === 'touch') offscreen()
  }
  window.addEventListener('pointerup', lift, { passive: true })
  window.addEventListener('pointercancel', lift, { passive: true })
  document.documentElement.addEventListener('pointerleave', offscreen, { passive: true })

  gsap.ticker.add(() => {
    pointer.x += (pointer.tx - pointer.x) * 0.22
    pointer.y += (pointer.ty - pointer.y) * 0.22
  })
}
