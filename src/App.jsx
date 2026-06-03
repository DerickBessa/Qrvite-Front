import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles/global.css'
import PartiesPage from './pages/PartiesPage'
import PartyPage from './pages/PartyPage'
import InvitePage from './pages/InvitePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"              element={<PartiesPage />} />
        <Route path="/festa/:id"     element={<PartyPage />} />
        <Route path="/convite/:id"   element={<InvitePage />} />
      </Routes>
    </BrowserRouter>
  )
}