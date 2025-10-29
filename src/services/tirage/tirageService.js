// src/services/tirage/tirageService.js
/**
 * Service de gestion des tirages
 * Tirages automatiques, manuels, gains, etc.
 */

import { get, post, put } from '../api/apiClient';
import API_CONFIG from '../../config/api.config';

const tirageService = {
  // ========================================
  // NOTIFICATION AVANT TIRAGE
  // ========================================

  /**
   * Notifier les membres avant un tirage (Admin/Trésorier)
   * @param {string} tontineId - ID de la tontine
   * @param {string} dateTirage - Date prévue du tirage (ISO format)
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async notifyUpcomingTirage(tontineId, dateTirage) {
    return await post(API_CONFIG.ENDPOINTS.TIRAGES.NOTIFY_MEMBERS(tontineId), {
      dateTirage,
    });
  },

  // ========================================
  // TIRAGES AUTOMATIQUES ET MANUELS
  // ========================================

  /**
   * Effectuer un tirage automatique (Admin/Trésorier)
   * Sélectionne un bénéficiaire au hasard parmi les membres éligibles
   * @param {string} tontineId - ID de la tontine
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async effectuerTirageAutomatique(tontineId) {
    return await post(API_CONFIG.ENDPOINTS.TIRAGES.AUTOMATIQUE(tontineId));
  },
/**
 * Effectuer un tirage automatique MODE TEST (sans validations)
 * @param {string} tontineId - ID de la tontine
 * @returns {Promise<{success: boolean, data?: any, error?: any}>}
 */
async effectuerTirageAutomatiqueTest(tontineId) {
  return await post(API_CONFIG.ENDPOINTS.TIRAGES.AUTOMATIQUE_TEST(tontineId));
},
  /**
   * Effectuer un tirage manuel (Admin uniquement)
   * Désigner manuellement un bénéficiaire
   * @param {string} tontineId - ID de la tontine
   * @param {string} beneficiaireId - ID du membre bénéficiaire
   * @param {string} raison - Raison du tirage manuel (optionnel)
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async effectuerTirageManuel(tontineId, beneficiaireId, raison = '') {
    return await post(API_CONFIG.ENDPOINTS.TIRAGES.MANUEL(tontineId), {
      beneficiaireId,
      raison,
    });
  },

  /**
   * Annuler un tirage (Admin uniquement)
   * @param {string} tirageId - ID du tirage
   * @param {string} raison - Raison de l'annulation (minimum 10 caractères)
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async annulerTirage(tirageId, raison) {
    return await put(API_CONFIG.ENDPOINTS.TIRAGES.ANNULER(tirageId), {
      raison,
    });
  },

  // ========================================
  // LISTE ET DÉTAILS
  // ========================================

  /**
   * Liste des tirages d'une tontine
   * @param {string} tontineId - ID de la tontine
   * @param {string} statut - Filtrer par statut (Effectue, Annule) - optionnel
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async listeTiragesTontine(tontineId, statut = null) {
    let url = API_CONFIG.ENDPOINTS.TIRAGES.LIST_BY_TONTINE(tontineId);
    if (statut) {
      url += `?statut=${statut}`;
    }
    return await get(url);
  },

  /**
   * Obtenir les détails d'un tirage
   * @param {string} tirageId - ID du tirage
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async detailsTirage(tirageId) {
    return await get(API_CONFIG.ENDPOINTS.TIRAGES.DETAILS(tirageId));
  },

  // ========================================
  // MES GAINS (MEMBRE)
  // ========================================

  /**
   * Consulter mes gains (Membre/Trésorier/Admin)
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async mesGains() {
    return await get(API_CONFIG.ENDPOINTS.TIRAGES.MES_GAINS);
  },

  // ========================================
  // HELPERS
  // ========================================

  /**
   * Vérifier si j'ai déjà gagné dans une tontine
   * @param {string} tontineId - ID de la tontine
   * @returns {Promise<boolean>}
   */
  async aiDejaGagne(tontineId) {
    const result = await this.listeTiragesTontine(tontineId, 'Effectue');
    if (!result.success) return false;

    const tokenManager = require('../../utils/tokenManager').default;
    const currentUser = await tokenManager.getUser();
    if (!currentUser) return false;

    const tirages = result.data?.data || [];
    return tirages.some(t => t.beneficiaire?._id === currentUser.id);
  },

  /**
   * Obtenir le montant total de mes gains
   * @returns {Promise<number>}
   */
  async getMontantTotalGains() {
    const result = await this.mesGains();
    if (!result.success || !result.data?.data) return 0;

    return result.data.data.totalGagne || 0;
  },

  /**
   * Obtenir le nombre de tirages gagnés
   * @returns {Promise<number>}
   */
  async getNombreGains() {
    const result = await this.mesGains();
    if (!result.success || !result.data?.data) return 0;

    return result.data.data.nombreGains || 0;
  },
};

export default tirageService;