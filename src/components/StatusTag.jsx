import { useLang } from '../i18n/lang.js'

// Etiqueta de status do projeto: Demo (hospedada no portfólio) ou No ar (GitHub Pages)
export default function StatusTag({ status }) {
  const { t } = useLang()
  return (
    <span className={`status status-${status}`}>
      <span className="status-dot" aria-hidden="true" />
      {t.status[status] ?? status}
    </span>
  )
}
