import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLang } from '../i18n/lang.js'
import { usePageMeta } from '../hooks/usePageMeta.js'
import { scrollToTarget } from '../motion/scroll.js'
import Hero from '../sections/Hero.jsx'
import Featured from '../sections/Featured.jsx'
import Experience from '../sections/Experience.jsx'
import Contact from '../sections/Contact.jsx'

export default function Home() {
  const { t } = useLang()
  const { state, pathname } = useLocation()
  const navigate = useNavigate()

  usePageMeta({ title: t.metaTitle, description: t.metaDesc, lang: t.htmlLang })

  // Veio de outra página pedindo para rolar até uma seção
  useEffect(() => {
    const id = state?.scrollTo
    if (!id) return
    // espera a página nova aparecer embaixo da cortina e então rola
    const timer = setTimeout(() => {
      scrollToTarget(id, { immediate: true })
      navigate(pathname, { replace: true, state: null })
    }, 60)
    return () => clearTimeout(timer)
  }, [state, pathname, navigate])

  return (
    <>
      <Hero />
      <Featured />
      <Experience />
      <Contact />
    </>
  )
}
