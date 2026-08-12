import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App.jsx'
import './styles/reset.css'
import './styles/tokens.css'
import './styles/scaffold.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
