import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { User, LogOut, Moon, Sun } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand" onClick={() => navigate('/dashboard')}>
        <h2>SecApp</h2>
      </div>

      <div className="nav-user">
        <span className="user-name">{user?.username}</span>

        {/* --- Bouton Dark Mode --- */}
        <button
          onClick={toggleTheme}
          className="btn btn-theme btn-icon-only"
          title={isDarkMode ? "Mode clair" : "Mode sombre"}
        >
          {isDarkMode ? <Sun size={20} strokeWidth={2.2} /> : <Moon size={20} strokeWidth={2.2} />}
        </button>

        {/* --- Bouton Profil --- */}
        <button
          onClick={() => navigate('/profile')}
          className="btn btn-profile btn-icon-only"
          title="Mon Profil"
        >
          <User size={20} strokeWidth={2.2} />
        </button>

        {/* --- Bouton Déconnexion --- */}
        <button
          onClick={handleLogout}
          className="btn btn-logout btn-icon-only"
          title="Déconnexion"
        >
          <LogOut size={20} strokeWidth={2.2} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
