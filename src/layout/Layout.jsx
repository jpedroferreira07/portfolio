import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Nav from './Nav.jsx'
import Footer from './Footer.jsx'
import ScrollProgress from '../components/ScrollProgress.jsx'
import BackToTop from '../components/BackToTop.jsx'
import { useLang } from '../i18n/lang.js'
import { scrollToTarget } from '../motion/scroll.js'
import { ScrollTrigger } from '../motion/gsap.js'

export default function Layout() {
  const { t } = useLang()
  const location = useLocation()

  // Ao trocar de página, volta ao topo (a menos que vá rolar para uma seção)
  // e recalcula as animações de rolagem
  useEffect(() => {
    if (!location.state?.scrollTo) scrollToTarget('top', { immediate: true })
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
    // só quando muda a página, não quando o state é limpo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  // Recalcula as posições das animações quando a altura da página muda
  // (fontes e imagens terminando de carregar mudam a altura do conteúdo)
  useEffect(() => {
    let timer = 0
    let lastH = 0
    const refresh = () => {
      clearTimeout(timer)
      timer = setTimeout(() => ScrollTrigger.refresh(), 150)
    }
    const main = document.getElementById('main')
    const ro = new ResizeObserver(([entry]) => {
      const h = Math.round(entry.contentRect.height)
      if (Math.abs(h - lastH) > 2) {
        lastH = h
        refresh()
      }
    })
    if (main) ro.observe(main)
    document.fonts?.ready.then(refresh)
    window.addEventListener('load', refresh)
    return () => {
      clearTimeout(timer)
      ro.disconnect()
      window.removeEventListener('load', refresh)
    }
  }, [])

  const skip = (e) => {
    e.preventDefault()
    const main = document.getElementById('main')
    main?.focus()
    scrollToTarget(main)
  }

  return (
    <>
      <a className="skip" href="#main" onClick={skip}>
        {t.skip}
      </a>
      <ScrollProgress />
      <Nav />
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
    </>
  )
}
