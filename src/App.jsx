import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles/global.css'
import { useTheme } from './hooks/useTheme'
import PartiesPage from './pages/PartiesPage'
import PartyPage from './pages/PartyPage'
import InvitePage from './pages/InvitePage'

export default function App() {
  // Garante que o atributo data-theme seja aplicado desde o início
  useTheme()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"            element={<PartiesPage />} />
        <Route path="/festa/:id"   element={<PartyPage />} />
        <Route path="/convite/:id" element={<InvitePage />} />
      </Routes>
    </BrowserRouter>
  )
}
