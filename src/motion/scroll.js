// Rolagem até uma seção usando a rolagem nativa do navegador (leve e sem travar).

const OFFSET = 96 // espaço para o menu flutuante

// target: 'top', o id de uma seção ou um elemento
export function scrollToTarget(target, { immediate = false } = {}) {
  const behavior = immediate || document.documentElement.dataset.motion === 'off' ? 'auto' : 'smooth'
  if (target === 'top') {
    window.scrollTo({ top: 0, behavior })
    return
  }
  const el = typeof target === 'string' ? document.getElementById(target) : target
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - OFFSET
  window.scrollTo({ top: Math.max(0, top), behavior })
}
