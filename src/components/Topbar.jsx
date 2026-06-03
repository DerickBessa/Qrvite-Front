import { Link } from 'react-router-dom'
import { QrIcon } from './Icons'

export function Topbar({ right }) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link to="/" className="logo">
          <div className="logo-icon">
            <QrIcon size={18} color="#fff" />
          </div>
          <span className="logo-text">TáNaLista</span>
          <span className="logo-badge">Beta</span>
        </Link>
        {right && <div>{right}</div>}
      </div>
    </header>
  )
}
