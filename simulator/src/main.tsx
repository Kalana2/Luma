import React from 'react'
import ReactDOM from 'react-dom/client'
import { CssBaseline } from '@mui/material'
import App from './App'

const outfit = document.createElement('link')
outfit.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap'
outfit.rel = 'stylesheet'
document.head.appendChild(outfit)

const inter = document.createElement('link')
inter.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
inter.rel = 'stylesheet'
document.head.appendChild(inter)

const styleEl = document.createElement('style')
styleEl.textContent = `
  * {
    scrollbar-width: thin;
    scrollbar-color: #CBD5E1 transparent;
  }
  *::-webkit-scrollbar { width: 4px; }
  *::-webkit-scrollbar-track { background: transparent; }
  *::-webkit-scrollbar-thumb {
    background: #CBD5E1;
    border-radius: 4px;
  }
  *::-webkit-scrollbar-thumb:hover { background: #94A3B8; }

  body { background: #F8FAFC; overflow-x: hidden; }

  :focus-visible {
    outline: 2px solid #2563EB;
    outline-offset: 2px;
    border-radius: 4px;
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }

  /* ---- PAGE TRANSITIONS ---- */
  @keyframes fade-slide-up {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fade-slide-right {
    from { opacity: 0; transform: translateX(-24px); }
    to { opacity: 1; transform: translateX(0); }
  }
  .page-enter { animation: fade-slide-up 0.5s cubic-bezier(0.22, 0.61, 0.36, 1) both; }
  .page-enter-right { animation: fade-slide-right 0.45s cubic-bezier(0.22, 0.61, 0.36, 1) both; }

  /* ---- CARD ENTRANCE ---- */
  @keyframes card-enter {
    from { opacity: 0; transform: translateY(24px) scale(0.96); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  .card-stagger { animation: card-enter 0.5s cubic-bezier(0.22, 0.61, 0.36, 1) both; }

  /* ---- SHIMMER ---- */
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  /* ---- COLLAPSE ---- */
  @keyframes collapse-in {
    from { opacity: 0; max-height: 0; }
    to { opacity: 1; max-height: 2000px; }
  }
  .collapse-enter { overflow: hidden; animation: collapse-in 0.4s ease-out both; }
`
document.head.appendChild(styleEl)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CssBaseline />
    <App />
  </React.StrictMode>
)
