import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api";

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const e = {};

    if (!email.trim()) {
      e.email = "Email is required.";
    } else if (!isValidEmail(email)) {
      e.email = "Enter a valid email (e.g. name@domain.com).";
    }
    const isStrongPassword = (password) =>
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,}$/.test(
        password,
      );
    if (!password) {
      e.password = "Password is required.";
    } else if (!isStrongPassword(password)) {
      e.password =
        "Password must be at least 8 characters and include uppercase, lowercase, number and special character.";
    }

    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const { data } = await loginUser(email.trim(), password);
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("username", data.user.full_name);
      localStorage.setItem("email", data.user.email);
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Login error status:", err.response?.status);
      console.error("Login error data:", err.response?.data);
      console.error("Login error message:", err.message);

      const status = err.response?.status;

      if (err.message === "Network Error") {
        setApiError(
          "Cannot reach the server. Check your internet connection or try again later.",
        );
      } else if (status === 401) {
        setApiError("Invalid email or password. Please check and try again.");
      } else {
        setApiError(
          err.response?.data?.detail || "Login failed. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const clear = (field) => setErrors((prev) => ({ ...prev, [field]: "" }));

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo-badge">✓</div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to manage your todos</p>

        {apiError && <div className="auth-api-error">⚠ {apiError}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="field-group">
            <label className="field-label" htmlFor="login-email">
              Email address
            </label>
            <input
              id="login-email"
              type="email"
              className={`field-input ${errors.email ? "field-input--err" : ""}`}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clear("email");
              }}
              disabled={loading}
              autoComplete="email"
              autoFocus
            />
            {errors.email && <p className="field-error">✗ {errors.email}</p>}
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              className={`field-input ${errors.password ? "field-input--err" : ""}`}
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clear("password");
              }}
              disabled={loading}
              autoComplete="current-password"
            />
            {errors.password && (
              <p className="field-error">✗ {errors.password}</p>
            )}
          </div>

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="auth-switch">
          Don&apos;t have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
