import { useState, useEffect, useCallback } from 'react'
import { Topbar } from '../components/Topbar'
import { ConfirmModal } from '../components/ConfirmModal'
import { FamilyMembersModal } from '../components/FamilyMembersModal'
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

/* ─── Área de resultado do QR Code (individual ou família) ─── */
function QRResultCard({ result, type, onShowMembers }) {
  const [copied, setCopied] = useState(false)

  const id = result.id
  const name = type === 'family' ? result.familyName : result.nome
  const qrImg = result.qrCodeIMG
  const url = conviteUrl(id)

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="card">
      <div className="qr-card">
        <div className="qr-img-wrap">
          {qrImg
            ? <img src={qrImg} alt={`QR de ${name}`} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0' }}>
                <QrIcon size={60} color="#ccc" />
              </div>
          }
        </div>

        <div className="qr-name">{name}</div>

        {type === 'family' && (
          <div className="flex items-center gap-2 mt-1" style={{ color: 'var(--text-2)', fontSize: 13 }}>
            <UsersIcon size={13} />
            <span>Família · {result.members?.length ?? result.familySize} membro{(result.members?.length ?? result.familySize) !== 1 ? 's' : ''}</span>
          </div>
        )}

        {type === 'person' && result.family && (
          <div className="flex items-center gap-2 mt-1" style={{ color: 'var(--text-2)', fontSize: 13 }}>
            <UsersIcon size={13} /> {result.family.familyName}
          </div>
        )}

        <div className="qr-id">{id}</div>

        <div className="qr-actions">
          <a
            href={type === 'family' ? api.getFamilyPdfUrl(id) : api.getPdfUrl(id)}
            target="_blank" rel="noreferrer"
            className="btn btn-ghost" style={{ flex: 1 }}
          >
            <DownloadIcon /> PDF
          </a>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={copyLink}>
            {copied ? <><CheckIcon size={14} /> Copiado!</> : <><LinkIcon /> Link convite</>}
          </button>
          {type === 'family' && (
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onShowMembers}>
              <UsersIcon size={14} /> Detalhes
            </button>
          )}
        </div>

        <div className="link-box" style={{ width: '100%', maxWidth: 360 }}>
          <LinkIcon size={14} />
          <span>{url}</span>
          <button className="btn btn-ghost btn-sm" onClick={copyLink} title="Copiar link">
            <CopyIcon size={13} />
          </button>
        </div>

        <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: '0.75rem' }}>
          Envie este link para o convidado ver e baixar o próprio QR code.
        </p>
      </div>
    </div>
  )
}

/* ─── Aba: Criar QR (pessoa) ─── */
function CreateTab() {
  const [nome, setNome] = useState('')
  const [familyId, setFamilyId] = useState('')
  const [families, setFamilies] = useState([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [alert, setAlert] = useState(null)

  const loadFamilies = useCallback(() => {
    api.getFamilies().then(setFamilies).catch(() => {})
  }, [])

  useEffect(() => { loadFamilies() }, [loadFamilies])

  async function handleCreate() {
    if (!nome.trim()) { setAlert({ type: 'error', msg: 'O nome é obrigatório.' }); return }
    setLoading(true); setAlert(null); setResult(null)
    try {
      const body = { nome: nome.trim() }
      if (familyId) body.familyId = familyId
      const person = await api.createPerson(body)
      setResult(person)
      setNome(''); setFamilyId('')
      setAlert({ type: 'success', msg: `QR code gerado para ${person.nome}!` })
    } catch (e) {
      setAlert({ type: 'error', msg: e.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="stack">
      <div className="page-header" style={{ paddingBottom: '0.5rem' }}>
        <h2>Cadastrar convidado</h2>
        <p>Preencha os dados para gerar o QR code de acesso.</p>
      </div>

      {alert && <Alert type={alert.type}>{alert.msg}</Alert>}

      <div className="card">
        <div className="card-title">
          <QrIcon size={14} /> Dados do convidado
        </div>
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
        <QRResultCard result={result} type="person" />
      )}
    </div>
  )
}

/* ─── Aba: Famílias ─── */
function FamilyTab() {
  const [familyName, setFamilyName] = useState('')
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)
  const [families, setFamilies] = useState([])
  const [loadingList, setLoadingList] = useState(true)
  const [toDelete, setToDelete] = useState(null)
  // QR resultado após gerar QR de família
  const [qrResult, setQrResult] = useState(null)
  // Modal de membros
  const [membersModal, setMembersModal] = useState(null)

  const loadFamilies = useCallback(async () => {
    setLoadingList(true)
    try {
      const data = await api.getFamilies()
      setFamilies(data)
    } catch (e) {
      setAlert({ type: 'error', msg: 'Erro ao carregar famílias.' })
    } finally {
      setLoadingList(false)
    }
  }, [])

  useEffect(() => { loadFamilies() }, [loadFamilies])

  async function handleCreate() {
    if (!familyName.trim()) { setAlert({ type: 'error', msg: 'O nome da família é obrigatório.' }); return }
    setLoading(true); setAlert(null); setQrResult(null)
    try {
      const family = await api.createFamily({ familyName: familyName.trim() })
      setFamilyName('')
      setQrResult(family)
      setAlert({ type: 'success', msg: `Família "${family.familyName}" criada com QR code!` })
      loadFamilies()
    } catch (e) {
      setAlert({ type: 'error', msg: e.message })
    } finally {
      setLoading(false)
    }
  }

  async function handleShowQR(family) {
    setQrResult(family)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function confirmDelete() {
    try {
      await api.deleteFamily(toDelete.id)
      setFamilies(f => f.filter(x => x.id !== toDelete.id))
      if (qrResult?.id === toDelete.id) setQrResult(null)
    } catch (e) {
      setAlert({ type: 'error', msg: 'Erro ao remover: ' + e.message })
    } finally {
      setToDelete(null)
    }
  }

  return (
    <div className="stack">
      <div className="page-header" style={{ paddingBottom: '0.5rem' }}>
        <h2>Gerenciar famílias</h2>
        <p>Crie grupos de família e gere QR codes que refletem automaticamente os membros atuais.</p>
      </div>

      {alert && <Alert type={alert.type}>{alert.msg}</Alert>}

      {/* Formulário de criação */}
      <div className="card">
        <div className="card-title">
          <UsersIcon size={14} /> Nova família
        </div>
        <div className="form-group">
          <label className="field-label" htmlFor="familyName">Nome da família *</label>
          <input
            id="familyName" type="text" value={familyName}
            onChange={e => setFamilyName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            placeholder="Ex: Família Silva"
          />
        </div>
        <button className="btn btn-primary" onClick={handleCreate} disabled={loading}>
          {loading
            ? <><div className="spinner" /> Criando...</>
            : <><UsersIcon size={16} color="#fff" /> Criar família e gerar QR</>}
        </button>
      </div>

      {/* Resultado do QR da família */}
      {qrResult && (
        <QRResultCard
          result={qrResult}
          type="family"
          onShowMembers={() => setMembersModal(qrResult)}
        />
      )}

      {/* Lista de famílias */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: '0.75rem' }}>
          <UsersIcon size={14} /> Famílias cadastradas
          <button
            className="btn btn-ghost btn-sm"
            onClick={loadFamilies}
            style={{ marginLeft: 'auto', padding: '4px 10px' }}
            title="Atualizar"
          >
            <RefreshIcon size={13} />
          </button>
        </div>

        {loadingList ? (
          <div className="stack">
            {[1,2].map(i => <div key={i} className="skeleton" style={{ height: 56, borderRadius: 8 }} />)}
          </div>
        ) : families.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem 1rem' }}>
            <UsersIcon size={32} color="var(--text-3)" />
            <p style={{ marginTop: 8 }}>Nenhuma família cadastrada ainda.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {families.map(f => (
              <div key={f.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', background: 'var(--bg-3)',
                borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)'
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{f.familyName}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2, fontFamily: 'var(--mono)', wordBreak: 'break-all' }}>
                    {f.members?.length ?? f.familySize} membro{(f.members?.length ?? f.familySize) !== 1 ? 's' : ''}
                  </div>
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleShowQR(f)}
                  title="Ver QR code da família"
                >
                  <QrIcon size={13} />
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setMembersModal(f)}
                  title="Ver membros"
                >
                  <UsersIcon size={13} />
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => setToDelete(f)}
                  title="Remover família"
                >
                  <TrashIcon size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {toDelete && (
        <ConfirmModal
          title="Remover família"
          body={`Tem certeza que deseja remover a família "${toDelete.familyName}"? Os convidados vinculados não serão removidos.`}
          confirmLabel="Remover"
          danger
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}

      {membersModal && (
        <FamilyMembersModal
          family={membersModal}
          onClose={() => setMembersModal(null)}
        />
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
          target="_blank" rel="noreferrer"
          className="btn btn-ghost btn-sm" title="Baixar PDF"
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
    setLoading(true); setAlert(null)
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

      <div className="stats-row">
        <div className="stat-box">
          {loading ? <div className="skeleton" style={{ height: 28, borderRadius: 4 }} /> : <div className="stat-n">{total}</div>}
          <div className="stat-l">total</div>
        </div>
        <div className="stat-box">
          {loading ? <div className="skeleton" style={{ height: 28, borderRadius: 4 }} /> : <div className="stat-n" style={{ color: 'var(--green)' }}>{used}</div>}
          <div className="stat-l">check-ins</div>
        </div>
        <div className="stat-box">
          {loading ? <div className="skeleton" style={{ height: 28, borderRadius: 4 }} /> : <div className="stat-n">{avail}</div>}
          <div className="stat-l">disponíveis</div>
        </div>
      </div>

      {alert && <Alert type={alert.type}>{alert.msg}</Alert>}

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

      {loading ? (
        <div className="person-grid">
          {[1,2,3].map(i => (
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

  const tabs = [
    { id: 'create', label: 'Criar QR',   icon: <QrIcon size={14} /> },
    { id: 'family', label: 'Famílias',   icon: <UsersIcon size={14} /> },
    { id: 'list',   label: 'Convidados', icon: null },
  ]

  return (
    <div className="page">
      <Topbar right={
        <div className="tab-nav">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`tab-btn ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      } />

      <div className="container" style={{ paddingTop: '1rem', paddingBottom: '3rem' }}>
        {tab === 'create' && <CreateTab />}
        {tab === 'family' && <FamilyTab />}
        {tab === 'list'   && <ListTab />}
      </div>
    </div>
  )
}