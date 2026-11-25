import { useLayoutEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLang } from '../i18n/lang.js'
import { projects } from '../data/projects.js'
import { useMotion } from '../hooks/useMotion.jsx'
import { gsap } from '../motion/gsap.js'
import ProjectCard from '../components/ProjectCard.jsx'
import SectionTitle from '../components/SectionTitle.jsx'

// Projetos.
// No computador: a seção fica presa na tela e os cards passam de lado como um
// carrossel 3D (girando ao entrar e ao sair) enquanto você rola.
// No celular: cada card "levanta" da mesa em 3D ao entrar na tela.
// Sem animações: lista simples.
export default function Featured() {
  const { lang, t } = useLang()
  const { off } = useMotion()
  const ref = useRef(null)
  const railRef = useRef(null) // gatilho da rolagem lateral, usado pelos botões

  useLayoutEffect(() => {
    if (off) return
    const section = ref.current
    const mm = gsap.matchMedia()

    // ----- computador: carrossel horizontal 3D -----
    mm.add('(min-width: 900px)', () => {
      section.classList.add('is-rail')
      const track = section.querySelector('.work-track')
      const cards = gsap.utils.toArray(section.querySelectorAll('.work-card'))
      const bar = section.querySelector('.work-bar span')
      const count = section.querySelector('.work-count b')
      const distance = () => track.scrollWidth - window.innerWidth

      let lastCount = ''

      // trilho anda para o lado enquanto a seção fica presa
      const slide = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        // pixels inteiros: o texto não cai em meio pixel (isso deixa a letra embaçada)
        modifiers: { x: gsap.utils.unitize((v) => Math.round(v)) },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${distance() + window.innerHeight * 0.2}`,
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (bar) bar.style.transform = `scaleX(${self.progress})`
            const c = String(Math.min(cards.length, Math.round(self.progress * (cards.length - 1)) + 1)).padStart(2, '0')
            if (count && c !== lastCount) {
              count.textContent = c
              lastCount = c
            }
          },
        },
      })

      railRef.current = slide.scrollTrigger

      // Efeito de profundidade (coverflow): só a IMAGEM gira e muda de tamanho.
      // O texto do card nunca é girado nem escalado, só se move em pixels inteiros,
      // porque o navegador redesenha texto transformado de forma suavizada (embaçada).
      // (o gatilho é o <li>, que não se mexe)
      cards.forEach((card) => {
        const slot = card.parentElement
        const media = card.querySelector('.work-media')
        gsap.fromTo(
          media,
          { rotateY: -24, scale: 0.9, transformPerspective: 1400 },
          {
            rotateY: 0,
            scale: 1,
            ease: 'power2.out',
            immediateRender: false,
            scrollTrigger: { trigger: slot, containerAnimation: slide, start: 'left right', end: 'center center', scrub: true },
          },
        )
        gsap.to(media, {
          rotateY: 24,
          scale: 0.9,
          transformPerspective: 1400,
          ease: 'power2.in',
          immediateRender: false,
          scrollTrigger: { trigger: slot, containerAnimation: slide, start: 'center center', end: 'right left', scrub: true },
        })
      })

      return () => {
        railRef.current = null
        section.classList.remove('is-rail')
      }
    })

    return () => mm.revert()
  }, [off, lang])

  // vai para o projeto anterior (-1) ou seguinte (+1) rolando a página até o ponto dele
  const go = (dir) => {
    const st = railRef.current
    if (!st) return
    const last = projects.length - 1
    const now = Math.round(st.progress * last)
    const next = Math.min(last, Math.max(0, now + dir))
    window.scrollTo({ top: st.start + (next / last) * (st.end - st.start), behavior: 'smooth' })
  }

  return (
    <section ref={ref} id="projects" className="sec work" aria-labelledby="work-title">
      <div className="wrap">
        <SectionTitle id="work-title" text={t.projects.label} caption={t.projects.caption} />
      </div>
      <div className="work-pin">
        <ol className="work-track">
          {projects.map((p, i) => (
            <li key={p.slug} className="work-slide">
              <ProjectCard project={p} index={i} total={projects.length} />
            </li>
          ))}
        </ol>
        <div className="wrap work-meta">
          <button type="button" className="work-arrow" onClick={() => go(-1)} aria-label={t.projects.prev}>
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <button type="button" className="work-arrow" onClick={() => go(1)} aria-label={t.projects.next}>
            <ChevronRight size={18} aria-hidden="true" />
          </button>
          <span className="work-count" aria-hidden="true">
            <b>01</b> / {String(projects.length).padStart(2, '0')}
          </span>
          <span className="work-bar" aria-hidden="true">
            <span />
          </span>
          <span className="work-hint" aria-hidden="true">{t.projects.hint}</span>
        </div>
      </div>
    </section>
  )
}
