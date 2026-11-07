import axios from 'axios';

const API = import.meta.env.PROD
  ? 'https://todo-backend-905909364020.asia-south1.run.app'
  : (import.meta.env.VITE_API_URL || 'http://localhost:8080');
const http = axios.create({ baseURL: API, timeout: 15000 });
let warmupPromise;

const token = () => localStorage.getItem('token');
const auth  = () => ({ headers: { Authorization: `Bearer ${token()}` } });

export const warmupBackend = () => {
  if (!warmupPromise) {
    warmupPromise = http.get('/health', { timeout: 10000 }).catch((error) => {
      console.warn('Backend warmup request failed:', error.message);
    });
  }
  return warmupPromise;
};

// ── Auth ──────────────────────────────────────────────────────
export const loginUser    = (email, password)            =>
  http.post('/auth/login', { email, password });

export const registerUser = (username, email, password)  =>
  http.post('/auth/register', { full_name: username, email, password });

// ── Todos (all require JWT) ───────────────────────────────────
const T = `${API}/todos/`;

export const getAllTodos     = ()                  => http.get(T, auth());
export const createTodo     = (title, description, priority = 'medium', dueDate = null) =>
  http.post(T, { title, description, priority, due_date: dueDate }, auth());
export const updateTodo     = (id, data)          => http.patch(`${API}/todos/${id}`, data, auth());
export const toggleComplete = (id)                => http.patch(`${API}/todos/${id}/complete`, {}, auth());
export const deleteTodo     = (id)                => http.delete(`${API}/todos/${id}`, auth());
export const summarizeTodos = ()                  => http.post(`${API}/todos/summarize`, {}, auth());
