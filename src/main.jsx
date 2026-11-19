import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import './index.css'
import App from './App.jsx'
import { MotionProvider, readPaused } from './hooks/useMotion.jsx'

// Marca o estado das animações antes do primeiro desenho, para não piscar
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
document.documentElement.dataset.motion = reduced || readPaused() ? 'off' : 'on'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <MotionProvider>
        <App />
      </MotionProvider>
    </HashRouter>
  </StrictMode>,
)
