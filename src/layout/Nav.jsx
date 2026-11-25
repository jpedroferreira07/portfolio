import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, Pause, Play, X } from 'lucide-react'
import { localePath, switchLangPath, useLang } from '../i18n/lang.js'
import { useScrollSpy } from '../hooks/useScrollSpy.js'
import { useSectionNav } from '../hooks/useSectionNav.js'
import { useMotion } from '../hooks/useMotion.jsx'
import { profile } from '../data/profile.js'
import { asset } from '../data/projects.js'
import { scrollToTarget } from '../motion/scroll.js'

export const SECTIONS = ['about', 'projects', 'experience', 'contact']

// Menu em cápsula flutuante, com uma pílula que desliza até a seção atual
export default function Nav() {
  const { lang, t } = useLang()
  const { pathname } = useLocation()
  const { paused, reduced, toggle } = useMotion()
  const goTo = useSectionNav()
  const navRef = useRef(null)
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [pill, setPill] = useState(null)
  const isHome = pathname === localePath(lang, '/')
  const active = useScrollSpy(SECTIONS, isHome)

  // O menu fica sempre fixo no topo; só muda o fundo depois de rolar um pouco
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  // Posição da pílula atrás do link ativo
  useLayoutEffect(() => {
    const measure = () => {
      const el = navRef.current?.querySelector('a[aria-current]')
      setPill(el ? { x: el.offsetLeft, w: el.offsetWidth } : null)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [active, lang])

  // Fecha o menu ao trocar de página e com Esc
  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const link = (id) => (
    <a
      key={id}
      href={`#${localePath(lang, '/')}`}
      aria-current={active === id ? 'true' : undefined}
      onClick={(e) => {
        e.preventDefault()
        setOpen(false)
        goTo(id)
      }}
    >
      {t.nav[id]}
    </a>
  )

  const langSwitch = (
    <div className="lang" role="group" aria-label={t.langLabel}>
      {['pt', 'en'].map((l) => (
        <Link
          key={l}
          to={switchLangPath(pathname, l)}
          aria-current={lang === l ? 'true' : undefined}
          lang={l === 'pt' ? 'pt-BR' : 'en'}
        >
          {l.toUpperCase()}
        </Link>
      ))}
    </div>
  )

  const motionButton = !reduced && (
    <button
      type="button"
      className="icon-b"
      onClick={toggle}
      aria-pressed={paused}
      aria-label={paused ? t.motion.play : t.motion.pause}
      title={paused ? t.motion.play : t.motion.pause}
    >
      {paused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}
    </button>
  )

  return (
    <header className={`top ${scrolled ? 'is-scrolled' : ''} ${open ? 'is-open' : ''}`}>
      <div className="capsule">
        <Link
          className="mark"
          to={localePath(lang, '/')}
          aria-label={t.home}
          onClick={(e) => {
            // já na página inicial: só volta ao topo, sem recarregar a rota
            if (isHome) {
              e.preventDefault()
              scrollToTarget('top')
            }
          }}
        >
          JPF
        </Link>
        <nav ref={navRef} className="nav" aria-label={t.menu}>
          {pill && (
            <span className="nav-pill" aria-hidden="true" style={{ width: pill.w, transform: `translateX(${pill.x}px)` }} />
          )}
          {SECTIONS.map(link)}
        </nav>
        <a className="cv-b" href={asset(profile.cv)} download aria-label={t.footer.cv} title={t.footer.cv}>
          CV
        </a>
        <div className="capsule-end">
          {langSwitch}
          {motionButton}
          <button
            type="button"
            className="menu-b"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={16} aria-hidden="true" /> : <Menu size={16} aria-hidden="true" />}
            {open ? t.close : t.menu}
          </button>
        </div>
      </div>
      <div id="mobile-menu" className="menu" hidden={!open}>
        <nav aria-label={t.menu}>
          {SECTIONS.map(link)}
          <a className="menu-cv" href={asset(profile.cv)} download>
            {t.footer.cv}
          </a>
          <div className="menu-lang">{langSwitch}</div>
        </nav>
      </div>
    </header>
  )
}
