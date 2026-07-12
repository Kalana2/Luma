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
    scrollbar-color: rgba(201,168,76,0.25) transparent;
  }
  *::-webkit-scrollbar { width: 4px; }
  *::-webkit-scrollbar-track { background: transparent; }
  *::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, rgba(201,168,76,0.3), rgba(109,40,217,0.2));
    border-radius: 4px;
  }
  *::-webkit-scrollbar-thumb:hover { background: rgba(201,168,76,0.5); }

  body { background: #0A1628; overflow-x: hidden; }

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

  /* ---- STATUS & RING PULSE ---- */
  @keyframes status-pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.6); opacity: 0.4; }
  }
  @keyframes ring-expand {
    0% { transform: scale(1); opacity: 0.6; }
    100% { transform: scale(2.8); opacity: 0; }
  }

  /* ---- SHIMMER ---- */
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes gold-shimmer {
    0% { background-position: -200% 50%; }
    100% { background-position: 200% 50%; }
  }

  /* ---- ROYAL ORB DRIFT ---- */
  @keyframes float-orb-1 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(80px, -50px) scale(1.12); }
    66% { transform: translate(-40px, -90px) scale(0.94); }
  }
  @keyframes float-orb-2 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(-60px, 40px) scale(1.08); }
    66% { transform: translate(50px, 70px) scale(0.92); }
  }

  /* ---- ROTATE ---- */
  @keyframes rotate-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  /* ---- FLOAT ---- */
  @keyframes floating {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-6px); }
  }

  /* ---- COLLAPSE ---- */
  @keyframes collapse-in {
    from { opacity: 0; max-height: 0; }
    to { opacity: 1; max-height: 2000px; }
  }
  .collapse-enter { overflow: hidden; animation: collapse-in 0.4s ease-out both; }

  /* ---- TOAST ---- */
  @keyframes toast-in {
    from { opacity: 0; transform: translateX(120%) scale(0.9); }
    to { opacity: 1; transform: translateX(0) scale(1); }
  }
  @keyframes toast-out {
    from { opacity: 1; transform: translateX(0) scale(1); }
    to { opacity: 0; transform: translateX(120%) scale(0.9); }
  }
`
document.head.appendChild(styleEl)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CssBaseline />
    <App />
  </React.StrictMode>
)
