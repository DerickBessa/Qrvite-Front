import { UsersIcon } from './Icons'

/**
 * Modal que exibe apenas os nomes dos membros de uma família.
 * Não exibe CPF, telefone, email ou IDs internos.
 */
export function FamilyMembersModal({ family, onClose }) {
  if (!family) return null

  const members = family.members || []

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="family-modal-box" onClick={e => e.stopPropagation()}>
        <div className="family-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UsersIcon size={16} />
            <span className="family-modal-title">{family.familyName}</span>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={onClose}
            style={{ padding: '4px 10px', fontSize: 18, lineHeight: 1 }}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: '1rem' }}>
          {members.length === 0
            ? 'Nenhum membro nesta família.'
            : `${members.length} membro${members.length !== 1 ? 's' : ''}`}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {members.map((member, i) => (
            <div key={member.id} className="family-member-row">
              <div className="family-member-avatar">
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>
                  {member.nome.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="family-member-info">
                <div className="family-member-name">{member.nome}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}