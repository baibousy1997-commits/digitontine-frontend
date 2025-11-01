// src/services/tontine/tontineService.js
/**
 * Service de gestion des tontines
 * Création, modification, activation, membres, etc.
 */

import { get, post, put, del } from '../api/apiClient';
import API_CONFIG from '../../config/api.config';
import tokenManager from '../../utils/tokenManager';

const tontineService = {
  // ========================================
  // CRÉATION ET MODIFICATION
  // ========================================

  /**
   * Créer une nouvelle tontine (Admin uniquement)
   * @param {object} data - Données de la tontine
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async createTontine(data) {
    return await post(API_CONFIG.ENDPOINTS.TONTINES.CREATE, data);
  },

  /**
   * Mes tontines (Membre/Trésorier)
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async mesTontines() {
    return await get(API_CONFIG.ENDPOINTS.TONTINES.MY_TONTINES);
  },

  /**
   * Obtenir les détails d'une tontine (Admin uniquement)
   * @param {string} tontineId - ID de la tontine
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async getTontineDetails(tontineId) {
    return await get(API_CONFIG.ENDPOINTS.TONTINES.DETAILS(tontineId));
  },

  /**
   * CORRECTION : Obtenir les détails d'une tontine (pour Membre/Trésorier)
   * @param {string} tontineId - ID de la tontine
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async getTontineDetailsForMember(tontineId) {
    return await get(API_CONFIG.ENDPOINTS.TONTINES.DETAILS_FOR_MEMBER(tontineId));
  },

  // ✅ NOUVELLE FONCTION : Récupérer les invitations d'une tontine
  /**
   * Récupérer les invitations d'une tontine (Admin uniquement)
   * @param {string} tontineId - ID de la tontine
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async getTontineInvitations(tontineId) {
    return await get(API_CONFIG.ENDPOINTS.TONTINES.INVITATIONS(tontineId));
  },

  /**
   * Modifier une tontine
   * @param {string} tontineId - ID de la tontine
   * @param {object} data - Données à modifier
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async updateTontine(tontineId, data) {
    return await put(API_CONFIG.ENDPOINTS.TONTINES.UPDATE(tontineId), data);
  },

  // ========================================
  // LISTE ET DÉTAILS
  // ========================================

  /**
   * Liste des tontines avec filtres et pagination
   * @param {object} params - Paramètres de recherche
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async listTontines(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.statut) queryParams.append('statut', params.statut);
    if (params.search) queryParams.append('search', params.search);
    if (params.dateDebut) queryParams.append('dateDebut', params.dateDebut);
    if (params.dateFin) queryParams.append('dateFin', params.dateFin);

    const url = `${API_CONFIG.ENDPOINTS.TONTINES.LIST}?${queryParams.toString()}`;
    return await get(url);
  },

  // ========================================
  // GESTION DES MEMBRES
  // ========================================

  /**
   * Ajouter des membres à une tontine
   * @param {string} tontineId - ID de la tontine
   * @param {Array<string>} membresIds - Tableau des IDs des membres à ajouter
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async addMembers(tontineId, membresIds) {
    return await post(API_CONFIG.ENDPOINTS.TONTINES.ADD_MEMBERS(tontineId), {
      membresIds,
    });
  },

  /**
   * Inviter des membres à une tontine (avec notification + règlement)
   * @param {string} tontineId - ID de la tontine
   * @param {Array<string>} membresIds - Tableau des IDs des membres à inviter
   * @param {string} reglementTexte - Règlement personnalisé (optionnel)
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async inviterMembres(tontineId, membresIds, reglementTexte = null) {
    return await post(`/tontines/${tontineId}/inviter-membres`, {
      membresIds,
      reglementTexte,
    });
  },

  /**
   * Retirer un membre d'une tontine
   * @param {string} tontineId - ID de la tontine
   * @param {string} userId - ID du membre à retirer
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async removeMember(tontineId, userId) {
    return await del(API_CONFIG.ENDPOINTS.TONTINES.REMOVE_MEMBER(tontineId, userId));
  },

  /**
   * Confirmer participation au prochain tirage (Membre)
   * @param {string} tontineId - ID de la tontine
   * @param {boolean} participe - true pour participer, false pour ne pas participer
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async optInForTirage(tontineId, participe = true) {
    return await post(API_CONFIG.ENDPOINTS.TONTINES.OPT_IN_TIRAGE(tontineId), {
      participe,
    });
  },

  // ========================================
  // ACTIONS SUR LES TONTINES
  // ========================================

  /**
   * Activer une tontine (Admin uniquement)
   * @param {string} tontineId - ID de la tontine
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async activateTontine(tontineId) {
    return await post(API_CONFIG.ENDPOINTS.TONTINES.ACTIVATE(tontineId));
  },

  /**
   * Bloquer une tontine (Admin uniquement)
   * @param {string} tontineId - ID de la tontine
   * @param {string} motif - Motif du blocage
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async blockTontine(tontineId, motif) {
    return await post(API_CONFIG.ENDPOINTS.TONTINES.BLOCK(tontineId), {
      motif,
    });
  },

  /**
   * Débloquer/Réactiver une tontine (Admin uniquement)
   * @param {string} tontineId - ID de la tontine
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async unblockTontine(tontineId) {
    return await post(API_CONFIG.ENDPOINTS.TONTINES.UNBLOCK(tontineId));
  },

  /**
   * Clôturer une tontine (Admin uniquement)
   * @param {string} tontineId - ID de la tontine
   * @param {boolean} genererRapport - Générer un rapport final (défaut: true)
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async closeTontine(tontineId, genererRapport = true) {
    return await post(API_CONFIG.ENDPOINTS.TONTINES.CLOSE(tontineId), {
      genererRapport,
    });
  },

  /**
   * Supprimer une tontine (Admin uniquement)
   * @param {string} tontineId - ID de la tontine
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async deleteTontine(tontineId) {
    return await del(API_CONFIG.ENDPOINTS.TONTINES.DELETE(tontineId), {
      data: {
        confirmation: 'SUPPRIMER',
      },
    });
  },

  // ========================================
  // HELPERS
  // ========================================

  /**
   * Obtenir mes tontines actives (Membre)
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async getMyActiveTontines() {
    return await this.listTontines({ statut: 'Active' });
  },

  /**
   * Vérifier si je suis membre d'une tontine
   * @param {string} tontineId - ID de la tontine
   * @returns {Promise<boolean>}
   */
  async isMemberOf(tontineId) {
    const result = await this.getTontineDetails(tontineId);
    if (!result.success) return false;

    const currentUser = await tokenManager.getUser();
    if (!currentUser) return false;

    const membres = result.data.data.tontine.membres || [];
    return membres.some(m => m.userId === currentUser.id);
  },
};

export default tontineService;