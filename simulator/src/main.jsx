import React from 'react'
import ReactDOM from 'react-dom/client'
import { CssBaseline } from '@mui/material'
import App from './App'

const outfitLink = document.createElement('link')
outfitLink.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600;700;800;900&display=swap'
outfitLink.rel = 'stylesheet'
document.head.appendChild(outfitLink)

const interLink = document.createElement('link')
interLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'
interLink.rel = 'stylesheet'
document.head.appendChild(interLink)

const styleEl = document.createElement('style')
styleEl.textContent = `
  * {
    scrollbar-width: thin;
    scrollbar-color: rgba(47,102,144,0.5) transparent;
  }
  *::-webkit-scrollbar { width: 5px; }
  *::-webkit-scrollbar-track { background: transparent; }
  *::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #2F6690, #1E4D6E);
    border-radius: 3px;
  }
  *::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #FFA630, #E89620);
  }

  body {
    background: #060D1A;
    overflow-x: hidden;
  }

  @keyframes aurora {
    0% { background-position: 0% 50%; }
    25% { background-position: 100% 0%; }
    50% { background-position: 100% 100%; }
    75% { background-position: 0% 100%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes float-orb-1 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    25% { transform: translate(120px, -80px) scale(1.15); }
    50% { transform: translate(40px, -160px) scale(0.95); }
    75% { transform: translate(-80px, -40px) scale(1.1); }
  }

  @keyframes float-orb-2 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    25% { transform: translate(-100px, -60px) scale(0.9); }
    50% { transform: translate(-160px, 40px) scale(1.2); }
    75% { transform: translate(-40px, 100px) scale(0.85); }
  }

  @keyframes float-orb-3 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(140px, 60px) scale(1.1); }
    66% { transform: translate(60px, -120px) scale(0.9); }
  }

  @keyframes grain {
    0%, 100% { transform: translate(0, 0); }
    10% { transform: translate(-5%, -10%); }
    20% { transform: translate(-15%, 5%); }
    30% { transform: translate(7%, -25%); }
    40% { transform: translate(-5%, 25%); }
    50% { transform: translate(-15%, 10%); }
    60% { transform: translate(15%, 0%); }
    70% { transform: translate(0%, 15%); }
    80% { transform: translate(3%, 35%); }
    90% { transform: translate(-10%, 10%); }
  }

  @keyframes status-pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.4); opacity: 0.6; }
  }

  @keyframes floating {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
  }

  @keyframes text-shimmer {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }

  @keyframes slide-up-stagger {
    from { opacity: 0; transform: translateY(24px); filter: blur(4px); }
    to { opacity: 1; transform: translateY(0); filter: blur(0); }
  }

  @keyframes border-glow {
    0%, 100% { border-color: rgba(47,102,144,0.15); box-shadow: 0 0 20px rgba(47,102,144,0); }
    50% { border-color: rgba(47,102,144,0.35); box-shadow: 0 0 30px rgba(47,102,144,0.1); }
  }

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  @keyframes rotate-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes breathe-error {
    0%, 100% { box-shadow: 0 0 6px rgba(192,57,43,0.3); }
    50% { box-shadow: 0 0 20px rgba(192,57,43,0.8); }
  }

  @keyframes orbit {
    from { transform: rotate(0deg) translateX(14px) rotate(0deg); }
    to { transform: rotate(360deg) translateX(14px) rotate(-360deg); }
  }

  @keyframes gradient-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes count-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.3); }
  }

  @keyframes dot-slide {
    from { top: var(--from-top); }
    to { top: var(--to-top); }
  }
`
document.head.appendChild(styleEl)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CssBaseline />
    <App />
  </React.StrictMode>
)
