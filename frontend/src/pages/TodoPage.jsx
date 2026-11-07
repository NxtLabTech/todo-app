import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TodoForm from '../components/TodoForm';
import TodoCard from '../components/TodoCard';
import LogoutConfirmModal from '../components/LogoutConfirmModal';
import { useTheme } from '../hooks/useTheme';
import { getAllTodos, createTodo, toggleComplete, deleteTodo, summarizeTodos, updateTodo } from '../api';

export default function TodoPage() {
  const [todos,          setTodos]          = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [summary,        setSummary]        = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError,   setSummaryError]   = useState(null);
  const [showSummary,    setShowSummary]    = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortOption, setSortOption] = useState('priority');
  const hasFetchedTodos = useRef(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const username = localStorage.getItem('username') || 'there';

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    navigate('/login', { replace: true });
  }, [navigate]);

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getAllTodos();
      setTodos(data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout();
      } else {
        setError('Could not connect to the server. Check your internet connection or try again later.');
      }
    } finally {
      setLoading(false);
    }
  }, [handleLogout]);

  useEffect(() => {
    if (hasFetchedTodos.current) return;
    hasFetchedTodos.current = true;
    fetchTodos();
  }, [fetchTodos]);

  const handleCreate = async (title, description, priority, dueDate) => {
    const dueDateValue = dueDate ? `${dueDate}T12:00:00.000Z` : null;
    const { data } = await createTodo(title, description, priority, dueDateValue);
    setTodos(prev => [data, ...prev]);
  };

  const handleUpdate = async (id, data) => {
    const { data: updatedTodo } = await updateTodo(id, data);
    setTodos(prev => prev.map(todo => todo.id === id ? updatedTodo : todo));
  };

  const handleToggle = async (id) => {
    const { data } = await toggleComplete(id);
    setTodos(prev => prev.map(t => t.id === id ? data : t));
  };

  const handleDelete = async (id) => {
    await deleteTodo(id);
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const handleSummarize = async () => {
    setSummaryLoading(true);
    setSummaryError(null);
    setSummary(null);
    setShowSummary(true);
    try {
      const { data } = await summarizeTodos();
      setSummary(data.summary);
    } catch {
      setSummaryError('Could not generate summary. Try again!');
    } finally {
      setSummaryLoading(false);
    }
  };

  const closeSummary = () => {
    setShowSummary(false);
    setSummary(null);
    setSummaryError(null);
  };

  const completedCount = todos.filter(t => t.is_completed).length;
  const pendingCount = todos.length - completedCount;
  const completionPercentage = todos.length
    ? Math.round((completedCount / todos.length) * 100)
    : 0;
  const priorityRank = { high: 3, medium: 2, low: 1 };
  const sortedTodos = [...todos].sort((a, b) => {
    if (sortOption === 'due_date') {
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return a.due_date.localeCompare(b.due_date);
    }
    return (priorityRank[b.priority || 'medium'] || 2) - (priorityRank[a.priority || 'medium'] || 2);
  });
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredTodos = sortedTodos.filter(todo => {
    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'completed' ? todo.is_completed : !todo.is_completed);
    const matchesSearch = !normalizedSearch ||
      `${todo.title} ${todo.description || ''}`.toLowerCase().includes(normalizedSearch);
    return matchesFilter && matchesSearch;
  });

  return (
    <div>
      <header className="header">
        <div className="header-inner">
          <div className="header-logo">✓</div>
          <div className="header-text">
            <h1 className="header-title">My Todo List</h1>
            <p className="header-sub">Welcome back, {username}!</p>
          </div>
          <button
            className="theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-pressed={theme === 'dark'}
          >
            <span aria-hidden="true">{theme === 'dark' ? '☀️' : '🌙'}</span>
          </button>
          <button className="logout-btn" onClick={() => setShowLogoutConfirm(true)}>
            Logout
          </button>
        </div>
      </header>

      <main className="main">
        <section className="todo-stats" aria-label="Todo progress">
          <div className="stat-card">
            <span className="stat-label">Total Todos</span>
            <strong className="stat-value">{todos.length}</strong>
          </div>
          <div className="stat-card stat-card--completed">
            <span className="stat-label">Completed</span>
            <strong className="stat-value">{completedCount} <span aria-hidden="true">✅</span></strong>
          </div>
          <div className="stat-card stat-card--pending">
            <span className="stat-label">Pending</span>
            <strong className="stat-value">{pendingCount} <span aria-hidden="true">⏳</span></strong>
          </div>
          <div className="progress-card">
            <div className="progress-header">
              <span className="stat-label">Overall progress</span>
              <strong>{completionPercentage}% Complete</strong>
            </div>
            <div
              className="progress-track"
              role="progressbar"
              aria-label="Todo completion progress"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={completionPercentage}
            >
              <div className="progress-fill" style={{ width: `${completionPercentage}%` }} />
            </div>
          </div>
        </section>

        <TodoForm onSubmit={handleCreate} />

        <section className="todo-filters" aria-label="Search and filter todos">
          <label className="todo-search-label" htmlFor="todo-search">Search todos</label>
          <input
            id="todo-search"
            className="todo-search"
            type="search"
            placeholder="Search by title or description..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <div className="filter-buttons" role="group" aria-label="Filter todos">
            {[
              ['all', `All (${todos.length})`],
              ['pending', `Pending (${pendingCount})`],
              ['completed', `Completed (${completedCount})`],
            ].map(([filter, label]) => (
              <button
                key={filter}
                className={`filter-button ${activeFilter === filter ? 'filter-button--active' : ''}`}
                type="button"
                onClick={() => setActiveFilter(filter)}
                aria-pressed={activeFilter === filter}
              >
                {label}
              </button>
            ))}
          </div>
          <label className="sort-label" htmlFor="todo-sort">Sort by</label>
          <select
            id="todo-sort"
            className="todo-sort"
            value={sortOption}
            onChange={(event) => setSortOption(event.target.value)}
          >
            <option value="priority">Priority (high first)</option>
            <option value="due_date">Due date (soonest first)</option>
          </select>
        </section>

        <div className="summarize-wrap">
          <button
            className="btn btn-ai"
            onClick={handleSummarize}
            disabled={summaryLoading || todos.length === 0}
          >
            {summaryLoading ? (
              <>
                <span className="spinner-inline" />
                AI is analyzing your todos…
              </>
            ) : (
              '✨ Summarize My Todos'
            )}
          </button>
        </div>

        {showSummary && (
          <div className="ai-summary-card">
            <div className="ai-summary-header">
              <span className="ai-summary-title">✨ AI Summary</span>
              <button className="ai-summary-close" onClick={closeSummary} aria-label="Close summary">
                ✕
              </button>
            </div>
            {summaryLoading ? (
              <p className="ai-summary-text">AI is analyzing your todos…</p>
            ) : summaryError ? (
              <p className="ai-summary-error">{summaryError}</p>
            ) : (
              <p className="ai-summary-text">{summary}</p>
            )}
          </div>
        )}

        {loading && (
          <div className="spinner-wrap">
            <div className="spinner" />
            <p className="spinner-label">Loading your todos…</p>
          </div>
        )}

        {error && !loading && (
          <div className="error-banner">
            <span>⚠ {error}</span>
            <button className="retry-btn" onClick={fetchTodos}>Retry</button>
          </div>
        )}

        {!loading && !error && todos.length === 0 && (
          <div className="empty-state" role="status" aria-live="polite">
            <div className="empty-icon" aria-hidden="true">✅</div>
            <p className="empty-text">You have no todos yet!</p>
            <p className="empty-hint">Click &apos;+ Add Todo&apos; to get started</p>
          </div>
        )}

        {!loading && !error && todos.length > 0 && filteredTodos.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔎</div>
            <p className="empty-text">No results found</p>
            <p className="empty-hint">Try a different search or filter.</p>
          </div>
        )}

        {!loading && !error && filteredTodos.length > 0 && (
          <ul className="todo-list">
            {filteredTodos.map(todo => (
              <li key={todo.id}>
                <TodoCard
                  todo={todo}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                />
              </li>
            ))}
          </ul>
        )}
      </main>
      {showLogoutConfirm && (
        <LogoutConfirmModal
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </div>
  );
}
