import React from 'react'
import ReactDOM from 'react-dom/client'
import { CssBaseline } from '@mui/material'
import App from './App'

const fontLink = document.createElement('link')
fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'
fontLink.rel = 'stylesheet'
document.head.appendChild(fontLink)

const styleEl = document.createElement('style')
styleEl.textContent = `
  * {
    scrollbar-width: thin;
    scrollbar-color: #2F6690 #0A1628;
  }
  *::-webkit-scrollbar {
    width: 6px;
  }
  *::-webkit-scrollbar-track {
    background: #0A1628;
  }
  *::-webkit-scrollbar-thumb {
    background: #2F6690;
    border-radius: 3px;
  }
  *::-webkit-scrollbar-thumb:hover {
    background: #FFA630;
  }
  body {
    background: #0A1628;
  }
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 8px rgba(46,139,87,0.4); }
    50% { box-shadow: 0 0 20px rgba(46,139,87,0.8); }
  }
  @keyframes breathe-error {
    0%, 100% { box-shadow: 0 0 6px rgba(192,57,43,0.3); }
    50% { box-shadow: 0 0 16px rgba(192,57,43,0.7); }
  }
  @keyframes float-in {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes status-pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.3); opacity: 0.7; }
  }
`
document.head.appendChild(styleEl)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CssBaseline />
    <App />
  </React.StrictMode>
)
