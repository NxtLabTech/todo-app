import { useState } from 'react';
import ConfirmModal from './ConfirmModal';

export default function TodoCard({ todo, onToggle, onDelete }) {
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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
    } catch (err) {
      setDeleting(false);
    } finally {
      setShowConfirmModal(false);
    }
  };

  return (
    <>
      <div className={`todo-card ${todo.is_completed ? 'completed' : ''}`}>
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
          
          {/* Delete Button - Triggers Confirmation Modal */}
          <button
            className="delete-btn"
            onClick={() => setShowConfirmModal(true)}
            disabled={deleting}
            title="Delete todo"
            aria-label="Delete todo"
          >
            ✕
          </button>
        </div>

        {todo.description && (
          <p className="todo-desc">{todo.description}</p>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        title="Delete Todo"
        message="Are you sure you want to delete this todo?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirmModal(false)}
        loading={deleting}
      />
    </>
  );
}