export default function LogoutConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className="logout-modal-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="logout-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="logout-modal-title">Are you sure you want to logout?</h2>
        <div className="logout-modal-actions">
          <button className="logout-modal-cancel" type="button" onClick={onCancel}>
            Cancel
          </button>
          <button className="logout-modal-confirm" type="button" onClick={onConfirm}>
            Yes, Logout
          </button>
        </div>
      </div>
    </div>
  );
}
