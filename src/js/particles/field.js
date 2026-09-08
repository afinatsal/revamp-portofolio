import { pointer } from '../app/pointer.js'

// Semantic Particle Allocation hero — a WebGL2 field of ambient dots that,
// shortly after load, allocates half its budget into the accent word
// ("millions."), forming it from particles exactly where the <em> sits. The
// DOM <em> then fades away and the word lives on as particles. This is a
// faithful reimplementation of the effect on bouayaben.com (which the site's
// research section describes): budget-limited, legibility-constrained, and
// gated off-screen.

const VERT = `#version 300 es
precision highp float;
in vec4 aSeed;
in vec4 aTgt; // xy: target (device px), z: has-target, w: stagger
uniform vec2 uRes;
uniform float uT;
uniform vec2 uMouse;
uniform float uDpr;
uniform vec4 uGuard;
uniform float uMorph;
uniform vec2 uTouch;
uniform float uTouchAmp;
out float vAlpha;
out float vAccent;
out float vSettle;
out float vShimmer;

// Vector potential; the flow is its curl, so the field is
// divergence-free by construction — no sinks, the cloud never clumps.
vec3 psi(vec3 p, float t) {
  return vec3(
    sin(p.y * 1.3 + t * 0.40) + cos(p.z * 1.7 - t * 0.30),
    sin(p.z * 1.1 - t * 0.35) + cos(p.x * 1.5 + t * 0.45),
    sin(p.x * 1.7 + t * 0.30) + cos(p.y * 1.2 - t * 0.40)
  );
}

vec3 flow(vec3 p, float t) {
  const float e = 0.12;
  vec3 dx = vec3(e, 0.0, 0.0);
  vec3 dy = vec3(0.0, e, 0.0);
  vec3 dz = vec3(0.0, 0.0, e);
  float x = (psi(p + dy, t).z - psi(p - dy, t).z)
          - (psi(p + dz, t).y - psi(p - dz, t).y);
  float y = (psi(p + dz, t).x - psi(p - dz, t).x)
          - (psi(p + dx, t).z - psi(p - dx, t).z);
  float z = (psi(p + dx, t).y - psi(p - dy, t).y)
          - (psi(p + dy, t).x - psi(p - dx, t).x);
  return vec3(x, y, z) / (2.0 * e);
}

void main() {
  vec2 base = aSeed.xy * uRes;

  // Displacement from a fixed home, never integration — position is a
  // pure function of (home, time), so the cloud is bounded forever.
  vec3 wp = vec3(base / uRes.y * 3.0, aSeed.w * 2.0);
  vec2 p = base + flow(wp, uT * 0.35).xy * (10.0 + 22.0 * aSeed.z) * uDpr;

  // Cursor repulsion on the fluid state.
  vec2 d = p - uMouse;
  float dist2 = dot(d, d) + 60.0;
  p += (d * inversesqrt(dist2)) * min(9000.0 * uDpr * uDpr / dist2, 46.0 * uDpr);

  // Touch ripple (ported from the prototype): a decaying radial wave
  // around the last touch point, displacing the FLUID component only —
  // at full settle this term has zero weight, so the word never leaves
  // its position; it shimmers instead (below).
  float tD = distance(p, uTouch);
  vec2 tDir = (p - uTouch) / max(tD, 1e-3);
  p += tDir * (uTouchAmp * exp(-tD / (190.0 * uDpr)) *
               sin(tD * (0.045 / uDpr) - uT * 22.0) * 46.0 * uDpr);

  // Per-particle staggered settle: condensation reads as a wave.
  float local = clamp((uMorph - aTgt.w * 0.35) / 0.65, 0.0, 1.0);
  float e2 = local * local * (3.0 - 2.0 * local);
  float settle = e2 * aTgt.z;
  vSettle = settle;

  // Comet arc: mid-flight the particle sweeps a curve, not a chord. The
  // arc term is sin(pi*settle)-shaped — exactly zero at both ends, so
  // arrival position and time are untouched.
  vec2 chord = aTgt.xy - p;
  float span = length(chord);
  vec2 dirc = chord / max(span, 1e-4);
  vec2 perp = vec2(-dirc.y, dirc.x);
  float side = fract(sin(dot(aSeed.zw, vec2(157.31, 93.17))) * 43758.5453) - 0.5;
  vec2 formed = mix(p, aTgt.xy, settle) + perp * (sin(3.14159265 * settle) * span * 0.2 * side);

  // A settled glyph still answers the cursor — gently, and it self-heals
  // because position is recomputed from scratch every frame.
  vec2 d2 = formed - uMouse;
  float dd2 = dot(d2, d2) + 80.0;
  formed += (d2 * inversesqrt(dd2)) * min(2600.0 * uDpr * uDpr / dd2, 15.0 * uDpr) * settle;

  // Legibility floor: ambient particles attenuate over the headline box;
  // granted particles are the text, so they are exempt.
  vec2 g1 = uGuard.xy;
  vec2 g2 = uGuard.xy + uGuard.zw;
  float feather = 44.0 * uDpr;
  vec2 s = smoothstep(g1 - feather, g1 + feather, formed) *
           (1.0 - smoothstep(g2 - feather, g2 + feather, formed));
  vAlpha = mix(mix(1.0, 0.14, s.x * s.y), 1.0, settle);

  vAccent = step(0.94, fract(aSeed.z * 7.31 + aSeed.w * 3.17));

  // Touch shimmer: settled particles near the touch swell and glow
  // WITHOUT moving — the word stays exactly where it is.
  vShimmer = uTouchAmp * exp(-distance(formed, uTouch) / (110.0 * uDpr));

  vec2 clip = (formed / uRes) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  float swell = sin(3.14159265 * settle);
  gl_PointSize = ((0.8 + 1.3 * aSeed.z) + swell * 0.9 + settle * 0.9 +
                  vShimmer * settle * 1.3) * uDpr;
}`

const FRAG = `#version 300 es
precision mediump float;
in float vAlpha;
in float vAccent;
in float vSettle;
in float vShimmer;

uniform vec3 uInk;
uniform vec3 uAccentCol;
uniform float uFade;
out vec4 outColor;

void main() {
  vec2 c = gl_PointCoord * 2.0 - 1.0;
  float m = 1.0 - smoothstep(0.5, 1.0, dot(c, c));
  // Ambient dots are ink (a sparse few accent); the settled word is
  // fully accent — it inherits the em's colour.
  vec3 col = mix(mix(uInk, uAccentCol, vAccent), uAccentCol,
                 smoothstep(0.5, 0.95, vSettle));
  float ambientA = (0.075 + 0.16 * vAccent) * vAlpha;
  float a = m * uFade *
    (mix(ambientA, 0.85, vSettle) + sin(3.14159265 * vSettle) * 0.18 +
     vShimmer * 0.45 * vSettle);
  outColor = vec4(col * a, a); // premultiplied
}`

function hexToRgb(hex) {
  let h = hex.trim().replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  const n = parseInt(h, 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

function particleCount() {
  if (window.matchMedia('(max-width: 720px)').matches) return 24000
  const hc = navigator.hardwareConcurrency || 4
  return hc >= 8 ? 90000 : 48000
}

export function initHeroField(canvas) {
  if (!canvas) return null
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null

  const gl = canvas.getContext('webgl2', {
    alpha: true,
    antialias: false,
    depth: false,
    powerPreference: 'low-power',
  })
  if (!gl) return null

  const compile = (type, src) => {
    const sh = gl.createShader(type)
    gl.shaderSource(sh, src)
    gl.compileShader(sh)
    return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null
  }

  const vs = compile(gl.VERTEX_SHADER, VERT)
  const fs = compile(gl.FRAGMENT_SHADER, FRAG)
  if (!vs || !fs) {
    console.warn('[hero-field] shader compile failed')
    return null
  }

  const prog = gl.createProgram()
  gl.attachShader(prog, vs)
  gl.attachShader(prog, fs)
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn('[hero-field] link failed', gl.getProgramInfoLog(prog))
    return null
  }
  gl.useProgram(prog)

  const count = particleCount()

  // seed buffer (static randoms)
  const seed = new Float32Array(count * 4)
  for (let i = 0; i < seed.length; i++) seed[i] = Math.random()
  const seedBuf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, seedBuf)
  gl.bufferData(gl.ARRAY_BUFFER, seed, gl.STATIC_DRAW)
  const aSeed = gl.getAttribLocation(prog, 'aSeed')
  gl.enableVertexAttribArray(aSeed)
  gl.vertexAttribPointer(aSeed, 4, gl.FLOAT, false, 0, 0)

  // target buffer (dynamic) — xy target, z hasTarget, w stagger
  const tgt = new Float32Array(count * 4)
  const tgtBuf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, tgtBuf)
  gl.bufferData(gl.ARRAY_BUFFER, tgt, gl.DYNAMIC_DRAW)
  const aTgt = gl.getAttribLocation(prog, 'aTgt')
  gl.enableVertexAttribArray(aTgt)
  gl.vertexAttribPointer(aTgt, 4, gl.FLOAT, false, 0, 0)

  const U = (name) => gl.getUniformLocation(prog, name)
  const uRes = U('uRes')
  const uT = U('uT')
  const uMouse = U('uMouse')
  const uGuard = U('uGuard')
  const uFade = U('uFade')
  const uMorph = U('uMorph')
  const uTouch = U('uTouch')
  const uTouchAmp = U('uTouchAmp')
  const uDpr = U('uDpr')

  const css = getComputedStyle(document.documentElement)
  gl.uniform3fv(U('uInk'), hexToRgb(css.getPropertyValue('--ink') || '#f5f0eb'))
  gl.uniform3fv(U('uAccentCol'), hexToRgb(css.getPropertyValue('--accent') || '#ff5c28'))

  gl.enable(gl.BLEND)
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
  gl.clearColor(0, 0, 0, 0)

  const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
  gl.uniform1f(uDpr, dpr)

  // ---------- geometry measurement ----------
  const hero = canvas.parentElement
  const emEl = () => hero.querySelector('.hero-headline em')

  function sizeCanvas() {
    const heroRect = hero.getBoundingClientRect()
    let h = heroRect.height
    const em = emEl()
    if (em) {
      const er = em.getBoundingClientRect()
      const top = er.top - heroRect.top
      h = Math.max(h, top + er.height + 60)
    }
    canvas.style.height = h + 'px'
    const w = Math.max(1, Math.round(heroRect.width * dpr))
    const hh = Math.max(1, Math.round(h * dpr))
    canvas.width = w
    canvas.height = hh
    gl.viewport(0, 0, w, hh)
    gl.uniform2f(uRes, w, hh)

    const headline = hero.querySelector('.hero-headline')
    if (headline) {
      const hr = headline.getBoundingClientRect()
      gl.uniform4f(uGuard, (hr.left - heroRect.left) * dpr, (hr.top - heroRect.top) * dpr, hr.width * dpr, hr.height * dpr)
    }
  }

  // ---------- sample the em's glyphs ----------
  let morphing = false
  let morphStart = 0
  let fadeTimer = null

  function sampleGlyph() {
    const em = emEl()
    if (!em) return false
    const style = getComputedStyle(em)
    const text = em.textContent
    const size = parseFloat(style.fontSize)
    const off = document.createElement('canvas')
    const octx = off.getContext('2d', { willReadFrequently: true })
    const font = () => {
      octx.font = `${style.fontStyle || 'italic'} ${style.fontWeight} ${size}px ${style.fontFamily}`
    }
    font()
    const pad = Math.ceil(size * 0.6)
    off.width = Math.ceil(octx.measureText(text).width + pad * 2)
    off.height = Math.ceil(size * 1.7)
    font()
    octx.fillStyle = '#fff'
    octx.textBaseline = 'alphabetic'
    octx.fillText(text, pad, Math.round(size * 1.15))

    const data = octx.getImageData(0, 0, off.width, off.height).data
    const pts = []
    let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9
    for (let y = 0; y < off.height; y++) {
      for (let x = 0; x < off.width; x++) {
        if (data[(y * off.width + x) * 4 + 3] > 128) {
          pts.push([x + Math.random(), y + Math.random()])
          if (x < minX) minX = x
          if (y < minY) minY = y
          if (x > maxX) maxX = x
          if (y > maxY) maxY = y
        }
      }
    }
    if (!pts.length) return false

    const er = em.getBoundingClientRect()
    const hr = hero.getBoundingClientRect()
    const bc = [(minX + maxX) / 2, (minY + maxY) / 2]
    const ec = [er.left + er.width / 2 - hr.left, er.top + er.height / 2 - hr.top]

    // shuffle so the "granted" particles are a fair sample of the field
    for (let i = pts.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0
      const tmp = pts[i]
      pts[i] = pts[j]
      pts[j] = tmp
    }

    const granted = Math.min(pts.length, Math.floor(count * 0.5))
    for (let i = 0; i < count; i++) {
      if (i < granted) {
        tgt[i * 4] = (ec[0] + (pts[i][0] - bc[0])) * dpr
        tgt[i * 4 + 1] = (ec[1] + (pts[i][1] - bc[1])) * dpr
        tgt[i * 4 + 2] = 1
        tgt[i * 4 + 3] = Math.random()
      } else {
        tgt[i * 4 + 2] = 0
      }
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, tgtBuf)
    gl.bufferData(gl.ARRAY_BUFFER, tgt, gl.DYNAMIC_DRAW)
    return true
  }

  function beginMorph() {
    if (morphing) return
    if (!sampleGlyph()) return
    morphing = true
    morphStart = performance.now()
    const em = emEl()
    if (em) {
      em.style.transition = 'opacity 0.7s ease'
      em.style.opacity = '0'
    }
  }

  sizeCanvas()
  const ready = () => {
    sizeCanvas()
    fadeTimer = setTimeout(beginMorph, 1800)
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(ready)
  else setTimeout(ready, 300)

  // ---------- touch / shimmer ----------
  const touch = { x: -9e4, y: -9e4, amp: 0 }
  const onTouch = (e) => {
    if (e.pointerType !== 'touch') return
    const r = canvas.getBoundingClientRect()
    touch.x = (e.clientX - r.left) * dpr
    touch.y = (e.clientY - r.top) * dpr
    touch.amp = e.type === 'pointerdown' ? 1 : Math.min(1, touch.amp + 0.3)
  }
  window.addEventListener('pointerdown', onTouch, { passive: true })
  window.addEventListener('pointermove', onTouch, { passive: true })

  // ---------- render loop ----------
  let running = false
  let rafId = 0
  let visible = false
  let fade = 0
  const t0 = performance.now()

  const frame = (now) => {
    rafId = 0
    if (!visible) { running = false; return }
    fade = Math.min(1, fade + 0.016)

    const heroRect = hero.getBoundingClientRect()
    const morph = morphing ? Math.min(1, (now - morphStart) / 1900) : 0
    touch.amp *= 0.965

    gl.uniform1f(uT, (now - t0) / 1000)
    gl.uniform2f(uMouse, (pointer.x - heroRect.left) * dpr, (pointer.y - heroRect.top) * dpr)
    gl.uniform2f(uTouch, touch.x, touch.y)
    gl.uniform1f(uTouchAmp, touch.amp)
    gl.uniform1f(uFade, fade * fade)
    gl.uniform1f(uMorph, morph)

    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.POINTS, 0, count)
    rafId = requestAnimationFrame(frame)
  }

  const start = () => {
    if (!running) { running = true; rafId = requestAnimationFrame(frame) }
  }

  const setVisible = (v) => {
    visible = v && !document.hidden
    if (visible) start()
  }

  const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.02 })
  io.observe(canvas)

  const onVis = () => setVisible(true)
  document.addEventListener('visibilitychange', onVis)

  const onResize = () => {
    sizeCanvas()
    if (morphing) sampleGlyph()
  }
  window.addEventListener('resize', onResize)

  const onLost = (e) => {
    e.preventDefault()
    setVisible(false)
    canvas.style.opacity = '0'
    const em = emEl()
    if (em) em.style.opacity = ''
  }
  canvas.addEventListener('webglcontextlost', onLost)

  return {
    destroy() {
      setVisible(false)
      if (rafId) cancelAnimationFrame(rafId)
      clearTimeout(fadeTimer)
      window.removeEventListener('pointerdown', onTouch)
      window.removeEventListener('pointermove', onTouch)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVis)
      io.disconnect()
      canvas.removeEventListener('webglcontextlost', onLost)
      const em = emEl()
      if (em) {
        em.style.transition = ''
        em.style.opacity = ''
      }
    },
  }
}
