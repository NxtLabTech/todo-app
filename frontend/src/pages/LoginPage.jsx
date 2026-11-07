import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../api';

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export default function LoginPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors,   setErrors]   = useState({});
  const [apiError, setApiError] = useState('');
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!email.trim())              e.email    = 'Email is required.';
    else if (!isValidEmail(email))  e.email    = 'Enter a valid email (e.g. name@domain.com).';
    if (!password)                  e.password = 'Password is required.';
    else if (password.length < 8)   e.password = 'Password must be at least 8 characters.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const { data } = await loginUser(email.trim(), password);
      localStorage.setItem('token',    data.access_token);
      localStorage.setItem('username', data.user.full_name);
      localStorage.setItem('email',    data.user.email);
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Login error status:', err.response?.status);
      console.error('Login error data:',   err.response?.data);
      console.error('Login error message:', err.message);

      setApiError(
        err.code === 'ECONNABORTED'
          ? 'The server is taking too long to respond. Please try again.'
          : err.message === 'Network Error'
          ? 'Cannot reach the server. Check your internet connection or try again later.'
          : err.response?.status === 401
          ? 'Invalid email or password. Please check and try again.'
          : `Login failed (${err.response?.status ?? 'unknown error'}). Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const clear = (field) => setErrors(prev => ({ ...prev, [field]: '' }));

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo-badge">✓</div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to manage your todos</p>

        {apiError && <div className="auth-api-error">⚠ {apiError}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>

          <div className="field-group">
            <label className="field-label" htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              className={`field-input ${errors.email ? 'field-input--err' : ''}`}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clear('email'); }}
              disabled={loading}
              autoComplete="email"
              autoFocus
            />
            {errors.email && <p className="field-error">✗ {errors.email}</p>}
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="login-password">Password</label>
            <div className="password-field">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className={`field-input ${errors.password ? 'field-input--err' : ''}`}
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clear('password'); }}
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                className="password-toggle"
                type="button"
                onClick={() => setShowPassword(visible => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                disabled={loading}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A10.7 10.7 0 0 1 12 4.9c5.1 0 8.6 4.1 9.8 7.1a10.7 10.7 0 0 1-2.1 3.4M6.2 6.2C3.9 7.7 2.6 10 2.2 12c.5 2.1 2.1 4.7 5.2 6.1 1.4.6 3 .9 4.6.9 1.1 0 2.1-.2 3.1-.5" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M2.2 12c1.2-3 4.7-7.1 9.8-7.1s8.6 4.1 9.8 7.1c-1.2 3-4.7 7.1-9.8 7.1S3.4 15 2.2 12Z" />
                    <circle cx="12" cy="12" r="2.8" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <p className="field-error">✗ {errors.password}</p>}
          </div>

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="auth-switch">
          Don&apos;t have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
