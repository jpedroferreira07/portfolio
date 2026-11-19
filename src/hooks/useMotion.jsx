import { createContext, useContext, useEffect, useState } from 'react'
import { useReducedMotion } from './useReducedMotion.js'

// Controla as animações do site: ficam desligadas quando o sistema pede menos
// movimento ou quando a pessoa aperta o botão de pausar (a escolha fica salva).

const MotionContext = createContext({ off: false, paused: false, reduced: false, toggle: () => {} })

export function readPaused() {
  try {
    return localStorage.getItem('motion') === 'paused'
  } catch {
    return false
  }
}

export function MotionProvider({ children }) {
  const reduced = useReducedMotion()
  const [paused, setPaused] = useState(readPaused)
  const off = reduced || paused

  useEffect(() => {
    document.documentElement.dataset.motion = off ? 'off' : 'on'
  }, [off])

  useEffect(() => {
    try {
      localStorage.setItem('motion', paused ? 'paused' : 'on')
    } catch {
      /* armazenamento indisponível */
    }
  }, [paused])

  const value = { off, paused, reduced, toggle: () => setPaused((p) => !p) }
  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useMotion = () => useContext(MotionContext)
