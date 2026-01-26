import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Bell, X } from 'lucide-react';
import api from '../services/api';
import './NotificationDropdown.css';

const NotificationDropdown = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Charger les notifications
  const loadNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await api.get('/api/notifications/');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger le nombre de notifications non lues
  const loadUnreadCount = async () => {
    if (!user) return;

    try {
      const response = await api.get('/api/notifications/unread_count/');
      setUnreadCount(response.data.unread_count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  // Charger les notifications au montage du composant
  useEffect(() => {
    if (user) {
      loadUnreadCount();
      // Rafraîchir le compteur toutes les 30 secondes
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Charger les notifications quand on ouvre le dropdown
  useEffect(() => {
    if (showDropdown && user) {
      loadNotifications();
    }
  }, [showDropdown, user]);

  // Fermer le dropdown si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Supprimer une notification
  const deleteNotification = async (notificationId) => {
    try {
      // Supprimer localement pour un feedback immédiat
      setNotifications(prev => prev.filter(n => n.id !== notificationId));

      await api.delete(`/api/notifications/${notificationId}/`);

      // Rafraîchir le compteur
      loadUnreadCount();
    } catch (error) {
      console.error('Error deleting notification:', error);
      // En cas d'erreur, recharger les données
      loadNotifications();
      loadUnreadCount();
    }
  };

  // Gérer le clic sur une notification
  const handleNotificationClick = async (notification) => {
    // Supprimer la notification
    await deleteNotification(notification.id);

    // Naviguer vers la réponse associée si elle existe
    if (notification.response_id) {
      let path = `/response/${notification.response_id}`;

      // Adapter la route selon le rôle de l'utilisateur
      if (user?.role === 'ANALYSTE') {
        path = `/analyste/response/${notification.response_id}`;
      } else if (user?.role === 'BUSINESS_OWNER') {
        path = `/business-owner/response/${notification.response_id}`;
      }

      navigate(path);
      setShowDropdown(false);
    }
  };

  // Formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return t('notifications.justNow');
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return t('notifications.minutesAgo', { count: minutes });
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return t('notifications.hoursAgo', { count: hours });
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return t('notifications.daysAgo', { count: days });
    }
  };

  // Ne pas afficher le composant si l'utilisateur n'est pas connecté
  if (!user) {
    return null;
  }

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
      <button
        className="notification-bell"
        onClick={() => setShowDropdown(!showDropdown)}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="notification-dropdown-menu">
          <div className="notification-header">
            <h3>{t('notifications.title')}</h3>
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="notification-loading">
                <div className="loading-spinner"></div>
                <span>{t('notifications.loading')}</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">
                <Bell size={48} className="empty-icon" />
                <p>{t('notifications.noNotifications')}</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-content">
                    <div className="notification-avatar">
                      {notification.sender_avatar ? (
                        <img src={notification.sender_avatar} alt={notification.sender_name} />
                      ) : (
                        <div className="default-avatar">
                          <Bell size={20} />
                        </div>
                      )}
                    </div>
                    <div className="notification-text">
                      <div className="notification-title">{notification.title}</div>
                      <div className="notification-message">{notification.message}</div>
                      <div className="notification-time">{formatDate(notification.created_at)}</div>
                    </div>
                  </div>
                  <div className="notification-actions">
                    <button
                      className="notification-action-btn delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      title={t('notifications.delete')}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
