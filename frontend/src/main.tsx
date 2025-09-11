import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// API Factory initialization
import { apiServiceFactory } from './services/api/factories/APIServiceFactory'
import { getCurrentAPIConfig } from './config/api.config'

// Initialize API services
apiServiceFactory.initialize(getCurrentAPIConfig())

createRoot(document.getElementById('root')!).render(
  <App />
)
