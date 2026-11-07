import { useState } from 'react';

const TITLE_LIMIT = 100;
const DESCRIPTION_LIMIT = 500;

export default function TodoForm({ onSubmit }) {
  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [priority,    setPriority]    = useState('medium');
  const [dueDate,     setDueDate]     = useState('');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const titleExceeded = title.length > TITLE_LIMIT;
  const descriptionExceeded = description.length > DESCRIPTION_LIMIT;
  const isInvalid = titleExceeded || descriptionExceeded;

  const counterClass = (length, limit) => {
    if (length > limit) return 'character-counter character-counter--error';
    if (length >= limit * 0.8) return 'character-counter character-counter--warning';
    return 'character-counter';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (isInvalid) {
      setError('Please shorten the fields to their character limits.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onSubmit(title.trim(), description.trim(), priority, dueDate);
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
    } catch {
      setError('Failed to add todo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <h2 className="todo-form-heading">
        Add New Todo
      </h2>

      {error && <p className="form-error">⚠ {error}</p>}

      <div className="form-fields">
        <input
          className="form-input"
          type="text"
          placeholder="What needs to be done? *"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setError(''); }}
          disabled={loading}
          autoFocus
        />
        <p className={counterClass(title.length, TITLE_LIMIT)}>
          {title.length}/{TITLE_LIMIT} characters
        </p>
        <input
          className="form-input"
          type="text"
          placeholder="Add a description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
        />
        <p className={counterClass(description.length, DESCRIPTION_LIMIT)}>
          {description.length}/{DESCRIPTION_LIMIT} characters
        </p>
        <select
          className="form-input"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          disabled={loading}
          aria-label="Todo priority"
        >
          <option value="high">🔴 High Priority</option>
          <option value="medium">🟡 Medium Priority</option>
          <option value="low">🟢 Low Priority</option>
        </select>
        <label className="form-field-label" htmlFor="todo-due-date">Due Date</label>
        <input
          id="todo-due-date"
          className="form-input"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          disabled={loading}
        />
        <button className="form-submit" type="submit" disabled={loading || isInvalid}>
          {loading ? 'Adding…' : '+ Add Todo'}
        </button>
      </div>
    </form>
  );
}
