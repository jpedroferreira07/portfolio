import { useCallback, useRef, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { useLang } from '../i18n/lang.js'
import { useScrollProgress } from '../hooks/useScrollProgress.js'
import { scrollToTarget } from '../motion/scroll.js'

const R = 22
const C = 2 * Math.PI * R

// Botão de voltar ao topo com um anel que mostra quanto da página já foi lido.
// O anel é atualizado direto no DOM; o React só renderiza quando o botão aparece ou some.
export default function BackToTop() {
  const { t } = useLang()
  const ring = useRef(null)
  const [visible, setVisible] = useState(false)
  const [atEnd, setAtEnd] = useState(false)

  const onFrame = useCallback((progress, y) => {
    if (ring.current) ring.current.style.strokeDashoffset = String(C * (1 - progress))
    setVisible((v) => (v === y > 600 ? v : y > 600))
    // no final da página o botão balança para chamar atenção
    setAtEnd((v) => (v === progress > 0.985 ? v : progress > 0.985))
  }, [])
  useScrollProgress(onFrame)

  return (
    <button
      type="button"
      className={`to-top ${visible ? 'is-visible' : ''} ${atEnd ? 'is-end' : ''}`}
      onClick={() => scrollToTarget('top')}
      aria-label={t.footer.top}
      tabIndex={visible ? 0 : -1}
    >
      <svg viewBox="0 0 52 52" aria-hidden="true">
        <circle className="ring-bg" cx="26" cy="26" r={R} />
        <circle ref={ring} className="ring" cx="26" cy="26" r={R} strokeDasharray={C} strokeDashoffset={C} />
      </svg>
      <ArrowUp size={18} aria-hidden="true" />
    </button>
  )
}
