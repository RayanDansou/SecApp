import React, { useState, useEffect } from 'react';
import questionnaireService from '../../services/questionnaireService';
import './StatusHistory.css';

const StatusHistory = ({ responseId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [responseId]);

  const loadHistory = async () => {
    try {
      const data = await questionnaireService.getStatusHistory(responseId);
      setHistory(data);
    } catch (err) {
      console.error('Erreur chargement historique:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="history-loading">Chargement de l'historique...</div>;
  }

  return (
    <div className="status-history">
      <h3>Historique des statuts</h3>
      {history.length === 0 ? (
        <p className="no-history">Aucun historique disponible</p>
      ) : (
        <div className="history-timeline">
          {history.map((entry, index) => (
            <div key={entry.id} className={`history-item ${index === 0 ? 'latest' : ''}`}>
              <div className="history-marker"></div>
              <div className="history-content">
                <div className="history-header">
                  <span className="history-status">
                    {entry.old_status_display && (
                      <>{entry.old_status_display} → </>
                    )}
                    <strong>{entry.new_status_display}</strong>
                  </span>
                  <span className="history-date">{formatDate(entry.changed_at)}</span>
                </div>
                <div className="history-user">
                  Par: {entry.changed_by?.first_name} {entry.changed_by?.last_name}
                </div>
                {entry.comment && (
                  <div className="history-comment">{entry.comment}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatusHistory;
