import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles/global.css'
import HomePage from './pages/HomePage'
import InvitePage from './pages/InvitePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/convite/:id" element={<InvitePage />} />
      </Routes>
    </BrowserRouter>
  )
}
