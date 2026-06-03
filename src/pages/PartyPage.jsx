import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Topbar } from '../components/Topbar'
import { ConfirmModal } from '../components/ConfirmModal'
import {
  QrIcon, CheckIcon, TrashIcon, DownloadIcon, LinkIcon, CopyIcon,
  RefreshIcon, UsersIcon, AlertCircleIcon, CheckCircleIcon, SearchIcon, ChevronRightIcon
} from '../components/Icons'
import { api } from '../services/api'

function Alert({ type, children }) {
  const icons = { success: <CheckCircleIcon />, error: <AlertCircleIcon /> }
  return (
    <div className={`alert alert-${type}`} style={{ marginBottom: '1rem' }}>
      {icons[type]}<span>{children}</span>
    </div>
  )
}

function conviteUrl(id) { return `${window.location.origin}/convite/${id}` }

/* ─── Aba: Criar Convidado ─── */
function CreateGuestTab({ partyId, onCreated }) {
  const [nome, setNome] = useState('')
  const [familyId, setFamilyId] = useState('')
  const [families, setFamilies] = useState([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [alert, setAlert] = useState(null)
  const [copied, setCopied] = useState(false)

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
      // Vincula à festa via rota dedicada POST /api/parties/:id/guests
      await api.addPartyGuest(partyId, person.id)
      setResult(person)
      setNome(''); setFamilyId('')
      setAlert({ type: 'success', msg: `QR code gerado para ${person.nome}!` })
      onCreated?.()
    } catch (e) {
      setAlert({ type: 'error', msg: e.message })
    } finally { setLoading(false) }
  }

  function copyLink() {
    if (!result) return
    navigator.clipboard.writeText(conviteUrl(result.id)).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="stack">
      {alert && <Alert type={alert.type}>{alert.msg}</Alert>}

      <div className="card">
        <div className="card-title"><QrIcon size={14} /> Novo convidado</div>
        <div className="form-group">
          <label className="field-label">Nome completo *</label>
          <input type="text" value={nome} onChange={e => setNome(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()} placeholder="Ex: Maria da Silva" />
        </div>
        <div className="form-group">
          <label className="field-label">Família (opcional)</label>
          <select value={familyId} onChange={e => setFamilyId(e.target.value)}>
            <option value="">Sem família</option>
            {families.map(f => <option key={f.id} value={f.id}>{f.familyName} ({f.familySize} membros)</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={handleCreate} disabled={loading}>
          {loading ? <><div className="spinner" /> Gerando...</> : <><QrIcon size={16} color="#fff" /> Gerar QR code</>}
        </button>
      </div>

      {result && (
        <div className="card">
          <div className="qr-card">
            <div className="qr-img-wrap">
              {result.qrCodeIMG
                ? <img src={result.qrCodeIMG} alt={result.nome} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
                    <QrIcon size={60} color="#ccc" />
                  </div>}
            </div>
            <div className="qr-name">{result.nome}</div>
            {result.family && (
              <div className="flex items-center gap-2 mt-1" style={{ color: 'var(--text-2)', fontSize: 13 }}>
                <UsersIcon size={13} /> {result.family.familyName}
              </div>
            )}
            <div className="qr-id">{result.id}</div>
            <div className="qr-actions">
              <a href={api.getPdfUrl(result.id)} target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ flex: 1 }}>
                <DownloadIcon /> PDF
              </a>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={copyLink}>
                {copied ? <><CheckIcon size={14} /> Copiado!</> : <><LinkIcon /> Link</>}
              </button>
            </div>
            <div className="link-box" style={{ width: '100%', maxWidth: 360 }}>
              <LinkIcon size={14} />
              <span>{conviteUrl(result.id)}</span>
              <button className="btn btn-ghost btn-sm" onClick={copyLink}><CopyIcon size={13} /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Aba: Famílias ─── */
function FamiliesTab({ partyGuests, onRefresh }) {
  const [families, setFamilies] = useState([])
  const [loadingList, setLoadingList] = useState(true)
  const [alert, setAlert] = useState(null)
  const [familyName, setFamilyName] = useState('')
  const [creating, setCreating] = useState(false)
  const [expanded, setExpanded] = useState(null)
  const [toDelete, setToDelete] = useState(null)

  // Adicionar membro a família
  const [addingTo, setAddingTo] = useState(null) // familyId
  const [selectedPerson, setSelectedPerson] = useState('')

  const loadFamilies = useCallback(async () => {
    setLoadingList(true)
    try { setFamilies(await api.getFamilies()) }
    catch (e) { setAlert({ type: 'error', msg: e.message }) }
    finally { setLoadingList(false) }
  }, [])

  useEffect(() => { loadFamilies() }, [loadFamilies])

  async function handleCreate() {
    if (!familyName.trim()) { setAlert({ type: 'error', msg: 'O nome da família é obrigatório.' }); return }
    setCreating(true); setAlert(null)
    try {
      await api.createFamily({ familyName: familyName.trim() })
      setFamilyName('')
      setAlert({ type: 'success', msg: `Família criada!` })
      await loadFamilies()
    } catch (e) { setAlert({ type: 'error', msg: e.message }) }
    finally { setCreating(false) }
  }

  async function handleAddMember(familyId) {
    if (!selectedPerson) return
    try {
      await api.addFamilyMember(familyId, selectedPerson)
      setSelectedPerson(''); setAddingTo(null)
      setAlert({ type: 'success', msg: 'Membro adicionado!' })
      await loadFamilies()
      onRefresh?.()
    } catch (e) { setAlert({ type: 'error', msg: e.message }) }
  }

  async function handleRemoveMember(familyId, personId) {
    try {
      await api.removeFamilyMember(familyId, personId)
      setAlert({ type: 'success', msg: 'Membro removido.' })
      await loadFamilies()
      onRefresh?.()
    } catch (e) { setAlert({ type: 'error', msg: e.message }) }
  }

  async function confirmDelete() {
    try {
      await api.deleteFamily(toDelete.id)
      setFamilies(f => f.filter(x => x.id !== toDelete.id))
    } catch (e) { setAlert({ type: 'error', msg: e.message }) }
    finally { setToDelete(null) }
  }

  // Convidados da festa que ainda não têm família (ou nenhum = todos os persons)
  const unassigned = partyGuests.filter(g => !g.familyId)

  return (
    <div className="stack">
      {alert && <Alert type={alert.type}>{alert.msg}</Alert>}

      {/* Criar família */}
      <div className="card">
        <div className="card-title"><UsersIcon size={14} /> Nova família</div>
        <div className="form-group">
          <label className="field-label">Nome da família *</label>
          <input type="text" value={familyName} onChange={e => setFamilyName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()} placeholder="Ex: Família Silva" />
        </div>
        <button className="btn btn-primary" onClick={handleCreate} disabled={creating}>
          {creating ? <><div className="spinner" /> Criando...</> : <><UsersIcon size={16} color="#fff" /> Criar família</>}
        </button>
      </div>

      {/* Lista de famílias */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: '0.75rem' }}>
          <UsersIcon size={14} /> Famílias cadastradas
          <button className="btn btn-ghost btn-sm" onClick={loadFamilies} style={{ marginLeft: 'auto', padding: '4px 10px' }}>
            <RefreshIcon size={13} />
          </button>
        </div>

        {loadingList ? (
          <div className="stack" style={{ gap: 8 }}>
            {[1,2].map(i => <div key={i} className="skeleton" style={{ height: 52, borderRadius: 10 }} />)}
          </div>
        ) : families.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-3)', fontSize: 14 }}>
            Nenhuma família cadastrada ainda.
          </div>
        ) : (
          <div className="stack" style={{ gap: 8 }}>
            {families.map(f => (
              <div key={f.id}>
                {/* Cabeçalho da família */}
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px 14px', background: expanded === f.id ? 'var(--accent-bg)' : 'var(--bg-3)',
                    borderRadius: expanded === f.id ? '10px 10px 0 0' : 10,
                    border: `1px solid ${expanded === f.id ? 'var(--accent-border)' : 'var(--border)'}`,
                    borderBottom: expanded === f.id ? 'none' : undefined,
                    cursor: 'pointer', transition: 'all .15s',
                  }}
                  onClick={() => setExpanded(expanded === f.id ? null : f.id)}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <UsersIcon size={15} color="var(--accent)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{f.familyName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{f.members?.length ?? 0} membros</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <button className="btn btn-danger btn-sm" onClick={e => { e.stopPropagation(); setToDelete(f) }} title="Remover">
                      <TrashIcon size={13} />
                    </button>
                    <ChevronRightIcon size={15} color="var(--text-3)"
                      style={{ transform: expanded === f.id ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }} />
                  </div>
                </div>

                {/* Membros expandidos */}
                {expanded === f.id && (
                  <div style={{
                    border: '1px solid var(--accent-border)', borderTop: 'none',
                    borderRadius: '0 0 10px 10px', background: 'var(--bg-2)',
                    padding: '10px 14px',
                  }}>
                    {f.members?.length === 0 ? (
                      <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 10 }}>Nenhum membro ainda.</p>
                    ) : (
                      <div className="stack" style={{ gap: 6, marginBottom: 10 }}>
                        {f.members.map(m => (
                          <div key={m.id} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '7px 10px', background: 'var(--bg-3)', borderRadius: 8,
                            border: '1px solid var(--border)',
                          }}>
                            <div>
                              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{m.nome}</span>
                              {m.isUsed && <span className="badge badge-green" style={{ marginLeft: 8 }}><CheckIcon size={10} /> Check-in</span>}
                            </div>
                            <button className="btn btn-ghost btn-sm" onClick={() => handleRemoveMember(f.id, m.id)} title="Remover da família">
                              <TrashIcon size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Adicionar membro */}
                    {addingTo === f.id ? (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <select value={selectedPerson} onChange={e => setSelectedPerson(e.target.value)} style={{ flex: 1, fontSize: 13 }}>
                          <option value="">Selecionar convidado...</option>
                          {partyGuests.filter(g => !f.members?.find(m => m.id === g.id)).map(g => (
                            <option key={g.id} value={g.id}>{g.nome}{g.familyId ? ' (já tem família)' : ''}</option>
                          ))}
                        </select>
                        <button className="btn btn-primary btn-sm" style={{ width: 'auto' }} onClick={() => handleAddMember(f.id)} disabled={!selectedPerson}>
                          <CheckIcon size={13} />
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => { setAddingTo(null); setSelectedPerson('') }}>✕</button>
                      </div>
                    ) : (
                      <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); setAddingTo(f.id); setSelectedPerson('') }}>
                        + Adicionar membro
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {toDelete && (
        <ConfirmModal
          title="Remover família"
          body={`Remover "${toDelete.familyName}"? Os convidados vinculados não serão removidos.`}
          confirmLabel="Remover" danger
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  )
}

/* ─── Aba: Convidados ─── */
function GuestsTab({ partyId, guests, loading, onRefresh }) {
  const [search, setSearch] = useState('')
  const [alert, setAlert] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [copied, setCopied] = useState(null)

  function copyLink(id) {
    navigator.clipboard.writeText(conviteUrl(id)).then(() => {
      setCopied(id); setTimeout(() => setCopied(null), 2000)
    })
  }

  async function confirmDelete() {
    try {
      await api.removePartyGuest(partyId, toDelete.id)
      onRefresh()
    } catch (e) {
      setAlert({ type: 'error', msg: 'Erro ao remover: ' + e.message })
    } finally { setToDelete(null) }
  }

  const filtered = guests.filter(g => g.nome.toLowerCase().includes(search.toLowerCase()))
  const total = guests.length
  const used  = guests.filter(g => g.isUsed).length

  return (
    <div className="stack">
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
          {loading ? <div className="skeleton" style={{ height: 28, borderRadius: 4 }} /> : <div className="stat-n">{total - used}</div>}
          <div className="stat-l">disponíveis</div>
        </div>
      </div>

      {alert && <Alert type={alert.type}>{alert.msg}</Alert>}

      <div className="search-row">
        <div style={{ position: 'relative', flex: 1 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }}>
            <SearchIcon size={15} />
          </span>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar convidado..." style={{ paddingLeft: 36 }} />
        </div>
        <button className="icon-btn" onClick={onRefresh} title="Atualizar"><RefreshIcon size={16} /></button>
      </div>

      {loading ? (
        <div className="person-grid">
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 240, borderRadius: 16 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="person-grid">
          <div className="empty-state">
            <QrIcon size={40} color="var(--text-3)" />
            <p style={{ marginTop: 12 }}>{search ? 'Nenhum convidado encontrado.' : 'Nenhum convidado ainda.'}</p>
          </div>
        </div>
      ) : (
        <div className="person-grid">
          {filtered.map(p => (
            <div key={p.id} className="person-card">
              <div className="qr-thumb">
                {p.qrCodeIMG
                  ? <img src={p.qrCodeIMG} alt={p.nome} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
                      <QrIcon size={36} color="#ccc" />
                    </div>}
              </div>
              <div className="pc-name">{p.nome}</div>
              {p.family && (
                <div className="flex items-center gap-2 mt-1" style={{ color: 'var(--text-2)', fontSize: 11 }}>
                  <UsersIcon size={11} /> {p.family.familyName}
                </div>
              )}
              <div style={{ marginTop: 8 }}>
                <span className={`badge ${p.isUsed ? 'badge-green' : 'badge-gray'}`}>
                  {p.isUsed ? <><CheckIcon size={10} /> Check-in</> : 'Disponível'}
                </span>
              </div>
              <div className="pc-actions">
                <a href={api.getPdfUrl(p.id)} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" title="PDF">
                  <DownloadIcon />
                </a>
                <button className="btn btn-ghost btn-sm" onClick={() => copyLink(p.id)} title="Link">
                  {copied === p.id ? <CheckIcon size={13} /> : <LinkIcon />}
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => setToDelete(p)} title="Remover">
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {toDelete && (
        <ConfirmModal
          title="Remover convidado"
          body={`Remover "${toDelete.nome}" da lista de convidados desta festa?`}
          confirmLabel="Remover" danger
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  )
}

/* ─── Página da festa ─── */
export default function PartyPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [party, setParty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('create')

  const load = useCallback(async () => {
    setLoading(true)
    try { setParty(await api.getPartyById(id)) }
    catch { navigate('/') }
    finally { setLoading(false) }
  }, [id, navigate])

  useEffect(() => { load() }, [load])

  const guests = party?.guests ?? []

  const tabs = [
    { id: 'create',   label: 'Novo QR',    icon: <QrIcon size={14} /> },
    { id: 'families', label: 'Famílias',   icon: <UsersIcon size={14} /> },
    { id: 'guests',   label: `Convidados ${guests.length ? `(${guests.length})` : ''}`, icon: null },
  ]

  return (
    <div className="page">
      <Topbar
        back={() => navigate('/')}
        title={party?.titulo}
        right={
          <div className="tab-nav">
            {tabs.map(t => (
              <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="container" style={{ paddingTop: '1rem', paddingBottom: '3rem' }}>
        {loading ? (
          <div className="stack">
            <div className="skeleton" style={{ height: 200, borderRadius: 16 }} />
          </div>
        ) : (
          <>
            {tab === 'create'   && <CreateGuestTab partyId={id} onCreated={load} />}
            {tab === 'families' && <FamiliesTab partyGuests={guests} onRefresh={load} />}
            {tab === 'guests'   && <GuestsTab partyId={id} guests={guests} loading={loading} onRefresh={load} />}
          </>
        )}
      </div>
    </div>
  )
}