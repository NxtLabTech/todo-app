import React from 'react';
import '../styles/modal.css';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, loading }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">{title || 'Confirm Action'}</h3>
        <p className="modal-message">{message}</p>
        
        <div className="modal-actions">
          <button 
            className="btn btn-cancel" 
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            className="btn btn-delete" 
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}