// src/services/transaction/transactionService.js
/**
 * Service de gestion des transactions
 * Cotisations, paiements, validation, etc.
 */

import { get, post } from '../api/apiClient';
import API_CONFIG from '../../config/api.config';

const transactionService = {
  // ========================================
  // CRÉATION DE TRANSACTION (MEMBRE)
  // ========================================

  /**
   * Effectuer une cotisation
   * @param {object} data - Données de la transaction
   * @param {string} data.tontineId - ID de la tontine
   * @param {number} data.montant - Montant de la cotisation
   * @param {string} data.moyenPaiement - Moyen de paiement (Wave, Orange Money, Cash, etc.)
   * @param {number} data.echeanceNumero - Numéro de l'échéance (optionnel)
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async createTransaction(data) {
    return await post(API_CONFIG.ENDPOINTS.TRANSACTIONS.CREATE, data);
  },

  // ========================================
  // MES TRANSACTIONS (MEMBRE)
  // ========================================

  /**
   * Liste de mes transactions avec pagination
   * @param {object} params - Paramètres de recherche
   * @param {number} params.page - Numéro de page
   * @param {number} params.limit - Nombre d'éléments par page
   * @param {string} params.tontineId - Filtrer par tontine (optionnel)
   * @param {string} params.statut - Filtrer par statut (En attente, Validee, Rejetee)
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async getMyTransactions(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.tontineId) queryParams.append('tontineId', params.tontineId);
    if (params.statut) queryParams.append('statut', params.statut);

    const url = `${API_CONFIG.ENDPOINTS.TRANSACTIONS.MY_TRANSACTIONS}?${queryParams.toString()}`;
    return await get(url);
  },

  // ========================================
  // LISTE DES TRANSACTIONS (TRÉSORIER/ADMIN)
  // ========================================

  /**
   * Liste de toutes les transactions avec filtres (Trésorier/Admin)
   * @param {object} params - Paramètres de recherche
   * @param {number} params.page - Numéro de page
   * @param {number} params.limit - Nombre d'éléments par page
   * @param {string} params.tontineId - Filtrer par tontine
   * @param {string} params.userId - Filtrer par utilisateur
   * @param {string} params.statut - Filtrer par statut (En attente, Validee, Rejetee)
   * @param {string} params.type - Filtrer par type (Cotisation, etc.)
   * @param {string} params.moyenPaiement - Filtrer par moyen de paiement
   * @param {string} params.dateDebut - Date de début (ISO)
   * @param {string} params.dateFin - Date de fin (ISO)
   * @param {number} params.minMontant - Montant minimum
   * @param {number} params.maxMontant - Montant maximum
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async listTransactions(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.tontineId) queryParams.append('tontineId', params.tontineId);
    if (params.userId) queryParams.append('userId', params.userId);
    if (params.statut) queryParams.append('statut', params.statut);
    if (params.type) queryParams.append('type', params.type);
    if (params.moyenPaiement) queryParams.append('moyenPaiement', params.moyenPaiement);
    if (params.dateDebut) queryParams.append('dateDebut', params.dateDebut);
    if (params.dateFin) queryParams.append('dateFin', params.dateFin);
    if (params.minMontant) queryParams.append('minMontant', params.minMontant);
    if (params.maxMontant) queryParams.append('maxMontant', params.maxMontant);

    const url = `${API_CONFIG.ENDPOINTS.TRANSACTIONS.LIST}?${queryParams.toString()}`;
    return await get(url);
  },

  // ========================================
  // DÉTAILS
  // ========================================

  /**
   * Obtenir les détails d'une transaction
   * @param {string} transactionId - ID de la transaction
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async getTransactionDetails(transactionId) {
    return await get(API_CONFIG.ENDPOINTS.TRANSACTIONS.DETAILS(transactionId));
  },

  // ========================================
  // VALIDATION (TRÉSORIER)
  // ========================================

  /**
   * Valider une transaction (Trésorier uniquement)
   * @param {string} transactionId - ID de la transaction
   * @param {string} notes - Notes optionnelles
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async validateTransaction(transactionId, notes = '') {
    return await post(API_CONFIG.ENDPOINTS.TRANSACTIONS.VALIDATE(transactionId), {
      notes,
    });
  },

  /**
   * Rejeter une transaction (Trésorier uniquement)
   * @param {string} transactionId - ID de la transaction
   * @param {string} motifRejet - Motif du rejet (obligatoire)
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async rejectTransaction(transactionId, motifRejet) {
    return await post(API_CONFIG.ENDPOINTS.TRANSACTIONS.REJECT(transactionId), {
      motifRejet,
    });
  },

  // ========================================
  // HELPERS
  // ========================================

  /**
   * Obtenir mes transactions en attente
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async getMyPendingTransactions() {
    return await this.getMyTransactions({ statut: 'En attente' });
  },

  /**
   * Obtenir mes transactions validées
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async getMyValidatedTransactions() {
    return await this.getMyTransactions({ statut: 'Validee' });
  },

  /**
   * Obtenir les transactions en attente de validation (Trésorier)
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async getPendingValidations() {
    return await this.listTransactions({ statut: 'En attente' });
  },

  /**
   * Calculer le total de mes cotisations validées
   * @returns {Promise<number>}
   */
  async getMyTotalCotisations() {
    const result = await this.getMyValidatedTransactions();
    if (!result.success || !result.data?.data) return 0;

    const transactions = result.data.data;
    return transactions.reduce((total, t) => total + (t.montant || 0), 0);
  },
  /**
   * Récupérer les transactions de toutes mes tontines
   * @param {object} params - Paramètres de recherche
   * @param {number} params.page - Numéro de page
   * @param {number} params.limit - Nombre d'éléments par page
   * @param {string} params.statut - Filtrer par statut
   * @param {string} params.tontineId - Filtrer par tontine spécifique
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async getMyTontinesTransactions(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.statut) queryParams.append('statut', params.statut);
      if (params.tontineId) queryParams.append('tontineId', params.tontineId);
      
      const url = `${API_CONFIG.ENDPOINTS.TRANSACTIONS.MY_TONTINES_TRANSACTIONS}?${queryParams.toString()}`;
      return await get(url);
    } catch (error) {
      console.error('Erreur getMyTontinesTransactions:', error);
      return {
        success: false,
        error: error?.message || 'Erreur lors de la récupération des transactions',
      };
    }
  },
};


export default transactionService;