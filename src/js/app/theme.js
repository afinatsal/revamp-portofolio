// Light / dark theme toggle. Default is dark; the light palette comes from
// joeyjaqlino.com (white bg, near-black ink, hairline greys, orange accent).
// The choice is remembered in localStorage and applied before first paint by a
// tiny inline script in index.html to avoid a flash.

const KEY = 'afin-theme'

export function initTheme() {
  const root = document.documentElement
  const btn = document.querySelector('.theme-toggle')
  if (!btn) return

  const setMeta = (light) => {
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', light ? '#ffffff' : '#000000')
  }

  const apply = (light) => {
    root.classList.toggle('light', light)
    btn.setAttribute('aria-pressed', light ? 'true' : 'false')
    btn.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode')
    setMeta(light)
    window.dispatchEvent(new CustomEvent('afin:theme', { detail: { light } }))
  }

  const saved = (() => {
    try {
      return localStorage.getItem(KEY)
    } catch (e) {
      return null
    }
  })()

  apply(saved === 'light')

  btn.addEventListener('click', () => {
    const next = !root.classList.contains('light')
    apply(next)
    try {
      localStorage.setItem(KEY, next ? 'light' : 'dark')
    } catch (e) {}
  })
}
