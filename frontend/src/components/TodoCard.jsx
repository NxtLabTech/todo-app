import { useState } from 'react';
import ConfirmModal from './ConfirmModal';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year:   'numeric',
      month:  'short',
      day:    'numeric',
      hour:   '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
};

export default function TodoCard({ todo, onToggle, onDelete }) {
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleToggle = async () => {
    setToggling(true);
    try {
      await onToggle(todo.id);
    } finally {
      setToggling(false);
    }
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(todo.id);
    } catch {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className={`todo-card ${todo.is_completed ? 'completed' : ''}`}>
      {/* Top row: checkbox + title + delete */}
      <div className="todo-card-top">
        <div className="todo-left">
          <input
            type="checkbox"
            className="todo-checkbox"
            checked={todo.is_completed}
            onChange={handleToggle}
            disabled={toggling}
            aria-label={`Mark "${todo.title}" as ${todo.is_completed ? 'incomplete' : 'complete'}`}
          />
          <span className={`todo-title ${todo.is_completed ? 'done' : ''}`}>
            {todo.title}
          </span>
        </div>

        <button
          className="delete-btn"
          onClick={() => setShowConfirm(true)}
          disabled={deleting}
          title="Delete todo"
          aria-label="Delete todo"
        >
          {deleting ? '…' : '✕'}
        </button>
      </div>

      {/* Description */}
      {todo.description && (
        <p className="todo-desc">{todo.description}</p>
      )}

      {/* Footer: date + status badge */}
      <div className="todo-footer">
        <span className="todo-date">
          {formatDate(todo.created_at)}
        </span>
        <span className={`todo-badge ${todo.is_completed ? 'badge-done' : 'badge-pending'}`}>
          {todo.is_completed ? 'Completed' : 'Pending'}
        </span>
      </div>

      {showConfirm && (
        <ConfirmModal
          loading={deleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
