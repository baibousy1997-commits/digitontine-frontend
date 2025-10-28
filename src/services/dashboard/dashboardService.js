// src/services/dashboard/dashboardService.js
/**
 * Service des tableaux de bord
 * Dashboards Admin, Trésorier, Membre avec KPIs
 */

import { get } from '../api/apiClient';
import API_CONFIG from '../../config/api.config';

const dashboardService = {
  // ========================================
  // DASHBOARD ADMINISTRATEUR
  // ========================================

  /**
   * Tableau de bord Administrateur
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async getDashboardAdmin() {
    console.log('📊 [SERVICE] getDashboardAdmin appelé');
    const result = await get(API_CONFIG.ENDPOINTS.DASHBOARD.ADMIN);
    console.log('📊 [SERVICE] Résultat getDashboardAdmin:', result);
    return result;
  },

  // ========================================
  // DASHBOARD TRÉSORIER
  // ========================================

  /**
   * Tableau de bord Trésorier
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async getDashboardTresorier() {
    console.log('💰 [SERVICE] getDashboardTresorier appelé');
    const result = await get(API_CONFIG.ENDPOINTS.DASHBOARD.TRESORIER);
    console.log('💰 [SERVICE] Résultat getDashboardTresorier:', result);
    return result;
  },

  // ========================================
  // DASHBOARD MEMBRE
  // ========================================

  /**
   * Tableau de bord Membre
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async getDashboardMembre() {
    console.log('👤 [SERVICE] getDashboardMembre appelé');
    const result = await get(API_CONFIG.ENDPOINTS.DASHBOARD.MEMBRE);
    console.log('👤 [SERVICE] Résultat getDashboardMembre:', result);
    return result;
  },

  // ========================================
  // STATISTIQUES GLOBALES (ADMIN)
  // ========================================

  /**
   * Statistiques globales avec filtres de date (Admin uniquement)
   * @param {string} dateDebut - Date de début (ISO format) - optionnel
   * @param {string} dateFin - Date de fin (ISO format) - optionnel
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async getStatistiquesGlobales(dateDebut = null, dateFin = null) {
    const queryParams = new URLSearchParams();
    
    if (dateDebut) queryParams.append('dateDebut', dateDebut);
    if (dateFin) queryParams.append('dateFin', dateFin);

    const url = `${API_CONFIG.ENDPOINTS.DASHBOARD.STATISTIQUES}?${queryParams.toString()}`;
    console.log('📈 [SERVICE] getStatistiquesGlobales:', url);
    
    const result = await get(url);
    console.log('📈 [SERVICE] Résultat statistiques:', result);
    return result;
  },

  // ========================================
  // HELPERS
  // ========================================

  /**
   * Obtenir le dashboard selon le rôle de l'utilisateur
   * @param {string} role - Rôle de l'utilisateur (Administrateur, Tresorier, Membre)
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async getDashboardByRole(role) {
    console.log('🔀 [SERVICE] getDashboardByRole:', role);
    
    switch (role) {
      case 'Administrateur':
      case 'Admin':
        return await this.getDashboardAdmin();
      
      case 'Tresorier':
        return await this.getDashboardTresorier();
      
      case 'Membre':
        return await this.getDashboardMembre();
      
      default:
        console.warn('⚠️ [SERVICE] Rôle invalide:', role);
        return { success: false, error: { message: 'Rôle invalide' } };
    }
  },

  /**
   * Obtenir les KPIs essentiels pour le rôle actuel
   * @param {string} role - Rôle de l'utilisateur
   * @returns {Promise<object|null>}
   */
  async getEssentialKPIs(role) {
    const result = await this.getDashboardByRole(role);
    if (!result.success) return null;

    const data = result.data?.data;
    if (!data) return null;

    // Extraire les KPIs selon le rôle
    switch (role) {
      case 'Administrateur':
      case 'Admin':
        return {
          totalUtilisateurs: data.utilisateurs?.total || 0,
          utilisateursActifs: data.utilisateurs?.actifs || 0,
          totalTontines: data.tontines?.total || 0,
          tontinesActives: data.tontines?.actives || 0,
        };
      
      case 'Tresorier':
        return {
          montantTotalCollecte: data.kpis?.montantTotalCollecte || 0,
          montantTotalDistribue: data.kpis?.montantTotalDistribue || 0,
          soldeDisponible: data.kpis?.soldeDisponible || 0,
          tauxRecouvrement: data.kpis?.tauxRecouvrement || '0%',
          transactionsEnAttente: data.kpis?.transactionsEnAttente || 0,
        };
      
      case 'Membre':
        return {
          tontinesActives: data.resume?.tontinesActives || 0,
          totalCotise: data.resume?.totalCotise || 0,
          totalGagne: data.resume?.totalGagne || 0,
          retards: data.resume?.retards || 0,
        };
      
      default:
        return null;
    }
  },

  /**
   * Vérifier s'il y a des alertes importantes
   * @param {string} role - Rôle de l'utilisateur
   * @returns {Promise<object|null>}
   */
  async getAlerts(role) {
    const result = await this.getDashboardByRole(role);
    if (!result.success) return null;

    const data = result.data?.data;
    if (!data) return null;

    let alerts = [];

    if (role === 'Administrateur' || role === 'Admin') {
      if (data.alertes?.membresEnRetard > 0) {
        alerts.push({
          type: 'warning',
          message: `${data.alertes.membresEnRetard} membre(s) en retard`,
          count: data.alertes.membresEnRetard,
        });
      }
      if (data.alertes?.tontinesBloquees > 0) {
        alerts.push({
          type: 'error',
          message: `${data.alertes.tontinesBloquees} tontine(s) bloquée(s)`,
          count: data.alertes.tontinesBloquees,
        });
      }
    }

    if (role === 'Tresorier') {
      if (data.kpis?.transactionsEnAttente > 0) {
        alerts.push({
          type: 'info',
          message: `${data.kpis.transactionsEnAttente} transaction(s) en attente de validation`,
          count: data.kpis.transactionsEnAttente,
        });
      }
    }

    if (role === 'Membre') {
      if (data.resume?.retards > 0) {
        alerts.push({
          type: 'warning',
          message: `Vous avez ${data.resume.retards} cotisation(s) en retard`,
          count: data.resume.retards,
        });
      }
    }

    return alerts;
  },
};

export default dashboardService;