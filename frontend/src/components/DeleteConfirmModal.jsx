export default function DeleteConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className="delete-modal-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="delete-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="delete-modal-title">Are you sure you want to delete this todo?</h2>
        <div className="delete-modal-actions">
          <button className="delete-modal-cancel" type="button" onClick={onCancel}>
            Cancel
          </button>
          <button className="delete-modal-confirm" type="button" onClick={onConfirm}>
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}
