import { useEffect, useLayoutEffect, useRef } from 'react'
import { pick, useLang } from '../i18n/lang.js'
import { useSectionNav } from '../hooks/useSectionNav.js'
import { useMotion } from '../hooks/useMotion.jsx'
import { gsap } from '../motion/gsap.js'
import { stacks } from '../data/profile.js'
import Marquee from '../components/Marquee.jsx'
import ProjectDeck from '../components/ProjectDeck.jsx'

// Topo da página: também é a seção "Sobre" do menu
export default function Hero() {
  const { lang, t } = useLang()
  const { off } = useMotion()
  const goTo = useSectionNav()
  const ref = useRef(null)
  const go = (id) => (e) => {
    e.preventDefault()
    goTo(id)
  }

  // entrada leve: cada bloco sobe e aparece depois da cortina
  useLayoutEffect(() => {
    if (off) return
    const ctx = gsap.context(() => {
      gsap.from('.hero-text > *', {
        y: 28,
        autoAlpha: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.09,
        delay: 0.1,
      })
      gsap.from('.deck', { y: 50, autoAlpha: 0, duration: 1.1, ease: 'power3.out', delay: 0.25 })
      gsap.from('.hero .marquee', { autoAlpha: 0, duration: 0.8, delay: 0.4 })
    }, ref)
    return () => ctx.revert()
  }, [off, lang])

  // fora da tela: pausa a faixa de stacks e o flutuar dos cards (economiza processamento)
  useEffect(() => {
    const el = ref.current
    const io = new IntersectionObserver(([e]) => el.classList.toggle('is-paused', !e.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section ref={ref} id="about" className="hero" aria-labelledby="hero-title">
      <div className="wrap hero-in">
        <div className="hero-text">
          <h1 id="hero-title" className="hero-title">
            {t.hero.title}
          </h1>
          <p className="hero-lead">{t.hero.lead}</p>
          <div className="hero-cta">
            <a className="btn" href="#projects" onClick={go('projects')}>
              {t.hero.projects}
            </a>
            <a className="btn ghost" href="#contact" onClick={go('contact')}>
              {t.hero.talk}
            </a>
          </div>
          <p className="avail">
            <span className="avail-dot" aria-hidden="true" />
            {t.hero.avail}
          </p>
        </div>
        <ProjectDeck />
      </div>
      <Marquee items={stacks.map((s) => pick(s, lang))} />
    </section>
  )
}
