import { useLocation, useNavigate } from 'react-router-dom'
import { localePath, useLang } from '../i18n/lang.js'
import { scrollToTarget } from '../motion/scroll.js'

// Rola até uma seção da página inicial.
// Com HashRouter não dá para usar href="#secao", então a rolagem é feita aqui.
export function useSectionNav() {
  const { lang } = useLang()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const home = localePath(lang, '/')

  return function goTo(id) {
    if (pathname === home) {
      scrollToTarget(id)
      return
    }
    navigate(home, { state: { scrollTo: id } })
  }
}
