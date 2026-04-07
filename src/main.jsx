import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './App'

// Init Telegram Mini App
const tg = window.Telegram?.WebApp
if (tg) {
  try {
    tg.ready()
    tg.expand()
    tg.requestFullscreen?.()
    tg.setHeaderColor('#000000')
    tg.setBackgroundColor('#000000')
    tg.setBottomBarColor?.('#000000')
  } catch (e) {
    // Ignore unsupported method errors (e.g. outside Telegram)
  }
}

createRoot(document.getElementById('root')).render(<App />)
