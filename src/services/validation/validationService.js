// src/services/validation/validationService.js
/**
 * Service de double validation Admin/Trésorier
 * Gestion des demandes de validation avec OTP
 */

import { get, post } from '../api/apiClient';
import API_CONFIG from '../../config/api.config';

const validationService = {
  // ========================================
  // CRÉATION DE DEMANDE (ADMIN)
  // ========================================

  /**
   * Créer une demande de validation (Admin initie)
   * @param {object} data - Données de la demande
   * @param {string} data.actionType - Type d'action (ACTIVATE_USER, DEACTIVATE_USER, DELETE_USER, etc.)
   * @param {string} data.resourceType - Type de ressource (User, Tontine)
   * @param {string} data.resourceId - ID de la ressource
   * @param {string} data.reason - Raison de la demande
   * @param {string} data.assignedTresorier - ID du trésorier assigné (optionnel)
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async createValidationRequest(data) {
    return await post(API_CONFIG.ENDPOINTS.VALIDATION.CREATE_REQUEST, data);
  },

  // ========================================
  // CONFIRMATION OTP (TRÉSORIER)
  // ========================================

  /**
   * Confirmer avec le code OTP (Trésorier valide)
   * @param {string} validationRequestId - ID de la demande de validation
   * @param {string} code - Code OTP à 6 chiffres
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async confirmTresorierOTP(validationRequestId, code) {
    return await post(
      API_CONFIG.ENDPOINTS.VALIDATION.CONFIRM_TRESORIER(validationRequestId),
      { code }
    );
  },

  // ========================================
  // REJET (TRÉSORIER)
  // ========================================

  /**
   * Rejeter une demande de validation (Trésorier)
   * @param {string} validationRequestId - ID de la demande de validation
   * @param {string} reason - Raison du rejet
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async rejectValidationRequest(validationRequestId, reason) {
    return await post(
      API_CONFIG.ENDPOINTS.VALIDATION.REJECT(validationRequestId),
      { reason }
    );
  },

  // ========================================
  // LISTE DES DEMANDES
  // ========================================

  /**
   * Obtenir les demandes en attente (Trésorier)
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async getPendingRequests() {
    return await get(API_CONFIG.ENDPOINTS.VALIDATION.PENDING);
  },

  /**
   * Obtenir mes demandes (Admin)
   * @param {object} params - Paramètres de recherche
   * @param {number} params.page - Numéro de page
   * @param {number} params.limit - Nombre d'éléments par page
   * @param {string} params.status - Filtrer par statut (pending, completed, rejected, expired)
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
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

  /**
   * Obtenir les détails d'une demande
   * @param {string} validationRequestId - ID de la demande de validation
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async getRequestDetails(validationRequestId) {
    return await get(API_CONFIG.ENDPOINTS.VALIDATION.DETAILS(validationRequestId));
  },

  // ========================================
  // RENVOYER OTP
  // ========================================

  /**
   * Renvoyer le code OTP (Trésorier)
   * @param {string} validationRequestId - ID de la demande de validation
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async resendOTP(validationRequestId) {
    return await post(API_CONFIG.ENDPOINTS.VALIDATION.RESEND_OTP(validationRequestId));
  },

  // ========================================
  // HELPERS
  // ========================================

  /**
   * Vérifier si j'ai des demandes en attente (Admin)
   * @returns {Promise<boolean>}
   */
  async hasPendingRequests() {
    const result = await this.getMyRequests({ status: 'pending' });
    if (!result.success) return false;

    const data = result.data?.data;
    return Array.isArray(data) && data.length > 0;
  },

  /**
   * Compter mes demandes en attente (Admin)
   * @returns {Promise<number>}
   */
  async countPendingRequests() {
    const result = await this.getMyRequests({ status: 'pending' });
    if (!result.success) return 0;

    const data = result.data?.data;
    return Array.isArray(data) ? data.length : 0;
  },

  /**
   * Compter les demandes à valider (Trésorier)
   * @returns {Promise<number>}
   */
  async countPendingValidations() {
    const result = await this.getPendingRequests();
    if (!result.success) return 0;

    const data = result.data?.data?.requests;
    return Array.isArray(data) ? data.length : 0;
  },

  // ========================================
  // ACTIONS TYPES CONSTANTS
  // ========================================

  ACTION_TYPES: {
    ACTIVATE_USER: 'ACTIVATE_USER',
    DEACTIVATE_USER: 'DEACTIVATE_USER',
    DELETE_USER: 'DELETE_USER',
    BLOCK_TONTINE: 'BLOCK_TONTINE',
    DELETE_TONTINE: 'DELETE_TONTINE',
  },

  RESOURCE_TYPES: {
    USER: 'User',
    TONTINE: 'Tontine',
  },

  /**
   * Obtenir le libellé d'une action
   * @param {string} actionType - Type d'action
   * @returns {string}
   */
  getActionLabel(actionType) {
    const labels = {
      ACTIVATE_USER: 'Activation d\'utilisateur',
      DEACTIVATE_USER: 'Désactivation d\'utilisateur',
      DELETE_USER: 'Suppression d\'utilisateur',
      BLOCK_TONTINE: 'Blocage de tontine',
      DELETE_TONTINE: 'Suppression de tontine',
    };
    return labels[actionType] || actionType;
  },
};

export default validationService;