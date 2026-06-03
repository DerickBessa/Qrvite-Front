import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Topbar } from '../components/Topbar'
import { ConfirmModal } from '../components/ConfirmModal'
import { AlertCircleIcon, CheckCircleIcon, TrashIcon, UsersIcon, CalendarIcon, ChevronRightIcon } from '../components/Icons'
import { api } from '../services/api'

function Alert({ type, children }) {
  const icons = { success: <CheckCircleIcon />, error: <AlertCircleIcon /> }
  return (
    <div className={`alert alert-${type}`} style={{ marginBottom: '1rem' }}>
      {icons[type]}<span>{children}</span>
    </div>
  )
}

function fmt(dateStr) {
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function PartiesPage() {
  const navigate = useNavigate()
  const [parties, setParties] = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [showForm, setShowForm] = useState(false)

  // form
  const [titulo, setTitulo] = useState('')
  const [adminName, setAdminName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try { setParties(await api.getParties()) }
    catch (e) { setAlert({ type: 'error', msg: e.message }) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleCreate() {
    if (!titulo.trim()) { setAlert({ type: 'error', msg: 'O título é obrigatório.' }); return }
    if (!adminName.trim()) { setAlert({ type: 'error', msg: 'O nome do responsável é obrigatório.' }); return }
    if (!startDate || !endDate) { setAlert({ type: 'error', msg: 'Defina as datas de início e fim.' }); return }
    if (new Date(endDate) <= new Date(startDate)) { setAlert({ type: 'error', msg: 'A data de fim deve ser após o início.' }); return }

    setCreating(true); setAlert(null)
    try {
      // Cria a pessoa admin primeiro
      const admin = await api.createPerson({ nome: adminName.trim() })
      const party = await api.createParty({ titulo: titulo.trim(), adminId: admin.id, startDate, endDate })
      setTitulo(''); setAdminName(''); setStartDate(''); setEndDate('')
      setShowForm(false)
      setAlert({ type: 'success', msg: `Festa "${party.titulo}" criada!` })
      await load()
    } catch (e) {
      setAlert({ type: 'error', msg: e.message })
    } finally {
      setCreating(false)
    }
  }

  async function confirmDelete() {
    try {
      await api.deleteParty(toDelete.id)
      setParties(p => p.filter(x => x.id !== toDelete.id))
    } catch (e) {
      setAlert({ type: 'error', msg: 'Erro ao remover: ' + e.message })
    } finally { setToDelete(null) }
  }

  const now = new Date()
  const active = parties.filter(p => new Date(p.endDate) >= now)
  const past   = parties.filter(p => new Date(p.endDate) < now)

  return (
    <div className="page">
      <Topbar />

      <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>Suas festas</h2>
            <p style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 4 }}>Selecione uma festa para gerenciar os convidados.</p>
          </div>
          <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => { setShowForm(v => !v); setAlert(null) }}>
            {showForm ? '✕ Cancelar' : '+ Nova festa'}
          </button>
        </div>

        {alert && <Alert type={alert.type}>{alert.msg}</Alert>}

        {/* Formulário de criação */}
        {showForm && (
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-title"><CalendarIcon size={14} /> Nova festa</div>
            <div className="form-group">
              <label className="field-label">Título da festa *</label>
              <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Casamento Silva & Costa" />
            </div>
            <div className="form-group">
              <label className="field-label">Nome do responsável *</label>
              <input type="text" value={adminName} onChange={e => setAdminName(e.target.value)} placeholder="Ex: João Silva" />
              <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Será criado como convidado administrador da festa.</p>
            </div>
            <div className="form-cols">
              <div className="form-group">
                <label className="field-label">Início *</label>
                <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="field-label">Fim *</label>
                <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </div>
            <button className="btn btn-primary" onClick={handleCreate} disabled={creating}>
              {creating ? <><div className="spinner" /> Criando...</> : 'Criar festa'}
            </button>
          </div>
        )}

        {/* Lista de festas ativas */}
        {loading ? (
          <div className="stack">
            {[1,2].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 16 }} />)}
          </div>
        ) : parties.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Nenhuma festa criada ainda</p>
            <p style={{ fontSize: 14, color: 'var(--text-2)' }}>Crie sua primeira festa para começar a gerar QR codes.</p>
          </div>
        ) : (
          <div className="stack">
            {active.length > 0 && (
              <>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                  Ativas / Futuras
                </p>
                {active.map(p => <PartyCard key={p.id} party={p} onOpen={() => navigate(`/festa/${p.id}`)} onDelete={() => setToDelete(p)} />)}
              </>
            )}
            {past.length > 0 && (
              <>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.07em', textTransform: 'uppercase', marginTop: '0.5rem' }}>
                  Encerradas
                </p>
                {past.map(p => <PartyCard key={p.id} party={p} onOpen={() => navigate(`/festa/${p.id}`)} onDelete={() => setToDelete(p)} past />)}
              </>
            )}
          </div>
        )}
      </div>

      {toDelete && (
        <ConfirmModal
          title="Remover festa"
          body={`Tem certeza que deseja remover "${toDelete.titulo}"? Esta ação não pode ser desfeita.`}
          confirmLabel="Remover"
          danger
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  )
}

function PartyCard({ party, onOpen, onDelete, past }) {
  const guests = party.guests?.length ?? 0
  const checkedIn = party.guests?.filter(g => g.isUsed).length ?? 0
  return (
    <div
      className="card"
      style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'all .2s', opacity: past ? 0.65 : 1 }}
      onClick={onOpen}
      onMouseEnter={e => { if (!past) e.currentTarget.style.borderColor = 'var(--accent)' }}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <div style={{
        width: 52, height: 52, borderRadius: 'var(--radius-md)',
        background: past ? 'var(--bg-4)' : 'var(--accent-bg)',
        border: `1px solid ${past ? 'var(--border)' : 'var(--accent-border)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, flexShrink: 0,
      }}>🎉</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {party.titulo}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <span>📅 {new Date(party.startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <UsersIcon size={11} /> {guests} convidados · {checkedIn} check-ins
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <button
          className="btn btn-danger btn-sm"
          onClick={e => { e.stopPropagation(); onDelete() }}
          title="Remover festa"
        >
          <TrashIcon size={13} />
        </button>
        <ChevronRightIcon size={18} color="var(--text-3)" />
      </div>
    </div>
  )
}