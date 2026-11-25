import { ArrowUpRight, Mail } from 'lucide-react'
import { useLang } from '../i18n/lang.js'
import { profile } from '../data/profile.js'
import Reveal from '../components/Reveal.jsx'
import SectionTitle from '../components/SectionTitle.jsx'

// A biblioteca de ícones não traz as marcas, então o logo do LinkedIn é desenhado aqui.
const LinkedinIcon = (props) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
  </svg>
)

export default function Contact() {
  const { t } = useLang()
  const links = [
    { k: t.contact.email, v: profile.email, href: `mailto:${profile.email}`, Icon: Mail },
    { k: 'LinkedIn', v: 'in/joaopedroferreira-', href: profile.linkedin, Icon: LinkedinIcon, external: true },
  ]

  return (
    <section id="contact" className="sec contact" aria-labelledby="contact-title">
      <div className="contact-glow" aria-hidden="true" />
      <div className="wrap">
        <SectionTitle id="contact-title" text={t.contact.label} caption={t.contact.caption} />
        <Reveal as="ul" className="contact-list" delay={100}>
          {links.map(({ k, v, href, Icon, external }) => (
            <li key={k}>
              <a
                className="contact-row"
                href={href}
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                <span className="contact-icon">
                  <Icon size={22} width={22} height={22} />
                </span>
                <span className="contact-text-col">
                  <span className="contact-k">{k}</span>
                  <span className="contact-v">{v}</span>
                </span>
                <ArrowUpRight className="contact-arrow" size={18} aria-hidden="true" />
                {external && <span className="sr-only">{t.contact.newTab}</span>}
              </a>
            </li>
          ))}
        </Reveal>

      </div>
    </section>
  )
}
