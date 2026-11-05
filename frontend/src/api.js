import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const token = () => localStorage.getItem('token');
const auth  = () => ({ headers: { Authorization: `Bearer ${token()}` } });

// ── Auth ──────────────────────────────────────────────────────
export const loginUser    = (email, password)            =>
  axios.post(`${API}/auth/login`,    { email, password });

export const registerUser = (username, email, password)  =>
  axios.post(`${API}/auth/register`, { full_name: username, email, password });

// ── Todos (all require JWT) ───────────────────────────────────
const T = `${API}/todos/`;

export const getAllTodos     = ()                  => axios.get(T, auth());
export const createTodo     = (title, description)=> axios.post(T, { title, description }, auth());
export const updateTodo     = (id, data)          => axios.patch(`${API}/todos/${id}`, data, auth());
export const toggleComplete = (id)                => axios.patch(`${API}/todos/${id}/complete`, {}, auth());
export const deleteTodo     = (id)                => axios.delete(`${API}/todos/${id}`, auth());
export const summarizeTodos = ()                  => axios.post(`${API}/todos/summarize`, {}, auth());
export const breakdownTodo   = (id)                => axios.post(`${API}/todos/${id}/breakdown`, {}, auth());
export const toggleSubtask   = (todoId, subtaskId, isCompleted) =>
  axios.patch(`${API}/todos/${todoId}/subtasks/${subtaskId}`, { is_completed: isCompleted }, auth());
export const addSubtask      = (todoId, title)     =>
  axios.post(`${API}/todos/${todoId}/subtasks`, { title }, auth());
export const deleteSubtask   = (todoId, subtaskId) =>
  axios.delete(`${API}/todos/${todoId}/subtasks/${subtaskId}`, auth());

