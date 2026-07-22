/**
 * Calculates core statistics (Total, Completed, Pending) and progress percentage 
 * from the given todo list.
 * @param {Array<Object>} todos - The array of todo items.
 * @returns {{total: number, completed: number, pending: number, percentage: number}}
 */
const useTodoStats = (todos) => {
    if (!todos || todos.length === 0) {
        return { total: 0, completed: 0, pending: 0, percentage: 0 };
    }

    // Calculate counts using array methods for efficiency
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const pending = total - completed;

    // Calculate percentage, handling potential division by zero (though checked above)
    const percentage = Math.round((completed / total) * 100);

    return { 
        total: total, 
        completed: completed, 
        pending: pending, 
        percentage: percentage 
    };
};

export default useTodoStats;