// src/services/validation/validationService.js -  CORRIGÉ

import { get, post } from '../api/apiClient';
import API_CONFIG from '../../config/api.config';

const validationService = {
  // ========================================
  // CRÉATION DE DEMANDE (ADMIN)
  // ========================================
  async createValidationRequest(data) {
    return await post(API_CONFIG.ENDPOINTS.VALIDATION.CREATE_REQUEST, data);
  },

  // ========================================
  //  ACCEPTER (TRÉSORIER) - NOUVEAU
  // ========================================
  /**
   * Accepter une demande de validation (Trésorier)
   * @param {string} validationRequestId - ID de la demande de validation
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async acceptValidation(validationRequestId) {
    return await post(
      API_CONFIG.ENDPOINTS.VALIDATION.ACCEPT(validationRequestId),
      {} // Pas de body nécessaire
    );
  },

  // ========================================
  // REJET (TRÉSORIER)
  // ========================================
  async rejectValidationRequest(validationRequestId, reason) {
    return await post(
      API_CONFIG.ENDPOINTS.VALIDATION.REJECT(validationRequestId),
      { reason }
    );
  },

  // ========================================
  // LISTE DES DEMANDES
  // ========================================
  async getPendingRequests() {
    return await get(API_CONFIG.ENDPOINTS.VALIDATION.PENDING);
  },

  async getMyRequests(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);

    const url = `${API_CONFIG.ENDPOINTS.VALIDATION.MY_REQUESTS}?${queryParams.toString()}`;
    return await get(url);
  },

  // ========================================
  // DÉTAILS
  // ========================================
  async getRequestDetails(validationRequestId) {
    return await get(API_CONFIG.ENDPOINTS.VALIDATION.DETAILS(validationRequestId));
  },

  // ========================================
  // HELPERS
  // ========================================
  async hasPendingRequests() {
    const result = await this.getMyRequests({ status: 'pending' });
    if (!result.success) return false;
    const data = result.data?.data;
    return Array.isArray(data) && data.length > 0;
  },

  async countPendingRequests() {
    const result = await this.getMyRequests({ status: 'pending' });
    if (!result.success) return 0;
    const data = result.data?.data;
    return Array.isArray(data) ? data.length : 0;
  },

  async countPendingValidations() {
    const result = await this.getPendingRequests();
    if (!result.success) return 0;
    const data = result.data?.data?.requests;
    return Array.isArray(data) ? data.length : 0;
  },

  // ========================================
  // CONSTANTS
  // ========================================
  ACTION_TYPES: {
    ACTIVATE_USER: 'ACTIVATE_USER',
    DEACTIVATE_USER: 'DEACTIVATE_USER',
    DELETE_USER: 'DELETE_USER',
    BLOCK_TONTINE: 'BLOCK_TONTINE',
    UNBLOCK_TONTINE: 'UNBLOCK_TONTINE',
    DELETE_TONTINE: 'DELETE_TONTINE',
  },

  RESOURCE_TYPES: {
    USER: 'User',
    TONTINE: 'Tontine',
  },

  getActionLabel(actionType) {
    const labels = {
      ACTIVATE_USER: 'Activation d\'utilisateur',
      DEACTIVATE_USER: 'Désactivation d\'utilisateur',
      DELETE_USER: 'Suppression d\'utilisateur',
      BLOCK_TONTINE: 'Blocage de tontine',
      UNBLOCK_TONTINE: 'Déblocage de tontine',
      DELETE_TONTINE: 'Suppression de tontine',
      VALIDATE_TRANSACTION: 'Validation de transaction',
    };
    return labels[actionType] || actionType;
  },
};

export default validationService;