
export default function TodoStats({ todos = [] }) {
  const total = todos.length;
  const completed = todos.filter((todo) => todo.is_completed).length;
  const pending = total - completed;
  const percentage =
    total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <section
      className="todo-stats"
      aria-label="Todo completion statistics"
    >
      <div className="todo-stats-grid">
        <article className="todo-stat-card">
          <span className="todo-stat-label">Total Todos</span>
          <strong className="todo-stat-number">{total}</strong>
        </article>

        <article className="todo-stat-card todo-stat-completed">
          <span className="todo-stat-label">Completed</span>
          <strong className="todo-stat-number">{completed}</strong>
        </article>

        <article className="todo-stat-card todo-stat-pending">
          <span className="todo-stat-label">Pending</span>
          <strong className="todo-stat-number">{pending}</strong>
        </article>
      </div>

      <div className="todo-progress-card">
        <div className="todo-progress-heading">
          <span>Completion Progress</span>
          <strong>{percentage}% Complete</strong>
        </div>

        <div
          className="todo-progress-track"
          role="progressbar"
          aria-label="Todo completion progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percentage}
        >
          <div
            className="todo-progress-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </section>
  );
}
