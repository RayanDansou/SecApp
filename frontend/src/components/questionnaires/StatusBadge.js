import React from 'react';
import { useTranslation } from 'react-i18next';
import './StatusBadge.css';

const StatusBadge = ({ status }) => {
  const { t } = useTranslation();

  const getStatusConfig = (status) => {
    const statusMap = {
      'BROUILLON': { key: 'draft', className: 'status-draft' },
      'SOUMIS': { key: 'submitted', className: 'status-submitted' },
      'EN_ATTENTE': { key: 'pending', className: 'status-pending' },
      'EN_VALIDATION': { key: 'in_analysis', className: 'status-validation' },
      'VALIDE': { key: 'validated', className: 'status-approved' },
      'REJETE': { key: 'rejected', className: 'status-rejected' }
    };

    const config = statusMap[status];
    if (config) {
      return { label: t(`status.${config.key}`), className: config.className };
    }
    return { label: status, className: 'status-default' };
  };

  const config = getStatusConfig(status);

  return (
    <span className={`status-badge ${config.className}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
