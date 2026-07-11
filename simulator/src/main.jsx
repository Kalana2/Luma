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
    scrollbar-color: rgba(59,130,246,0.25) transparent;
  }
  *::-webkit-scrollbar { width: 4px; }
  *::-webkit-scrollbar-track { background: transparent; }
  *::-webkit-scrollbar-thumb {
    background: rgba(59,130,246,0.25);
    border-radius: 4px;
  }
  *::-webkit-scrollbar-thumb:hover { background: rgba(59,130,246,0.4); }

  body { background: #0B1121; overflow-x: hidden; }

  @keyframes status-pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.5); opacity: 0.5; }
  }

  @keyframes floating {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-6px); }
  }

  @keyframes slide-up-stagger {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  @keyframes rotate-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes float-orb-1 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(60px, -40px) scale(1.1); }
    66% { transform: translate(-30px, -80px) scale(0.95); }
  }

  @keyframes float-orb-2 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(-50px, 30px) scale(1.08); }
    66% { transform: translate(40px, 60px) scale(0.92); }
  }
`
document.head.appendChild(styleEl)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CssBaseline />
    <App />
  </React.StrictMode>
)
