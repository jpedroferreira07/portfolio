import { Download } from 'lucide-react'
import { localePath, useLang } from '../i18n/lang.js'
import { profile } from '../data/profile.js'
import { asset } from '../data/projects.js'
import { useSectionNav } from '../hooks/useSectionNav.js'
import { SECTIONS } from './Nav.jsx'

export default function Footer() {
  const { lang, t } = useLang()
  const goTo = useSectionNav()

  const go = (id) => (e) => {
    e.preventDefault()
    goTo(id)
  }

  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-id">
            <p className="foot-brand">{profile.name}</p>
            <p className="foot-line">{profile.city}</p>
            <p className="foot-line">
              <a className="foot-mail" href={`mailto:${profile.email}`}>
                {profile.email}
              </a>
            </p>
          </div>

          <nav className="foot-col" aria-label={t.footer.nav}>
            <ul>
              {SECTIONS.map((id) => (
                <li key={id}>
                  <a href={`#${localePath(lang, '/')}`} onClick={go(id)}>
                    {t.nav[id]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="foot-col">
            <ul aria-label={t.footer.social}>
              <li>
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                  LinkedIn<span className="sr-only"> {t.contact.newTab}</span>
                </a>
              </li>
              <li>
                <a href={profile.github} target="_blank" rel="noopener noreferrer">
                  GitHub<span className="sr-only"> {t.contact.newTab}</span>
                </a>
              </li>
              <li>
                <a className="foot-cv" href={asset(profile.cv)} download>
                  <Download size={15} aria-hidden="true" />
                  {t.footer.cv}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="foot-end">
          <p>
            © {new Date().getFullYear()} {t.footer.rights} {profile.name}
          </p>
        </div>
      </div>
    </footer>
  )
}
