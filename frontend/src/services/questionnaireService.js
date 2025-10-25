import api from './api';

class QuestionnaireService {
  /**
   * Récupérer la liste des questionnaires de l'utilisateur connecté
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
   * Récupérer les détails d'un questionnaire
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
   * Créer un nouveau questionnaire
   * @param {Object} questionnaireData - Données du questionnaire (title, status)
   */
  async createQuestionnaire(questionnaireData) {
    try {
      const response = await api.post('/api/questionnaires/', questionnaireData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la création du questionnaire' };
    }
  }

  /**
   * Mettre à jour un questionnaire
   * @param {number} id - ID du questionnaire
   * @param {Object} questionnaireData - Données à mettre à jour
   */
  async updateQuestionnaire(id, questionnaireData) {
    try {
      const response = await api.put(`/api/questionnaires/${id}/`, questionnaireData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Erreur lors de la mise à jour du questionnaire' };
    }
  }

  /**
   * Supprimer un questionnaire
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
}

export default new QuestionnaireService();
