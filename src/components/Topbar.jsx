import { Link } from 'react-router-dom'
import { QrIcon } from './Icons'

function ArrowLeftIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M5 12l7 7M5 12l7-7" />
    </svg>
  )
}

export function Topbar({ right, back, title }) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {back ? (
            <button
              onClick={back}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-2)', fontSize: 13, fontWeight: 600,
                padding: '6px 0', fontFamily: 'var(--font)',
                transition: 'color .15s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}
            >
              <ArrowLeftIcon size={16} /> Festas
            </button>
          ) : (
            <Link to="/" className="logo">
              <div className="logo-icon">
                <QrIcon size={18} color="#fff" />
              </div>
              <span className="logo-text">TáNaLista</span>
              <span className="logo-badge">Beta</span>
            </Link>
          )}
          {title && (
            <>
              <span style={{ color: 'var(--border-2)', fontSize: 16 }}>/</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {title}
              </span>
            </>
          )}
        </div>
        {right && <div>{right}</div>}
      </div>
    </header>
  )
}