import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';
import './UserManagement.css';

const UserManagement = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // États pour la suppression
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Charger la liste des utilisateurs
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await authService.getUsers();
      setUsers(data);
    } catch (err) {
      setError(err.error || t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  // Ouvrir le modal de confirmation de suppression
  const handleOpenDeleteModal = (userItem) => {
    // Empêcher un admin de supprimer son propre compte
    if (userItem.id === user?.id) {
      setError(t('admin.cannotDeleteSelf'));
      return;
    }

    setUserToDelete(userItem);
    setShowDeleteModal(true);
    setDeleteError('');
  };

  // Fermer le modal de confirmation de suppression
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
    setDeleteError('');
  };

  // Supprimer l'utilisateur
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setLoadingDelete(true);
    setDeleteError('');

    try {
      await authService.deleteAccount(userToDelete.id);
      // Retirer l'utilisateur de la liste
      setUsers(users.filter(u => u.id !== userToDelete.id));
      handleCloseDeleteModal();
    } catch (error) {
      setDeleteError(error.error || t('errors.generic'));
    } finally {
      setLoadingDelete(false);
    }
  };

  const getRoleDisplayName = (role) => {
    return t(`roles.${role}`, role);
  };

  if (loading) {
    return (
      <div className="user-management-container">
        <div className="loading-message">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="user-management-container">
      <div className="user-management-content">
        <div className="user-management-header">
          <h1>{t('admin.userManagement')}</h1>
          <p>{t('admin.totalUsers', { count: users.length })}</p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>{t('auth.username')}</th>
                <th>{t('auth.email')}</th>
                <th>{t('auth.role')}</th>
                <th>{t('profile.joinedOn')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((userItem) => (
                <tr key={userItem.id}>
                  <td>
                    <div className="user-info">
                      <span className="user-name">{userItem.username}</span>
                      {userItem.id === user?.id && (
                        <span className="current-user-badge">{t('common.you')}</span>
                      )}
                    </div>
                  </td>
                  <td>{userItem.email}</td>
                  <td>
                    <span className="role-badge">
                      {getRoleDisplayName(userItem.role)}
                    </span>
                  </td>
                  <td>
                    {userItem.date_joined
                      ? new Date(userItem.date_joined).toLocaleDateString('fr-FR')
                      : 'N/A'}
                  </td>
                  <td>
                    <button
                      className="btn btn-danger-small"
                      onClick={() => handleOpenDeleteModal(userItem)}
                      disabled={userItem.id === user?.id}
                    >
                      {t('admin.deleteUser')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="no-users-message">
              {t('admin.noUsers')}
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && userToDelete && (
        <div className="modal-overlay" onClick={handleCloseDeleteModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('admin.confirmDeleteUser', { username: userToDelete.username })}</h2>
              <button className="modal-close" onClick={handleCloseDeleteModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-warning">
                {t('admin.confirmDeleteUserMessage')}
              </p>

              {deleteError && (
                <div className="alert alert-error">
                  {deleteError}
                </div>
              )}

              <div className="user-details">
                <p><strong>{t('auth.username')}:</strong> {userToDelete.username}</p>
                <p><strong>{t('auth.email')}:</strong> {userToDelete.email}</p>
                <p><strong>{t('auth.role')}:</strong> {getRoleDisplayName(userToDelete.role)}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={handleCloseDeleteModal}
                disabled={loadingDelete}
              >
                {t('common.cancel')}
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDeleteUser}
                disabled={loadingDelete}
              >
                {loadingDelete ? t('profile.deletingAccount') : t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
