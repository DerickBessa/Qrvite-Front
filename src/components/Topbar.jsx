import { Link } from 'react-router-dom'
import { QrIcon } from './Icons'
import { useTheme } from '../hooks/useTheme'

function ArrowLeftIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M5 12l7 7M5 12l7-7" />
    </svg>
  )
}

function SunIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
    </svg>
  )
}

function MoonIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}

export function Topbar({ right, back, title }) {
  const { theme, toggle } = useTheme()

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
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}
            >
              <ArrowLeftIcon size={16} /> Festas
            </button>
          ) : (
            <Link to="/" className="logo">
              <div className="logo-icon">
                <QrIcon size={18} color="#010B04" />
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

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            className="theme-toggle"
            onClick={toggle}
            title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
            aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
          >
            {theme === 'dark' ? <SunIcon size={16} /> : <MoonIcon size={16} />}
          </button>

          {right && <div>{right}</div>}
        </div>
      </div>
    </header>
  )
}
