import { useState } from 'react';

const TITLE_MAX = 100;
const DESC_MAX  = 500;

function CharCounter({ value, max }) {
  const len     = value.length;
  const pct     = len / max;
  const isWarn  = pct >= 0.8 && pct < 1;
  const isError = pct >= 1;

  return (
    <span
      className={`char-counter${isWarn ? ' char-counter--warn' : ''}${isError ? ' char-counter--error' : ''}`}
    >
      {len}/{max}
    </span>
  );
}

export default function TodoForm({ onSubmit }) {
  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');

  const titleOverLimit = title.length > TITLE_MAX;
  const descOverLimit  = description.length > DESC_MAX;
  const isDisabled     = loading || titleOverLimit || descOverLimit;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (titleOverLimit) {
      setError(`Title must be ${TITLE_MAX} characters or fewer.`);
      return;
    }
    if (descOverLimit) {
      setError(`Description must be ${DESC_MAX} characters or fewer.`);
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onSubmit(title.trim(), description.trim());
      setTitle('');
      setDescription('');
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
        <div className="form-field-wrap">
          <input
            className={`form-input${titleOverLimit ? ' form-input--error' : ''}`}
            type="text"
            placeholder="What needs to be done? *"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setError(''); }}
            disabled={loading}
            autoFocus
          />
          <CharCounter value={title} max={TITLE_MAX} />
        </div>

        <div className="form-field-wrap">
          <input
            className={`form-input${descOverLimit ? ' form-input--error' : ''}`}
            type="text"
            placeholder="Add a description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
          <CharCounter value={description} max={DESC_MAX} />
        </div>

        <button
          className="form-submit"
          type="submit"
          disabled={isDisabled}
        >
          {loading ? 'Adding…' : '+ Add Todo'}
        </button>
      </div>
    </form>
  );
}
