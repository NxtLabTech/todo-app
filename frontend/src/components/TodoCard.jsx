import { useState } from 'react';

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
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description || '');
  const [priorityDraft, setPriorityDraft] = useState(todo.priority || 'medium');
  const priority = todo.priority || 'medium';

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

  const handleSave = async (event) => {
    event.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onUpdate(todo.id, { title: title.trim(), description: description.trim(), priority: priorityDraft });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const startEditing = () => {
    setTitle(todo.title);
    setDescription(todo.description || '');
    setPriorityDraft(todo.priority || 'medium');
    setEditing(true);
  };

  return (
    <div className={`todo-card ${todo.is_completed ? 'completed' : ''}`}>
      {editing ? (
        <form className="todo-edit-form" onSubmit={handleSave}>
          <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} maxLength={255} required aria-label="Todo title" />
          <input className="form-input" value={description} onChange={e => setDescription(e.target.value)} maxLength={1000} placeholder="Description" aria-label="Todo description" />
          <label className="priority-field">Priority
            <select className="form-input" value={priorityDraft} onChange={e => setPriorityDraft(e.target.value)} aria-label="Priority">
              <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
            </select>
          </label>
          <div className="todo-edit-actions">
            <button className="btn btn-primary btn-sm" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            <button className="btn btn-outline btn-sm" type="button" onClick={() => setEditing(false)} disabled={saving}>Cancel</button>
          </div>
        </form>
      ) : <>
      {/* Top row: checkbox + title + actions */}
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

        <button className="btn btn-outline btn-sm" onClick={startEditing} aria-label="Edit todo">Edit</button>
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
        <span className={`todo-badge ${todo.is_completed ? 'badge-done' : 'badge-pending'}`}>
          {todo.is_completed ? 'Completed' : 'Pending'}
        </span>
        <span className={`priority-badge priority-${priority}`}>{priority} priority</span>
      </div>
      </>}
    </div>
  );
}
