# Todo Application Frontend

## Project
React + Vite frontend for Todo List application.
Backend already running at http://localhost:8001
Do NOT generate backend code. Only frontend.

## Commands
npm install        → install dependencies
npm run dev        → run dev server (http://localhost:5173)
npm run build      → build for production

## Tech Stack
- React (Vite)
- React Router DOM v6
- Axios
- react-hot-toast
- Context API
- Functional Components + Hooks
- Modern CSS

## Environment Variable
VITE_API_URL=http://localhost:8001
Every API request must use this base URL.

## Authentication
- JWT token stored in localStorage
- Send Authorization: Bearer {token} on every protected request
- On 401 error → clear token → redirect to /login
- ProtectedRoute redirects to /login if no token

## Backend API Endpoints

### Auth (Public)
POST /auth/register → {name, email, password} → UserResponse
POST /auth/login    → {email, password} → {user, access_token, token_type}
POST /auth/logout   → clears session
GET  /auth/me       → returns current user (protected)

### Todos (All need Bearer token)
GET    /todos/           → returns list of todos
POST   /todos/           → {title, description} → TodoResponse
PATCH  /todos/{todo_id}  → {title?, description?, completed?}
DELETE /todos/{todo_id}  → 204 no content

### Response Schemas
LoginResponse: {
  user: { id, name, email, role, created_at, updated_at },
  access_token: "eyJxxx...",
  token_type: "bearer"
}
TodoResponse: {
  id, user_id, title, description,
  completed, created_at, updated_at
}

## Pages
/login      → LoginPage (public)
/register   → RegisterPage (public)
/dashboard  → DashboardPage (protected)
/           → redirect to /dashboard

## Folder Structure
src/
├── components/
│   ├── Navbar.jsx        ← top nav with username + logout
│   ├── TodoForm.jsx      ← form to add new todo
│   ├── TodoCard.jsx      ← single todo card
│   ├── Loader.jsx        ← spinner component
│   └── ProtectedRoute.jsx← redirects if not logged in
├── pages/
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   └── DashboardPage.jsx
├── context/
│   └── AuthContext.jsx   ← global auth state
├── services/
│   └── api.js            ← axios instance + all API calls
├── hooks/
│   └── useTodos.js       ← todo CRUD logic
├── styles/
│   ├── global.css
│   ├── auth.css
│   ├── dashboard.css
│   └── todo.css
├── utils/
│   └── helpers.js
├── App.jsx
└── main.jsx

## Architecture Rules
- All API calls ONLY through services/api.js
- Auth state ONLY in AuthContext
- No business logic in components
- Components only handle UI
- Always show loading during API calls
- Always show toast notifications for success/error
- Validate forms before submitting

## UI Style
- Modern design like Notion / Todoist / Linear
- Blue theme (#2563eb as primary color)
- Rounded cards with soft shadows
- Hover animations
- Clean spacing
- Fully responsive (mobile + desktop)

## State Management (AuthContext)
Stores:
- token (string or null)
- user (object or null)
- isAuthenticated (boolean)
- login(token, user) function
- logout() function

## Features
- Register new account
- Login / Logout
- Protected routes
- View all todos
- Create todo
- Edit todo (inline)
- Delete todo
- Mark complete / incomplete (checkbox)
- Toast notifications (react-hot-toast)
- Loading spinners
- Form validation
- Error handling
- Responsive design
- Axios interceptors (auto attach token)
