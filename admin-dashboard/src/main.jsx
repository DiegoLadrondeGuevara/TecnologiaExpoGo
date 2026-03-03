import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { setBaseUrl } from '../../shared-logic/apiClient'
import './i18n'
import './index.css'
import App from './App'

// Configure API URL from Vite env vars (must be before any component renders)
if (import.meta.env.VITE_API_URL) {
  setBaseUrl(import.meta.env.VITE_API_URL)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
