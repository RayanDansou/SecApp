import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate as formatDateUtil } from '../../utils/dateFormatter';
import './DocumentsManager.css';

const DocumentsManager = ({
  documents,
  onUpload,
  onDelete,
  canUpload = true,
  canDelete = true,
  title = "Documents"
}) => {
  const { t, i18n } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Vérifier la taille du fichier (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError(t('documents.fileTooLarge'));
      return;
    }

    // Vérifier le type de fichier
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    if (!allowedTypes.includes(file.type)) {
      setError(t('documents.invalidFileType'));
      return;
    }

    setUploading(true);
    setError('');

    try {
      await onUpload(file);
      // Réinitialiser l'input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err.error || t('documents.uploadError'));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm(t('documents.confirmDeleteDocument'))) {
      return;
    }

    try {
      await onDelete(docId);
    } catch (err) {
      setError(err.error || t('documents.deleteError'));
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
      'pdf': '📄',
      'doc': '📝',
      'docx': '📝',
      'txt': '📃'
    };
    return icons[ext] || '📄';
  };

  return (
    <div className="documents-manager">
      <div className="documents-header">
        <h3>{title} ({documents?.length || 0})</h3>
        {canUpload && (
          <div className="upload-section">
            <input
              ref={fileInputRef}
              type="file"
              id="file-upload"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              disabled={uploading}
            />
            <label htmlFor="file-upload" className={`upload-button ${uploading ? 'disabled' : ''}`}>
              {uploading ? 'Upload en cours...' : '+ Ajouter un document'}
            </label>
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {!documents || documents.length === 0 ? (
        <p className="no-documents">Aucun document pour le moment</p>
      ) : (
        <div className="documents-list">
          {documents.map((doc) => (
            <div key={doc.id} className={`document-item ${doc.isPending ? 'pending' : ''}`}>
              <div className="document-icon">
                {getFileIcon(doc.filename)}
              </div>
              <div className="document-info">
                <div className="document-name">
                  {doc.filename}
                  {doc.isPending && <span className="pending-badge">⏳ En attente</span>}
                </div>
                <div className="document-meta">
                  {doc.isPending ? 'Sera uploadé lors de la sauvegarde/soumission' : `Ajouté le ${formatDateUtil(doc.uploaded_at, i18n.language)}`}
                </div>
              </div>
              <div className="document-actions">
                {!doc.isPending && (
                  <>
                    <a
                      href={doc.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-button view"
                      title="Voir le document"
                    >
                      👁️
                    </a>
                    <a
                      href={doc.file}
                      download
                      className="action-button download"
                      title="Télécharger"
                    >
                      ⬇️
                    </a>
                  </>
                )}
                {canDelete && (
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="action-button delete"
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentsManager;
