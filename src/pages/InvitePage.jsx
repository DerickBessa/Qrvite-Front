import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { QrIcon, DownloadIcon, CheckIcon, AlertCircleIcon } from '../components/Icons'
import { api } from '../services/api'

function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-2)', fontSize: 14 }}>
      <div className="spinner spinner-accent" />
      Carregando convite...
    </div>
  )
}

export default function InvitePage() {
  const { id } = useParams()
  const [person, setPerson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.getPersonById(id)
      .then(setPerson)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <div className="invite-page">
      {/* Logo flutuante topo */}
      <div style={{ position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div className="logo-icon" style={{ width: 28, height: 28, borderRadius: 7 }}>
            <QrIcon size={15} color="#fff" />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>TáNaLista</span>
        </Link>
      </div>

      <div className="invite-card">
        {loading && <Spinner />}

        {error && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ color: 'var(--red)', opacity: 0.7 }}>
              <AlertCircleIcon size={40} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Convite não encontrado</p>
            <p style={{ fontSize: 13, color: 'var(--text-2)' }}>Este link pode estar inválido ou o convidado foi removido.</p>
            <Link to="/" className="btn btn-ghost" style={{ marginTop: 8 }}>Voltar ao início</Link>
          </div>
        )}

        {person && (
          <>
            <div className="invite-logo">
              <QrIcon size={24} color="#fff" />
            </div>

            <h1>Seu convite</h1>
            <p className="invite-sub">
              Apresente este QR code na entrada do evento.
            </p>

            {/* QR Code */}
            <div className="invite-qr-wrap">
              {person.qrCodeIMG
                ? <img src={person.qrCodeIMG} alt={`QR code de ${person.nome}`} />
                : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
                    <QrIcon size={80} color="#ccc" />
                  </div>
                )
              }
            </div>

            <div className="invite-name">{person.nome}</div>
            {person.family && (
              <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4, marginBottom: 4 }}>
                Família {person.family.familyName}
              </div>
            )}
            <div className="invite-id">{person.id}</div>

            {/* Status */}
            <div className="invite-status">
              {person.isUsed
                ? (
                  <span className="badge badge-green" style={{ padding: '6px 14px', fontSize: 13 }}>
                    <CheckIcon size={13} /> Check-in realizado
                  </span>
                )
                : (
                  <span className="badge badge-amber" style={{ padding: '6px 14px', fontSize: 13 }}>
                    Aguardando check-in
                  </span>
                )
              }
            </div>

            {/* Botão PDF */}
            <a
              href={api.getPdfUrl(person.id)}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary btn-full"
            >
              <DownloadIcon size={16} /> Baixar convite em PDF
            </a>

            {/* Instrução */}
            <div className="invite-instructions">
              📌 Salve ou tire um print deste QR code. Na entrada do evento, basta mostrá-lo para ser registrado.
              {person.isUsed && (
                <span style={{ display: 'block', marginTop: 8, color: 'var(--green)' }}>
                  ✓ Seu check-in já foi registrado com sucesso.
                </span>
              )}
            </div>
          </>
        )}
      </div>

      <p style={{ marginTop: 24, fontSize: 12, color: 'var(--text-3)' }}>
        TáNaLista — gerenciamento de eventos com QR code
      </p>
    </div>
  )
}
