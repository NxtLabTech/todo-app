import { useState } from 'react';
import DeleteConfirmModal from './DeleteConfirmModal';

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

const formatDueDate = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getTodayKey = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

const TITLE_LIMIT = 100;
const DESCRIPTION_LIMIT = 500;

export default function TodoCard({ todo, onToggle, onDelete, onUpdate }) {
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description || '');
  const [editPriority, setEditPriority] = useState(todo.priority || 'medium');
  const [editDueDate, setEditDueDate] = useState(todo.due_date ? todo.due_date.slice(0, 10) : '');
  const [saving, setSaving] = useState(false);
  const editInvalid = !editTitle.trim() ||
    editTitle.length > TITLE_LIMIT ||
    editDescription.length > DESCRIPTION_LIMIT;

  const handleToggle = async () => {
    setToggling(true);
    try {
      await onToggle(todo.id);
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    setDeleting(true);
    try {
      await onDelete(todo.id);
    } catch {
      setDeleting(false);
    }
  };

  const handleSave = async () => {
    if (!editTitle.trim()) return;
    setSaving(true);
    try {
      await onUpdate(todo.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        priority: editPriority,
        due_date: editDueDate ? `${editDueDate}T12:00:00.000Z` : null,
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };
  const dueDateKey = todo.due_date?.slice(0, 10);
  const dueDateStatus = dueDateKey && !todo.is_completed
    ? dueDateKey < getTodayKey() ? 'overdue' : dueDateKey === getTodayKey() ? 'due-today' : ''
    : '';

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
          {editing ? (
            <div className="todo-edit-fields">
              <input
                className="form-input"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
              <p className={`character-counter ${editTitle.length >= TITLE_LIMIT * 0.8 ? 'character-counter--warning' : ''} ${editTitle.length > TITLE_LIMIT ? 'character-counter--error' : ''}`}>
                {editTitle.length}/{TITLE_LIMIT} characters
              </p>
              <input
                className="form-input"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
              <p className={`character-counter ${editDescription.length >= DESCRIPTION_LIMIT * 0.8 ? 'character-counter--warning' : ''} ${editDescription.length > DESCRIPTION_LIMIT ? 'character-counter--error' : ''}`}>
                {editDescription.length}/{DESCRIPTION_LIMIT} characters
              </p>
              <select className="form-input" value={editPriority} onChange={(e) => setEditPriority(e.target.value)}>
                <option value="high">🔴 High Priority</option>
                <option value="medium">🟡 Medium Priority</option>
                <option value="low">🟢 Low Priority</option>
              </select>
              <input
                className="form-input"
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
              />
              <div className="todo-edit-actions">
                <button className="btn btn-primary" type="button" onClick={handleSave} disabled={saving || editInvalid}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button className="btn btn-outline" type="button" onClick={() => setEditing(false)} disabled={saving}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <span className={`todo-title ${todo.is_completed ? 'done' : ''}`}>
              {todo.title}
            </span>
          )}
        </div>

        {!editing && (
          <div className="todo-actions">
            <button className="edit-btn" onClick={() => setEditing(true)} title="Edit todo" aria-label="Edit todo">
              ✎
            </button>
            <button className="delete-btn" onClick={() => setShowDeleteConfirm(true)} disabled={deleting} title="Delete todo" aria-label="Delete todo">
              {deleting ? '…' : '✕'}
            </button>
          </div>
        )}
      </div>
      {showDeleteConfirm && (
        <DeleteConfirmModal
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {/* Description */}
      {!editing && todo.description && (
        <p className="todo-desc">{todo.description}</p>
      )}
      {!editing && todo.due_date && (
        <p className={`todo-due-date ${dueDateStatus}`}>
          Due: {formatDueDate(todo.due_date)}
        </p>
      )}

      {/* Footer: date + status badge */}
      <div className="todo-footer">
        <span className="todo-date">
          {formatDate(todo.created_at)}
        </span>
        {!editing && (
          <div className="todo-badges">
            <span className={`priority-badge priority-${todo.priority || 'medium'}`}>
              {todo.priority === 'high' ? '🔴 High' : todo.priority === 'low' ? '🟢 Low' : '🟡 Medium'}
            </span>
            <span className={`todo-badge ${todo.is_completed ? 'badge-done' : 'badge-pending'}`}>
              {todo.is_completed ? 'Completed' : 'Pending'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
