import { useLocation } from 'react-router-dom'
import { strings } from './strings.js'

// O idioma vem da rota: /en... é inglês, o resto é português.
export function useLang() {
  const { pathname } = useLocation()
  const lang = pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'pt'
  return { lang, t: strings[lang] }
}

// Monta uma rota no idioma pedido. Ex.: localePath('en', '/projects/x') -> '/en/projects/x'
export function localePath(lang, path = '/') {
  if (lang === 'en') return path === '/' ? '/en' : `/en${path}`
  return path
}

// A mesma página no outro idioma
export function switchLangPath(pathname, to) {
  const base = pathname === '/en' ? '/' : pathname.startsWith('/en/') ? pathname.slice(3) : pathname
  return localePath(to, base)
}

// Escolhe o texto do idioma quando o valor é { pt, en }
export const pick = (value, lang) => (typeof value === 'string' ? value : value[lang])
