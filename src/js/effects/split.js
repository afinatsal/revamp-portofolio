// Split every text node inside a container into <span class="word"> /
// <span class="char"> tokens so individual characters can be animated.
// Whitespace runs are preserved as plain text nodes between words. Nested
// inline elements (like <em>) are descended into and kept in place.
export function splitWordsChars(root, wordClass = 'word', charClass = 'char') {
  const chars = []
  if (!root) return chars

  const isWrapped = (el) =>
    el.classList &&
    (el.classList.contains(wordClass) || el.classList.contains(charClass))

  ;(function walk(el) {
    for (const node of [...el.childNodes]) {
      if (node.nodeType === Node.TEXT_NODE) {
        if (isWrapped(node.parentElement)) continue
        const tokens = node.textContent.split(/(\s+)/)
        const frag = document.createDocumentFragment()
        for (const tok of tokens) {
          if (tok === '') continue
          if (/^\s+$/.test(tok)) {
            frag.append(tok)
            continue
          }
          const w = document.createElement('span')
          w.className = wordClass
          for (const ch of tok) {
            const c = document.createElement('span')
            c.className = charClass
            c.textContent = ch
            w.append(c)
            chars.push(c)
          }
          frag.append(w)
        }
        node.replaceWith(frag)
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // the rotating typewriter region is managed separately
        if (node.classList && node.classList.contains('typed-wrap')) continue
        walk(node)
      }
    }
  })(root)

  return chars
}
