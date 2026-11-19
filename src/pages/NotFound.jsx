import { Link } from 'react-router-dom'
import { localePath, useLang } from '../i18n/lang.js'
import { usePageMeta } from '../hooks/usePageMeta.js'

export default function NotFound() {
  const { lang, t } = useLang()
  usePageMeta({ title: `404 · ${t.notFound.title}`, lang: t.htmlLang })

  return (
    <section className="notfound">
      <div className="wrap">
        <p className="label">404</p>
        <h1 className="display">{t.notFound.title}</h1>
        <Link className="btn" to={localePath(lang, '/')}>
          {t.notFound.back}
        </Link>
      </div>
    </section>
  )
}
