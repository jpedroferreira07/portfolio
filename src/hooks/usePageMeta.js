import { useEffect } from 'react'

// Atualiza título, descrição e idioma do documento
export function usePageMeta({ title, description, lang }) {
  useEffect(() => {
    if (title) document.title = title
    if (lang) document.documentElement.lang = lang
    if (description) {
      const meta = document.querySelector('meta[name="description"]')
      if (meta) meta.setAttribute('content', description)
    }
  }, [title, description, lang])
}
