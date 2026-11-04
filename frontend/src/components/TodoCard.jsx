import { useState } from 'react';
import { PRIORITIES, priorityText } from '../utils/priority';

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

export default function TodoCard({ todo, onToggle, onDelete, onUpdate }) {
  const priority = todo.priority || 'medium';
  const [editing,  setEditing]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [draft,    setDraft]    = useState({ title: '', description: '', priority });
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const startEdit = () => {
    setDraft({ title: todo.title, description: todo.description || '', priority });
    setEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!draft.title.trim()) return;
    setSaving(true);
    try {
      await onUpdate(todo.id, {
        title: draft.title.trim(),
        description: draft.description.trim(),
        priority: draft.priority,
      });
      setEditing(false);
    } catch {
      // keep the form open so the user can retry
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <form className="todo-card todo-edit" onSubmit={handleSave}>
        <div className="form-fields">
          <input
            className="form-input"
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            maxLength={255}
            disabled={saving}
            aria-label="Title"
            autoFocus
          />
          <input
            className="form-input"
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            maxLength={1000}
            disabled={saving}
            placeholder="Description (optional)"
            aria-label="Description"
          />
          <select
            className="form-input"
            value={draft.priority}
            onChange={(e) => setDraft({ ...draft, priority: e.target.value })}
            disabled={saving}
            aria-label="Priority"
          >
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <div className="todo-edit-actions">
            <button className="form-submit" type="submit" disabled={saving || !draft.title.trim()}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button className="edit-cancel" type="button" onClick={() => setEditing(false)} disabled={saving}>
              Cancel
            </button>
          </div>
        </div>
      </form>
    );
  }

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
          className="edit-btn"
          onClick={startEdit}
          title="Edit todo"
          aria-label="Edit todo"
        >
          ✎
        </button>
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
      {todo.description && (
        <p className="todo-desc">{todo.description}</p>
      )}

      {/* Footer: date + status badge */}
      <div className="todo-footer">
        <span className="todo-date">
          {formatDate(todo.created_at)}
        </span>
        <span className={`todo-badge badge-priority-${priority}`}>
          {priorityText(priority)}
        </span>
        <span className={`todo-badge ${todo.is_completed ? 'badge-done' : 'badge-pending'}`}>
          {todo.is_completed ? 'Completed' : 'Pending'}
        </span>
      </div>
    </div>
  );
}
