import { useEffect } from 'react'

// Chama `onFrame(progress, y)` no máximo uma vez por quadro enquanto a página rola.
// Não usa estado do React: quem chama atualiza o DOM direto (bem mais leve).
// A altura rolável é guardada em cache e só recalculada quando a página muda de
// tamanho; ler scrollHeight a cada quadro obrigaria o navegador a refazer o layout.
export function useScrollProgress(onFrame) {
  useEffect(() => {
    let raf = 0
    let max = 0
    const measure = () => {
      const h = document.documentElement
      max = h.scrollHeight - h.clientHeight
    }
    const read = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const y = window.scrollY
        onFrame(max > 0 ? Math.min(y / max, 1) : 0, y)
      })
    }
    const onResize = () => {
      measure()
      read()
    }
    measure()
    read()
    const ro = new ResizeObserver(onResize)
    ro.observe(document.body)
    window.addEventListener('scroll', read, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('scroll', read)
      window.removeEventListener('resize', onResize)
    }
  }, [onFrame])
}
