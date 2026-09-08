import '../styles/main.css'
import { initPointer } from './app/pointer.js'
import { initSmoothScroll } from './app/smooth.js'
import { initRouter } from './app/router.js'

// App shell — persistent chrome around the routed <main>.
function mountShell() {
  const root = document.getElementById('root')
  root.innerHTML = `
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header container">
      <a class="site-name link" href="/">Afin Atsal</a>
      <nav class="site-nav" aria-label="Primary">
        <a class="link" href="/#work">Work</a>
        <a class="link" href="/#about">About</a>
        <a class="link" href="/#research">Research</a>
        <a class="link" href="/#certification">Certification</a>
        <a class="link" href="/#contact">Contact</a>
      </nav>
    </header>
    <main id="main"></main>
  `
}

function boot() {
  mountShell()
  initSmoothScroll()
  initPointer()
  initRouter()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot)
} else {
  boot()
}
