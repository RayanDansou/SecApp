import React, { useState } from 'react';
import { Download, FileText, File } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import questionnaireService from '../services/questionnaireService';
import '../styles/ExportButtons.css';

/**
 * Composant pour exporter les rapports d'analyse en PDF et Word.
 * Affiche les boutons d'export pour les questionnaires validés/rejetés.
 *
 * @param {number} responseId - ID de la réponse au questionnaire
 * @param {string} status - Statut du questionnaire (VALIDE, REJETE, etc.)
 */
const ExportButtons = ({ responseId, status }) => {
    const { t } = useTranslation();
    const [loadingPdf, setLoadingPdf] = useState(false);
    const [loadingDocx, setLoadingDocx] = useState(false);
    const [error, setError] = useState(null);

    // Vérifier si l'export est disponible
    const isExportable = ['VALIDE', 'REJETE'].includes(status);

    /**
     * Télécharge un fichier depuis une réponse API blob
     */
    const downloadFile = (blob, filename) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    /**
     * Exporte le rapport en PDF
     */
    const handleExportPdf = async () => {
        setLoadingPdf(true);
        setError(null);

        try {
            const response = await questionnaireService.exportResponsePdf(responseId);

            // Extraire le nom du fichier du header Content-Disposition
            const contentDisposition = response.headers['content-disposition'];
            let filename = `Rapport_${responseId}.pdf`;

            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }

            // Télécharger le fichier
            downloadFile(response.data, filename);
        } catch (err) {
            console.error('Erreur lors de l\'export PDF:', err);
            setError(err.response?.data?.error || t('export.error'));
        } finally {
            setLoadingPdf(false);
        }
    };

    /**
     * Exporte le rapport en Word (DOCX)
     */
    const handleExportDocx = async () => {
        setLoadingDocx(true);
        setError(null);

        try {
            const response = await questionnaireService.exportResponseDocx(responseId);

            // Extraire le nom du fichier du header Content-Disposition
            const contentDisposition = response.headers['content-disposition'];
            let filename = `Rapport_${responseId}.docx`;

            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }

            // Télécharger le fichier
            downloadFile(response.data, filename);
        } catch (err) {
            console.error('Erreur lors de l\'export Word:', err);
            setError(err.response?.data?.error || t('export.error'));
        } finally {
            setLoadingDocx(false);
        }
    };

    if (!isExportable) {
        return (
            <div className="export-buttons-disabled">
                <p className="export-info">
                    📄 {t('export.notAvailable')}
                </p>
            </div>
        );
    }

    return (
        <div className="export-buttons-container">
            <div className="export-header">
                <Download size={20} />
                <h3>{t('export.title')}</h3>
            </div>

            {error && (
                <div className="export-error">
                    <span>⚠️ {error}</span>
                </div>
            )}

            <div className="export-buttons">
                {/* Bouton PDF */}
                <button
                    className="export-btn export-btn-pdf"
                    onClick={handleExportPdf}
                    disabled={loadingPdf || loadingDocx}
                >
                    {loadingPdf ? (
                        <>
                            <div className="spinner"></div>
                            {t('export.exportingPdf')}
                        </>
                    ) : (
                        <>
                            <FileText size={18} />
                            {t('export.exportPdf')}
                        </>
                    )}
                </button>

                {/* Bouton Word */}
                <button
                    className="export-btn export-btn-docx"
                    onClick={handleExportDocx}
                    disabled={loadingPdf || loadingDocx}
                >
                    {loadingDocx ? (
                        <>
                            <div className="spinner"></div>
                            {t('export.exportingWord')}
                        </>
                    ) : (
                        <>
                            <File size={18} />
                            {t('export.exportWord')}
                        </>
                    )}
                </button>
            </div>

            <p className="export-note">
                💡 {t('export.note')}
            </p>
        </div>
    );
};

export default ExportButtons;
