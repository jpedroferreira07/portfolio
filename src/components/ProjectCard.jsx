import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { localePath, useLang } from '../i18n/lang.js'
import { asset, projectLabel, projectUrl } from '../data/projects.js'
import StatusTag from './StatusTag.jsx'
import HoloFrame from './HoloFrame.jsx'

// Card de projeto: imagem holográfica de um lado e texto do outro
export default function ProjectCard({ project, index, total }) {
  const { lang, t } = useLang()
  const tx = project[lang]
  const to = localePath(lang, `/projects/${project.slug}`)
  const n = (i) => String(i).padStart(2, '0')

  return (
    <article className="work-card">
      <Link className="work-media" to={to} tabIndex={-1} aria-hidden="true">
        <HoloFrame>
          <img
            className="parallax"
            src={asset(project.image)}
            alt=""
            loading="lazy"
            decoding="async"
            width="1440"
            height="900"
          />
        </HoloFrame>
      </Link>
      <div className="work-body">
        <span className="work-index" aria-hidden="true">
          {n(index + 1)} / {n(total)}
        </span>
        <p className="card-area">{tx.area}</p>
        <h3 className="card-title">
          <Link to={to}>{tx.title}</Link>
        </h3>
        <p className="card-sum">{tx.summary}</p>
        <ul className="pills small">
          {project.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
        <div className="card-foot">
          <StatusTag status={project.status} />
          <div className="card-actions">
            <a className="link-arrow" href={projectUrl(project)} target="_blank" rel="noopener noreferrer">
              {projectLabel(project, t)}
              <ArrowUpRight size={16} aria-hidden="true" />
              <span className="sr-only">
                : {tx.title} {t.contact.newTab}
              </span>
            </a>
            <Link className="btn" to={to}>
              {t.projects.view}
              <span className="sr-only">: {tx.title}</span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
