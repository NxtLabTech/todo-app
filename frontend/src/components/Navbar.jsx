import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import LogoutConfirmModal from './LogoutConfirmModal';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // ignore server error — always clear locally
    }
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <span className="navbar-brand">✅ TodoApp</span>
      <div className="navbar-right">
        {user && <span className="navbar-user">Hello, {user.name}</span>}
        <button className="btn btn-outline" onClick={() => setShowLogoutConfirm(true)}>
          Logout
        </button>
      </div>
      {showLogoutConfirm && (
        <LogoutConfirmModal
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </nav>
  );
}
