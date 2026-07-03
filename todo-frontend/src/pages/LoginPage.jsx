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
        err.message === 'Network Error'
          ? 'Cannot reach the server. Check that the backend is running on port 8080.'
          : err.response?.status === 401
          ? 'Invalid email or password. Please try again.'
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
            <div className="password-input-wrapper">
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
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                    <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                    <line x1="2" y1="2" x2="22" y2="22"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/>
                    <circle cx="12" cy="12" r="3"/>
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
