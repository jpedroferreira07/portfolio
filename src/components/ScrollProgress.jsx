import { useCallback, useRef } from 'react'
import { useScrollProgress } from '../hooks/useScrollProgress.js'

// Barra fina no topo que enche conforme a página rola
export default function ScrollProgress() {
  const bar = useRef(null)
  const onFrame = useCallback((progress) => {
    if (bar.current) bar.current.style.transform = `scaleX(${progress})`
  }, [])
  useScrollProgress(onFrame)

  return (
    <div className="progress" aria-hidden="true">
      <div ref={bar} className="progress-bar" />
    </div>
  )
}
