// src/services/tontine/tontineService.js - VERSION CORRIGEE

import { get, post, put, del } from '../api/apiClient';
import API_CONFIG from '../../config/api.config';

const tontineService = {
  // ========================================
  // CRÉATION ET MODIFICATION
  // ========================================

  async createTontine(data) {
    return await post(API_CONFIG.ENDPOINTS.TONTINES.CREATE, data);
  },

  async mesTontines() {
    return await get(API_CONFIG.ENDPOINTS.TONTINES.MY_TONTINES);
  },

  async getTontineDetails(tontineId) {
    return await get(API_CONFIG.ENDPOINTS.TONTINES.DETAILS(tontineId));
  },

  async getTontineDetailsForMember(tontineId) {
    return await get(API_CONFIG.ENDPOINTS.TONTINES.DETAILS_FOR_MEMBER(tontineId));
  },

  async getTontineInvitations(tontineId) {
    return await get(API_CONFIG.ENDPOINTS.TONTINES.INVITATIONS(tontineId));
  },

  async updateTontine(tontineId, data) {
    return await put(API_CONFIG.ENDPOINTS.TONTINES.UPDATE(tontineId), data);
  },

  // ========================================
  // LISTE ET DÉTAILS
  // ========================================

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

  async addMembers(tontineId, membresIds) {
    return await post(API_CONFIG.ENDPOINTS.TONTINES.ADD_MEMBERS(tontineId), {
      membresIds,
    });
  },

  async inviterMembres(tontineId, membresIds, reglementTexte = null) {
    return await post(`/tontines/${tontineId}/inviter-membres`, {
      membresIds,
      reglementTexte,
    });
  },

  async removeMember(tontineId, userId) {
    return await del(API_CONFIG.ENDPOINTS.TONTINES.REMOVE_MEMBER(tontineId, userId));
  },

  async optInForTirage(tontineId, participe = true) {
    return await post(API_CONFIG.ENDPOINTS.TONTINES.OPT_IN_TIRAGE(tontineId), {
      participe,
    });
  },

  // ========================================
  // ACTIONS SUR LES TONTINES - CORRIGE
  // ========================================

  /**
   * Activer une tontine (Admin uniquement) - ACTION DIRECTE
   */
  async activateTontine(tontineId) {
    return await post(API_CONFIG.ENDPOINTS.TONTINES.ACTIVATE(tontineId));
  },

  /**
   * Bloquer une tontine (Admin uniquement) - AVEC VALIDATION
   * @param {string} tontineId - ID de la tontine
   * @param {string} motif - Motif du blocage
   * @param {string} validationRequestId - ID de la validation acceptée
   */
  async blockTontine(tontineId, motif, validationRequestId) {
    return await post(API_CONFIG.ENDPOINTS.TONTINES.BLOCK(tontineId), {
      motif,
      validationRequestId, // AJOUTE
    });
  },

  /**
   * Debloquer/Reactiver une tontine (Admin uniquement) - AVEC VALIDATION
   * @param {string} tontineId - ID de la tontine
   * @param {string} validationRequestId - ID de la validation acceptée
   */
  async unblockTontine(tontineId, validationRequestId) {
    return await post(API_CONFIG.ENDPOINTS.TONTINES.UNBLOCK(tontineId), {
      validationRequestId, // AJOUTE
    });
  },

  /**
   * Cloturer une tontine (Admin uniquement) - ACTION DIRECTE
   */
  async closeTontine(tontineId, genererRapport = true) {
    return await post(API_CONFIG.ENDPOINTS.TONTINES.CLOSE(tontineId), {
      genererRapport,
    });
  },

  /**
   * Supprimer une tontine (Admin uniquement) - AVEC VALIDATION
   * @param {string} tontineId - ID de la tontine
   * @param {string} validationRequestId - ID de la validation acceptée
   */
  async deleteTontine(tontineId, validationRequestId) {
    return await del(API_CONFIG.ENDPOINTS.TONTINES.DELETE(tontineId), {
      data: {
        confirmation: 'SUPPRIMER',
        validationRequestId, // AJOUTE
      },
    });
  },

  // ========================================
  // HELPERS
  // ========================================

  async getMyActiveTontines() {
    return await this.listTontines({ statut: 'Active' });
  },

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