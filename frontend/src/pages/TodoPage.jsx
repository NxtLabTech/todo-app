
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TodoForm from '../components/TodoForm';
import TodoCard from '../components/TodoCard';
import TodoStats from '../components/TodoStats';
import '../styles/todoStats.css';
import {
  getAllTodos,
  createTodo,
  toggleComplete,
  deleteTodo,
  summarizeTodos,
} from '../api';

export default function TodoPage() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);
  const [showSummary, setShowSummary] = useState(false);

  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'there';

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    navigate('/login', { replace: true });
  }, [navigate]);

  useEffect(() => {
    let cancelled = false;

    async function loadTodos() {
      try {
        const { data } = await getAllTodos();

        if (!cancelled) {
          setTodos(data);
          setError(null);
        }
      } catch (err) {
        if (cancelled) return;

        if (err.response?.status === 401 || err.response?.status === 403) {
          handleLogout();
        } else {
          setError(
            'Could not connect to the server. Check your internet connection or try again later.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTodos();

    return () => {
      cancelled = true;
    };
  }, [handleLogout]);

  const fetchTodos = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await getAllTodos();
      setTodos(data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout();
      } else {
        setError(
          'Could not connect to the server. Check your internet connection or try again later.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (title, description) => {
    try {
      const { data } = await createTodo(title, description);
      setTodos((prev) => [data, ...prev]);
      setError(null);
    } catch {
      setError('Failed to add todo. Please try again.');
    }
  };

  const handleToggle = async (id) => {
    try {
      const { data } = await toggleComplete(id);
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? data : todo))
      );
      setError(null);
    } catch {
      setError('Failed to update todo. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTodo(id);
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
      setError(null);
    } catch {
      setError('Failed to delete todo. Please try again.');
    }
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

  return (
    <div>
      <header className="header">
        <div className="header-inner">
          <div className="header-logo">✓</div>

          <div className="header-text">
            <h1 className="header-title">My Todo List</h1>
            <p className="header-sub">Welcome back, {username}!</p>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="main">
        <TodoStats todos={todos} />

        <TodoForm onSubmit={handleCreate} />

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
              <button
                className="ai-summary-close"
                onClick={closeSummary}
                aria-label="Close summary"
              >
                ✕
              </button>
            </div>

            {summaryLoading ? (
              <p className="ai-summary-text">
                AI is analyzing your todos…
              </p>
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
            <button className="retry-btn" onClick={fetchTodos}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && todos.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p className="empty-text">No todos yet!</p>
            <p className="empty-hint">
              Use the form above to add your first task.
            </p>
          </div>
        )}

        {!loading && !error && (
          <ul className="todo-list">
            {todos.map((todo) => (
              <li key={todo.id}>
                <TodoCard
                  todo={todo}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
