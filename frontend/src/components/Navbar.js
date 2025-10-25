import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
        <button onClick={() => navigate('/profile')} className="btn btn-profile">
          Mon Profil
        </button>
        <button onClick={handleLogout} className="btn btn-logout">
          Déconnexion
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
