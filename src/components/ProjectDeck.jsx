import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { localePath, useLang } from '../i18n/lang.js'
import { asset, projects } from '../data/projects.js'
import { useMotion } from '../hooks/useMotion.jsx'

// Pilha de telas dos projetos ao lado do título.
// A cada poucos segundos o card da frente vai para trás e o próximo aparece.
// Só usa transform/opacity (leve) e para quando sai da tela, quando o mouse
// está em cima ou quando as animações estão desligadas.
const POSES = [
  { x: 0, y: 0, r: -2, s: 1, o: 1 },
  { x: 9, y: -10, r: 3, s: 0.92, o: 0.7 },
  { x: 18, y: -20, r: 7, s: 0.84, o: 0.4 },
]
const INTERVAL = 4200

export default function ProjectDeck() {
  const { lang, t } = useLang()
  const { off } = useMotion()
  const [active, setActive] = useState(0)
  const [hover, setHover] = useState(false)
  const [visible, setVisible] = useState(true)
  const ref = useRef(null)
  const n = projects.length

  // só gira quando o deck está na tela
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (off || hover || !visible || n < 2) return
    const id = setInterval(() => {
      if (!document.hidden) setActive((a) => (a + 1) % n)
    }, INTERVAL)
    return () => clearInterval(id)
  }, [off, hover, visible, n])

  const current = projects[active][lang]
  const currentTo = localePath(lang, `/projects/${projects[active].slug}`)

  return (
    <div
      ref={ref}
      className="deck"
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      <div className="deck-stage">
        {projects.map((p, i) => {
          const pos = (i - active + n) % n
          const pose = POSES[Math.min(pos, POSES.length - 1)]
          const tx = p[lang]
          return (
            <Link
              key={p.slug}
              to={localePath(lang, `/projects/${p.slug}`)}
              className={`deck-card ${pos === 0 ? 'is-front' : ''}`}
              style={{
                zIndex: n - pos,
                opacity: pose.o,
                transform: `translate(${pose.x}%, ${pose.y}%) rotate(${pose.r}deg) scale(${pose.s})`,
              }}
              tabIndex={pos === 0 ? 0 : -1}
              aria-hidden={pos === 0 ? undefined : true}
              aria-label={`${t.projects.view}: ${tx.title}`}
            >
              <span className="deck-bar" aria-hidden="true">
                <i />
                <i />
                <i />
                <span className="deck-url">{p.slug}</span>
              </span>
              <img src={asset(p.image)} alt="" width="1440" height="900" decoding="async" />
            </Link>
          )
        })}
      </div>

      <div className="deck-caption">
        <div className="deck-info" aria-live="polite">
          <span className="deck-area">{current.area}</span>
          <Link className="deck-title" to={currentTo}>
            {current.title} <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <div className="deck-dots" role="group" aria-label={t.projects.label}>
          {projects.map((p, i) => (
            <button
              key={p.slug}
              type="button"
              className={i === active ? 'is-on' : ''}
              aria-label={p[lang].title}
              aria-pressed={i === active}
              onClick={() => setActive(i)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
