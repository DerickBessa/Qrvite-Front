import { useState, useEffect, useCallback } from 'react'
import { Topbar } from '../components/Topbar'
import { ConfirmModal } from '../components/ConfirmModal'
import {
  QrIcon, CheckIcon, TrashIcon, DownloadIcon,
  LinkIcon, CopyIcon, RefreshIcon, UsersIcon,
  AlertCircleIcon, CheckCircleIcon, InfoIcon, SearchIcon
} from '../components/Icons'
import { api } from '../services/api'

/* ─── Utilitários ─── */
function Alert({ type, children }) {
  const icons = { success: <CheckCircleIcon />, error: <AlertCircleIcon />, info: <InfoIcon /> }
  return (
    <div className={`alert alert-${type}`} style={{ marginBottom: '1rem' }}>
      {icons[type]}
      <span>{children}</span>
    </div>
  )
}

function conviteUrl(id) {
  return `${window.location.origin}/convite/${id}`
}

/* ─── Aba: Criar QR ─── */
function CreateTab() {
  const [nome, setNome] = useState('')
  const [familyId, setFamilyId] = useState('')
  const [families, setFamilies] = useState([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [alert, setAlert] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    api.getFamilies().then(setFamilies).catch(() => {})
  }, [])

  async function handleCreate() {
    if (!nome.trim()) { setAlert({ type: 'error', msg: 'O nome é obrigatório.' }); return }
    setLoading(true)
    setAlert(null)
    setResult(null)
    try {
      const body = { nome: nome.trim() }
      if (familyId) body.familyId = familyId
      const person = await api.createPerson(body)
      setResult(person)
      setNome('')
      setFamilyId('')
      setAlert({ type: 'success', msg: `QR code gerado para ${person.nome}!` })
    } catch (e) {
      setAlert({ type: 'error', msg: e.message })
    } finally {
      setLoading(false)
    }
  }

  function copyLink() {
    if (!result) return
    navigator.clipboard.writeText(conviteUrl(result.id)).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="stack">
      <div className="page-header" style={{ paddingBottom: '0.5rem' }}>
        <h2>Cadastrar convidado</h2>
        <p>Preencha os dados para gerar o QR code de acesso.</p>
      </div>

      {alert && <Alert type={alert.type}>{alert.msg}</Alert>}

      <div className="card">
        <div className="form-group">
          <label className="field-label" htmlFor="nome">Nome completo *</label>
          <input
            id="nome" type="text" value={nome}
            onChange={e => setNome(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            placeholder="Ex: Maria da Silva"
          />
        </div>
        <div className="form-group">
          <label className="field-label" htmlFor="family">Família (opcional)</label>
          <select id="family" value={familyId} onChange={e => setFamilyId(e.target.value)}>
            <option value="">Sem família</option>
            {families.map(f => (
              <option key={f.id} value={f.id}>{f.familyName}</option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary" onClick={handleCreate} disabled={loading}>
          {loading
            ? <><div className="spinner" /> Gerando...</>
            : <><QrIcon size={16} color="#fff" /> Gerar QR code</>}
        </button>
      </div>

      {result && (
        <div className="card">
          <div className="qr-card">
            <div className="qr-img-wrap">
              {result.qrCodeIMG
                ? <img src={result.qrCodeIMG} alt={`QR de ${result.nome}`} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0' }}>
                    <QrIcon size={60} color="#ccc" />
                  </div>
              }
            </div>

            <div className="qr-name">{result.nome}</div>
            {result.family && (
              <div className="flex items-center gap-2 mt-1" style={{ color: 'var(--text-2)', fontSize: 13 }}>
                <UsersIcon size={13} /> {result.family.familyName}
              </div>
            )}
            <div className="qr-id">{result.id}</div>

            <div className="qr-actions">
              <a
                href={api.getPdfUrl(result.id)}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost"
                style={{ flex: 1 }}
              >
                <DownloadIcon /> PDF
              </a>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={copyLink}>
                {copied ? <><CheckIcon size={14} /> Copiado!</> : <><LinkIcon /> Link convite</>}
              </button>
            </div>

            {/* Link do convite */}
            <div className="link-box" style={{ width: '100%', maxWidth: 360 }}>
              <LinkIcon size={14} />
              <span>{conviteUrl(result.id)}</span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={copyLink}
                title="Copiar link"
              >
                <CopyIcon size={13} />
              </button>
            </div>

            <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: '0.75rem' }}>
              Envie este link para o convidado ver e baixar o próprio QR code.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Card de pessoa na listagem ─── */
function PersonCard({ person, onDelete }) {
  const [copied, setCopied] = useState(false)

  function copyLink() {
    navigator.clipboard.writeText(conviteUrl(person.id)).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="person-card">
      <div className="qr-thumb">
        {person.qrCodeIMG
          ? <img src={person.qrCodeIMG} alt={`QR de ${person.nome}`} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0' }}>
              <QrIcon size={36} color="#ccc" />
            </div>
        }
      </div>

      <div className="pc-name">{person.nome}</div>
      {person.family && (
        <div className="flex items-center gap-2 mt-1" style={{ color: 'var(--text-2)', fontSize: 11 }}>
          <UsersIcon /> {person.family.familyName}
        </div>
      )}

      <div style={{ marginTop: 8 }}>
        <span className={`badge ${person.isUsed ? 'badge-green' : 'badge-gray'}`}>
          {person.isUsed ? <><CheckIcon /> Check-in feito</> : 'Disponível'}
        </span>
      </div>

      <div className="pc-actions">
        <a
          href={api.getPdfUrl(person.id)}
          target="_blank"
          rel="noreferrer"
          className="btn btn-ghost btn-sm"
          title="Baixar PDF"
        >
          <DownloadIcon />
        </a>
        <button className="btn btn-ghost btn-sm" onClick={copyLink} title="Copiar link do convite">
          {copied ? <CheckIcon size={13} /> : <LinkIcon />}
        </button>
        <button
          className="btn btn-danger btn-sm"
          onClick={() => onDelete(person)}
          title="Remover"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  )
}

/* ─── Aba: Listagem ─── */
function ListTab() {
  const [persons, setPersons] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [alert, setAlert] = useState(null)
  const [toDelete, setToDelete] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setAlert(null)
    try {
      const data = await api.getPersons()
      setPersons(data)
    } catch (e) {
      setAlert({ type: 'error', msg: e.message })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function confirmDelete() {
    try {
      await api.deletePerson(toDelete.id)
      setPersons(p => p.filter(x => x.id !== toDelete.id))
    } catch (e) {
      setAlert({ type: 'error', msg: 'Erro ao remover: ' + e.message })
    } finally {
      setToDelete(null)
    }
  }

  const filtered = persons.filter(p =>
    p.nome.toLowerCase().includes(search.toLowerCase())
  )

  const total = persons.length
  const used = persons.filter(p => p.isUsed).length
  const avail = total - used

  return (
    <div className="stack">
      <div className="page-header" style={{ paddingBottom: '0.5rem' }}>
        <h2>Convidados</h2>
        <p>Lista de todos os QR codes gerados.</p>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-box">
          {loading
            ? <div className="skeleton" style={{ height: 28, borderRadius: 4 }} />
            : <div className="stat-n">{total}</div>}
          <div className="stat-l">total</div>
        </div>
        <div className="stat-box">
          {loading
            ? <div className="skeleton" style={{ height: 28, borderRadius: 4 }} />
            : <div className="stat-n" style={{ color: 'var(--green)' }}>{used}</div>}
          <div className="stat-l">check-ins</div>
        </div>
        <div className="stat-box">
          {loading
            ? <div className="skeleton" style={{ height: 28, borderRadius: 4 }} />
            : <div className="stat-n">{avail}</div>}
          <div className="stat-l">disponíveis</div>
        </div>
      </div>

      {alert && <Alert type={alert.type}>{alert.msg}</Alert>}

      {/* Search + Refresh */}
      <div className="search-row">
        <div style={{ position: 'relative', flex: 1 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }}>
            <SearchIcon size={15} />
          </span>
          <input
            type="text" value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome..."
            style={{ paddingLeft: 36 }}
          />
        </div>
        <button className="icon-btn" onClick={load} title="Atualizar">
          <RefreshIcon size={16} />
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="person-grid">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton" style={{ height: 240, borderRadius: 16 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="person-grid">
          <div className="empty-state">
            <QrIcon size={40} color="var(--text-3)" />
            <p style={{ marginTop: 12 }}>
              {search ? 'Nenhum convidado encontrado.' : 'Nenhum convidado cadastrado ainda.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="person-grid">
          {filtered.map(p => (
            <PersonCard key={p.id} person={p} onDelete={setToDelete} />
          ))}
        </div>
      )}

      {toDelete && (
        <ConfirmModal
          title="Remover convidado"
          body={`Tem certeza que deseja remover "${toDelete.nome}"? Esta ação não pode ser desfeita.`}
          confirmLabel="Remover"
          danger
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  )
}

/* ─── Página principal ─── */
export default function HomePage() {
  const [tab, setTab] = useState('create')

  return (
    <div className="page">
      <Topbar right={
        <div className="tab-nav">
          <button
            className={`tab-btn ${tab === 'create' ? 'active' : ''}`}
            onClick={() => setTab('create')}
          >
            <QrIcon size={14} /> Criar QR
          </button>
          <button
            className={`tab-btn ${tab === 'list' ? 'active' : ''}`}
            onClick={() => setTab('list')}
          >
            Lista
          </button>
        </div>
      } />

      <div className="container" style={{ paddingTop: '1rem', paddingBottom: '3rem' }}>
        {tab === 'create' ? <CreateTab /> : <ListTab />}
      </div>
    </div>
  )
}
