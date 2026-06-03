export function ConfirmModal({ title, body, onConfirm, onCancel, confirmLabel = 'Confirmar', danger = false }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{body}</p>
        <div className="modal-actions">
          <button className="btn btn-ghost btn-full" onClick={onCancel}>Cancelar</button>
          <button
            className={`btn btn-full ${danger ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
