import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import HouseholdCodeGate from './components/HouseholdCodeGate.tsx'
import { registerServiceWorker } from './registerServiceWorker.ts'

registerServiceWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HouseholdCodeGate>
      <App />
    </HouseholdCodeGate>
  </StrictMode>,
)
