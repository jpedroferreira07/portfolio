import { useEffect, useState } from 'react'

const query = '(prefers-reduced-motion: reduce)'

// true quando o sistema pede menos movimento
export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  return reduced
}
