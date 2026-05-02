import './ConfirmModal.css';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="confirm-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-icon-container">
          <span className="material-symbols-outlined">warning</span>
        </div>
        <h3>{title || 'Delete Entry?'}</h3>
        <p>{message || 'Are you sure you want to delete this entry? This action cannot be undone.'}</p>
        <div className="modal-actions">
          <button className="modal-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="modal-btn-confirm" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}
