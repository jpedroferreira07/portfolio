import { useLayoutEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { localePath, useLang } from '../i18n/lang.js'
import { asset, projectLabel, projects, projectUrl } from '../data/projects.js'
import { usePageMeta } from '../hooks/usePageMeta.js'
import { useMotion } from '../hooks/useMotion.jsx'
import { gsap } from '../motion/gsap.js'
import StatusTag from '../components/StatusTag.jsx'
import Reveal from '../components/Reveal.jsx'
import HoloFrame from '../components/HoloFrame.jsx'
import NotFound from './NotFound.jsx'

export default function ProjectPage() {
  const { slug } = useParams()
  const { lang, t } = useLang()
  const { off } = useMotion()
  const ref = useRef(null)
  const project = projects.find((p) => p.slug === slug)
  const tx = project?.[lang]

  usePageMeta({
    title: tx ? `${tx.title} - ${t.metaTitle}` : t.metaTitle,
    description: tx?.summary ?? t.metaDesc,
    lang: t.htmlLang,
  })

  useLayoutEffect(() => {
    if (off || !project) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.05 })
      tl.from('.proj-title', { y: 36, autoAlpha: 0, duration: 0.9, ease: 'power3.out' })
        .from('.proj-head > :not(.proj-title)', { y: 20, autoAlpha: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08 }, '-=0.5')
      gsap.from('.proj-shot', {
        y: 80,
        autoAlpha: 0,
        scale: 0.94,
        duration: 1.3,
        ease: 'power4.out',
        delay: 0.3,
      })
    }, ref)
    return () => ctx.revert()
  }, [off, lang, project])

  if (!project) return <NotFound />

  return (
    <article ref={ref} className="proj">
      <div className="wrap">
        <Link className="back" to={localePath(lang, '/')} state={{ scrollTo: 'projects' }}>
          <ArrowLeft size={16} aria-hidden="true" /> {t.project.back}
        </Link>

        <header className="proj-head">
          <p className="label">{tx.area}</p>
          <h1 className="proj-title">
            {tx.title}
          </h1>
          <p className="proj-sum">{tx.summary}</p>
          <div className="proj-actions">
            <a className="btn" href={projectUrl(project)} target="_blank" rel="noopener noreferrer">
              {projectLabel(project, t)}
              <ArrowUpRight size={16} aria-hidden="true" />
              <span className="sr-only">{t.contact.newTab}</span>
            </a>
            {project.repo && project.repo !== projectUrl(project) && (
              <a className="btn ghost" href={project.repo} target="_blank" rel="noopener noreferrer">
                {t.projects.code}
                <span className="sr-only">{t.contact.newTab}</span>
              </a>
            )}
            <StatusTag status={project.status} />
          </div>
          {project.status === 'demo' && <p className="note">{t.project.demoNote}</p>}
        </header>

        <div className="proj-shot">
          <a href={projectUrl(project)} target="_blank" rel="noopener noreferrer" tabIndex={-1}>
            <HoloFrame max={5}>
              <img className="parallax" src={asset(project.image)} alt={tx.title} width="1440" height="900" />
            </HoloFrame>
          </a>
        </div>

        <div className="grid proj-grid">
          <h2 className="label">{t.project.about}</h2>
          <div className="col">
            <Reveal>
              <p className="lede">{tx.context}</p>
            </Reveal>

            <h3 className="sub">{t.project.highlights}</h3>
            <ol className="hl">
              {tx.highlights.map((h, i) => (
                <Reveal as="li" key={h} delay={i * 60}>
                  <span className="hl-n">{String(i + 1).padStart(2, '0')}</span>
                  <span>{h}</span>
                </Reveal>
              ))}
            </ol>

            <h3 className="sub">{t.project.stack}</h3>
            <Reveal as="ul" className="pills">
              {project.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </Reveal>
          </div>
        </div>
      </div>
    </article>
  )
}
