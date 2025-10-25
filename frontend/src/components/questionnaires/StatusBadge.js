import React from 'react';
import './StatusBadge.css';

const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    const configs = {
      'BROUILLON': { label: 'Brouillon', className: 'status-draft' },
      'SOUMIS': { label: 'Soumis', className: 'status-submitted' },
      'EN_ATTENTE': { label: 'En attente', className: 'status-pending' },
      'EN_VALIDATION': { label: 'En validation', className: 'status-validation' },
      'VALIDE': { label: 'Validé', className: 'status-approved' },
      'REJETE': { label: 'Rejeté', className: 'status-rejected' }
    };
    return configs[status] || { label: status, className: 'status-default' };
  };

  const config = getStatusConfig(status);

  return (
    <span className={`status-badge ${config.className}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
