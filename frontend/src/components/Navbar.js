import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, LogOut } from 'lucide-react'; // ✅ Icônes Lucide
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
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
