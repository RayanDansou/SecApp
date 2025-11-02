import api from './api';

class QuestionnaireService {
  // ========================================
  // Questionnaire Templates (ANALYSTE)
  // ========================================

  /**
   * Récupérer la liste des questionnaires (templates)
   * Pour ANALYSTE: tous les questionnaires
   * Pour autres: questionnaires actifs seulement
   */
  async getQuestionnaires() {
    try {
      const response = await api.get('/api/questionnaires/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la récupération des questionnaires' };
    }
  }

  /**
   * Récupérer les détails d'un questionnaire template
   * @param {number} id - ID du questionnaire
   */
  async getQuestionnaire(id) {
    try {
      const response = await api.get(`/api/questionnaires/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la récupération du questionnaire' };
    }
  }

  /**
   * Créer un nouveau questionnaire template (ANALYSTE uniquement)
   * @param {Object} data - {title, description, is_active, questions: [{text, order, is_required}]}
   */
  async createQuestionnaire(data) {
    try {
      const response = await api.post('/api/questionnaires/', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la création du questionnaire' };
    }
  }

  /**
   * Mettre à jour un questionnaire template (ANALYSTE propriétaire uniquement)
   * @param {number} id - ID du questionnaire
   * @param {Object} data - {title, description, is_active}
   */
  async updateQuestionnaire(id, data) {
    try {
      const response = await api.patch(`/api/questionnaires/${id}/`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la mise à jour du questionnaire' };
    }
  }

  /**
   * Supprimer un questionnaire template (ANALYSTE propriétaire uniquement)
   * @param {number} id - ID du questionnaire
   */
  async deleteQuestionnaire(id) {
    try {
      await api.delete(`/api/questionnaires/${id}/`);
      return { success: true };
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la suppression du questionnaire' };
    }
  }

  // ========================================
  // Questions (nested in Questionnaire)
  // ========================================

  /**
   * Récupérer les questions d'un questionnaire
   * @param {number} questionnaireId - ID du questionnaire
   */
  async getQuestions(questionnaireId) {
    try {
      const response = await api.get(`/api/questionnaires/${questionnaireId}/questions/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la récupération des questions' };
    }
  }

  /**
   * Créer une question dans un questionnaire (ANALYSTE propriétaire uniquement)
   * @param {number} questionnaireId - ID du questionnaire
   * @param {Object} data - {text, order, is_required}
   */
  async createQuestion(questionnaireId, data) {
    try {
      const response = await api.post(`/api/questionnaires/${questionnaireId}/questions/`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la création de la question' };
    }
  }

  /**
   * Mettre à jour une question
   * @param {number} questionnaireId - ID du questionnaire
   * @param {number} questionId - ID de la question
   * @param {Object} data - {text, order, is_required}
   */
  async updateQuestion(questionnaireId, questionId, data) {
    try {
      const response = await api.put(`/api/questionnaires/${questionnaireId}/questions/${questionId}/`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la mise à jour de la question' };
    }
  }

  /**
   * Supprimer une question
   * @param {number} questionnaireId - ID du questionnaire
   * @param {number} questionId - ID de la question
   */
  async deleteQuestion(questionnaireId, questionId) {
    try {
      await api.delete(`/api/questionnaires/${questionnaireId}/questions/${questionId}/`);
      return { success: true };
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la suppression de la question' };
    }
  }

  // ========================================
  // Questionnaire Documents (nested in Questionnaire)
  // ========================================

  /**
   * Récupérer les documents d'un questionnaire template
   * @param {number} questionnaireId - ID du questionnaire
   */
  async getQuestionnaireDocuments(questionnaireId) {
    try {
      const response = await api.get(`/api/questionnaires/${questionnaireId}/documents/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la récupération des documents' };
    }
  }

  /**
   * Upload un document pour un questionnaire template (ANALYSTE propriétaire uniquement)
   * @param {number} questionnaireId - ID du questionnaire
   * @param {File} file - Fichier à uploader
   */
  async uploadQuestionnaireDocument(questionnaireId, file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('filename', file.name);

      const response = await api.post(
        `/api/questionnaires/${questionnaireId}/documents/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de l\'upload du document' };
    }
  }

  /**
   * Supprimer un document d'un questionnaire template
   * @param {number} questionnaireId - ID du questionnaire
   * @param {number} documentId - ID du document
   */
  async deleteQuestionnaireDocument(questionnaireId, documentId) {
    try {
      await api.delete(`/api/questionnaires/${questionnaireId}/documents/${documentId}/`);
      return { success: true };
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la suppression du document' };
    }
  }

  // ========================================
  // Questionnaire Responses (CHEF_PROJET)
  // ========================================

  /**
   * Récupérer la liste des réponses
   * - CHEF_PROJET: ses propres réponses
   * - ANALYSTE: toutes les réponses soumises
   * - BUSINESS_OWNER: réponses validées/rejetées uniquement
   */
  async getResponses() {
    try {
      const response = await api.get('/api/responses/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la récupération des réponses' };
    }
  }

  /**
   * Récupérer les détails d'une réponse
   * @param {number} id - ID de la réponse
   */
  async getResponse(id) {
    try {
      const response = await api.get(`/api/responses/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la récupération de la réponse' };
    }
  }

  /**
   * Créer une réponse à un questionnaire (CHEF_PROJET uniquement)
   * @param {Object} data - {questionnaire_id, answers: [{question_id, answer_text}]}
   */
  async createResponse(data) {
    try {
      const response = await api.post('/api/responses/', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la création de la réponse' };
    }
  }

  /**
   * Mettre à jour une réponse (propriétaire uniquement, BROUILLON seulement)
   * @param {number} id - ID de la réponse
   * @param {Object} data - {answers: [{question_id, answer_text}]}
   */
  async updateResponse(id, data) {
    try {
      const response = await api.put(`/api/responses/${id}/`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la mise à jour de la réponse' };
    }
  }

  /**
   * Soumettre une réponse (change le statut de BROUILLON à SOUMIS)
   * @param {number} id - ID de la réponse
   */
  async submitResponse(id) {
    try {
      const response = await api.post(`/api/responses/${id}/submit/`, {});
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la soumission de la réponse' };
    }
  }

  /**
   * Changer le statut d'une réponse (ANALYSTE uniquement)
   * @param {number} id - ID de la réponse
   * @param {Object} data - {new_status, comment}
   */
  async changeResponseStatus(id, data) {
    try {
      const response = await api.post(`/api/responses/${id}/change_status/`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors du changement de statut' };
    }
  }

  /**
   * Supprimer une réponse (propriétaire uniquement, BROUILLON seulement)
   * @param {number} id - ID de la réponse
   */
  async deleteResponse(id) {
    try {
      await api.delete(`/api/responses/${id}/`);
      return { success: true };
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la suppression de la réponse' };
    }
  }

  // ========================================
  // Answers (nested in Response)
  // ========================================

  /**
   * Récupérer les réponses d'une réponse au questionnaire
   * @param {number} responseId - ID de la réponse
   */
  async getAnswers(responseId) {
    try {
      const response = await api.get(`/api/responses/${responseId}/answers/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la récupération des réponses' };
    }
  }

  /**
   * Créer/Mettre à jour une réponse à une question (propriétaire uniquement, BROUILLON seulement)
   * @param {number} responseId - ID de la réponse
   * @param {Object} data - {question_id, answer_text}
   */
  async createAnswer(responseId, data) {
    try {
      const response = await api.post(`/api/responses/${responseId}/answers/`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la création de la réponse' };
    }
  }

  /**
   * Mettre à jour une réponse à une question
   * @param {number} responseId - ID de la réponse
   * @param {number} answerId - ID de la réponse à la question
   * @param {Object} data - {answer_text}
   */
  async updateAnswer(responseId, answerId, data) {
    try {
      const response = await api.put(`/api/responses/${responseId}/answers/${answerId}/`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la mise à jour de la réponse' };
    }
  }

  // ========================================
  // Response Documents (nested in Response)
  // ========================================

  /**
   * Récupérer les documents d'une réponse
   * @param {number} responseId - ID de la réponse
   */
  async getResponseDocuments(responseId) {
    try {
      const response = await api.get(`/api/responses/${responseId}/documents/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la récupération des documents' };
    }
  }

  /**
   * Upload un document d'architecture pour une réponse (propriétaire uniquement)
   * @param {number} responseId - ID de la réponse
   * @param {File} file - Fichier à uploader
   */
  async uploadResponseDocument(responseId, file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('filename', file.name);

      const response = await api.post(
        `/api/responses/${responseId}/documents/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de l\'upload du document' };
    }
  }

  /**
   * Supprimer un document d'une réponse
   * @param {number} responseId - ID de la réponse
   * @param {number} documentId - ID du document
   */
  async deleteResponseDocument(responseId, documentId) {
    try {
      await api.delete(`/api/responses/${responseId}/documents/${documentId}/`);
      return { success: true };
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la suppression du document' };
    }
  }

  // ========================================
  // Comments (nested in Response)
  // ========================================

  /**
   * Récupérer les commentaires d'une réponse
   * @param {number} responseId - ID de la réponse
   */
  async getComments(responseId) {
    try {
      const response = await api.get(`/api/responses/${responseId}/comments/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la récupération des commentaires' };
    }
  }

  /**
   * Créer un commentaire sur une réponse (tous les rôles peuvent commenter)
   * @param {number} responseId - ID de la réponse
   * @param {Object} data - {content}
   */
  async createComment(responseId, data) {
    try {
      const response = await api.post(`/api/responses/${responseId}/comments/`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la création du commentaire' };
    }
  }

  // ========================================
  // Status History (nested in Response)
  // ========================================

  /**
   * Récupérer l'historique des statuts d'une réponse
   * @param {number} responseId - ID de la réponse
   */
  async getStatusHistory(responseId) {
    try {
      const response = await api.get(`/api/responses/${responseId}/history/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la récupération de l\'historique' };
    }
  }

  // ========================================
  // AI Analysis (ANALYSTE)
  // ========================================

  /**
   * Déclencher une analyse IA d'une réponse au questionnaire (ANALYSTE uniquement)
   * @param {number} responseId - ID de la réponse
   * @returns {Promise} Résultats de l'analyse IA
   */
  async triggerAIAnalysis(responseId) {
    try {
      const response = await api.post(`/api/responses/${responseId}/analyze_with_ai/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de l\'analyse IA' };
    }
  }

  /**
   * Récupérer les analyses IA d'une réponse
   * @param {number} responseId - ID de la réponse
   * @returns {Promise} Liste des analyses IA
   */
  async getAIAnalyses(responseId) {
    try {
      const response = await api.get(`/api/responses/${responseId}/ai_analyses/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la récupération des analyses IA' };
    }
  }
}

export default new QuestionnaireService();
