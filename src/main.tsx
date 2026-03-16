import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/catppuccin.css'
import './styles/app.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
