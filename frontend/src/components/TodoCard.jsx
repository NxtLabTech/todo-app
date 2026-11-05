import { useState } from 'react';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
};

export default function TodoCard({
  todo,
  onToggle,
  onDelete,
  onBreakdown,
  onToggleSubtask,
  onAddSubtask,
  onDeleteSubtask,
}) {
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [breakingDown, setBreakingDown] = useState(false);
  const [breakdownError, setBreakdownError] = useState('');
  const [subtasksOpen, setSubtasksOpen] = useState(true);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [addingSubtask, setAddingSubtask] = useState(false);
  const [subtaskTogglingId, setSubtaskTogglingId] = useState(null);
  const [subtaskDeletingId, setSubtaskDeletingId] = useState(null);

  const subtasks = todo.subtasks || [];
  const completedSubtasks = subtasks.filter((s) => s.is_completed).length;
  const progressPercent =
    subtasks.length > 0
      ? Math.round((completedSubtasks / subtasks.length) * 100)
      : 0;

  const handleToggle = async () => {
    setToggling(true);
    try {
      await onToggle(todo.id);
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${todo.title}"?`)) return;
    setDeleting(true);
    try {
      await onDelete(todo.id);
    } catch {
      setDeleting(false);
    }
  };

  const handleBreakdown = async () => {
    if (!onBreakdown || breakingDown) return;
    setBreakingDown(true);
    setBreakdownError('');
    try {
      await onBreakdown(todo.id);
      setSubtasksOpen(true);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        'Failed to break down task. Please try again.';
      setBreakdownError(msg);
    } finally {
      setBreakingDown(false);
    }
  };

  const handleToggleSubtaskItem = async (subtaskId, currentStatus) => {
    if (!onToggleSubtask || subtaskTogglingId) return;
    setSubtaskTogglingId(subtaskId);
    try {
      await onToggleSubtask(todo.id, subtaskId, !currentStatus);
    } finally {
      setSubtaskTogglingId(null);
    }
  };

  const handleAddSubtaskSubmit = async (e) => {
    e.preventDefault();
    const title = newSubtaskTitle.trim();
    if (!title || !onAddSubtask || addingSubtask) return;
    setAddingSubtask(true);
    try {
      await onAddSubtask(todo.id, title);
      setNewSubtaskTitle('');
    } finally {
      setAddingSubtask(false);
    }
  };

  const handleDeleteSubtaskItem = async (subtaskId) => {
    if (!onDeleteSubtask || subtaskDeletingId) return;
    setSubtaskDeletingId(subtaskId);
    try {
      await onDeleteSubtask(todo.id, subtaskId);
    } finally {
      setSubtaskDeletingId(null);
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
            aria-label={`Mark "${todo.title}" as ${
              todo.is_completed ? 'incomplete' : 'complete'
            }`}
          />
          <span className={`todo-title ${todo.is_completed ? 'done' : ''}`}>
            {todo.title}
          </span>
        </div>

        <button
          className="delete-btn"
          onClick={handleDelete}
          disabled={deleting}
          title="Delete todo"
          aria-label="Delete todo"
        >
          {deleting ? '…' : '✕'}
        </button>
      </div>

      {/* Description */}
      {todo.description && <p className="todo-desc">{todo.description}</p>}

      {/* Subtasks Section */}
      {subtasks.length > 0 && (
        <div className="subtasks-container">
          <div className="subtasks-header">
            <button
              type="button"
              className="subtasks-toggle-btn"
              onClick={() => setSubtasksOpen(!subtasksOpen)}
              aria-label={subtasksOpen ? 'Hide steps' : 'Show steps'}
            >
              <span className={`toggle-icon ${subtasksOpen ? 'open' : ''}`}>
                ▶
              </span>
              <span className="subtasks-summary-text">
                Subtasks ({completedSubtasks}/{subtasks.length})
              </span>
            </button>
            <span className="subtasks-progress-badge">
              {progressPercent}% done
            </span>
          </div>

          {/* Progress Bar */}
          <div className="subtasks-progress-track">
            <div
              className="subtasks-progress-bar"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Collapsible Subtasks List */}
          {subtasksOpen && (
            <div className="subtasks-list-wrapper">
              <ul className="subtasks-list">
                {subtasks.map((subtask) => {
                  const isBusy =
                    subtaskTogglingId === subtask.id ||
                    subtaskDeletingId === subtask.id;
                  return (
                    <li
                      key={subtask.id}
                      className={`subtask-item ${
                        subtask.is_completed ? 'subtask--done' : ''
                      }`}
                    >
                      <label className="subtask-label">
                        <input
                          type="checkbox"
                          className="subtask-checkbox"
                          checked={subtask.is_completed}
                          disabled={isBusy}
                          onChange={() =>
                            handleToggleSubtaskItem(
                              subtask.id,
                              subtask.is_completed
                            )
                          }
                        />
                        <span className="subtask-text">{subtask.title}</span>
                      </label>

                      {onDeleteSubtask && (
                        <button
                          type="button"
                          className="subtask-delete-btn"
                          disabled={isBusy}
                          onClick={() => handleDeleteSubtaskItem(subtask.id)}
                          title="Remove step"
                          aria-label="Remove step"
                        >
                          ✕
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>

              {/* Add Subtask Inline Form */}
              {onAddSubtask && (
                <form
                  className="subtask-add-form"
                  onSubmit={handleAddSubtaskSubmit}
                >
                  <input
                    type="text"
                    className="subtask-add-input"
                    placeholder="Add a step..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    disabled={addingSubtask}
                    maxLength={200}
                  />
                  <button
                    type="submit"
                    className="subtask-add-btn"
                    disabled={addingSubtask || !newSubtaskTitle.trim()}
                    title="Add step"
                  >
                    {addingSubtask ? '…' : '+ Add'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      )}

      {/* Breakdown Error Alert */}
      {breakdownError && (
        <div className="subtask-error-alert">
          <span>⚠ {breakdownError}</span>
          <button
            type="button"
            className="subtask-error-close"
            onClick={() => setBreakdownError('')}
          >
            ✕
          </button>
        </div>
      )}

      {/* Footer: date + breakdown button + status badge */}
      <div className="todo-footer">
        <div className="todo-footer-left">
          <span className="todo-date">{formatDate(todo.created_at)}</span>

          {onBreakdown && !todo.is_completed && (
            <button
              type="button"
              className="btn-breakdown"
              onClick={handleBreakdown}
              disabled={breakingDown}
              title="Break down this task into actionable steps using Gemini AI"
            >
              {breakingDown ? (
                <>
                  <span className="spinner-inline-sm" />
                  Decomposing…
                </>
              ) : subtasks.length > 0 ? (
                '✨ Re-break Down'
              ) : (
                '✨ Break Down'
              )}
            </button>
          )}
        </div>

        <span
          className={`todo-badge ${
            todo.is_completed ? 'badge-done' : 'badge-pending'
          }`}
        >
          {todo.is_completed ? 'Completed' : 'Pending'}
        </span>
      </div>
    </div>
  );
}
