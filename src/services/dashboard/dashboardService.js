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
   * 
   * Retourne :
   * - Statistiques utilisateurs (total, actifs, nouveaux ce mois, répartition par rôle)
   * - Statistiques tontines (total, actives, terminées, en attente, bloquées, populaires)
   * - Statistiques financières globales
   * - Alertes (membres en retard, tontines bloquées)
   * - Logs d'audit récents
   */
  async getDashboardAdmin() {
    return await get(API_CONFIG.ENDPOINTS.DASHBOARD.ADMIN);
  },

  // ========================================
  // DASHBOARD TRÉSORIER
  // ========================================

  /**
   * Tableau de bord Trésorier
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   * 
   * Retourne :
   * - KPIs principaux (montant total collecté, distribué, solde disponible, taux de recouvrement)
   * - Transactions en attente de validation
   * - Total des pénalités
   * - Répartition des cotisations par tontine
   * - Évolution des cotisations (30 derniers jours)
   * - Top 5 membres ponctuels
   */
  async getDashboardTresorier() {
    return await get(API_CONFIG.ENDPOINTS.DASHBOARD.TRESORIER);
  },

  // ========================================
  // DASHBOARD MEMBRE
  // ========================================

  /**
   * Tableau de bord Membre
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   * 
   * Retourne :
   * - Résumé (nombre de tontines actives, total cotisé, total gagné, pénalités, retards)
   * - Mes tontines actives
   * - Mes gains
   * - Prochaines échéances
   */
  async getDashboardMembre() {
    return await get(API_CONFIG.ENDPOINTS.DASHBOARD.MEMBRE);
  },

  // ========================================
  // STATISTIQUES GLOBALES (ADMIN)
  // ========================================

  /**
   * Statistiques globales avec filtres de date (Admin uniquement)
   * @param {string} dateDebut - Date de début (ISO format) - optionnel
   * @param {string} dateFin - Date de fin (ISO format) - optionnel
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   * 
   * Retourne :
   * - Statistiques des transactions (total, count, moyenne)
   * - Statistiques des tontines (répartition par statut)
   * - Statistiques des utilisateurs (répartition par rôle)
   */
  async getStatistiquesGlobales(dateDebut = null, dateFin = null) {
    const queryParams = new URLSearchParams();
    
    if (dateDebut) queryParams.append('dateDebut', dateDebut);
    if (dateFin) queryParams.append('dateFin', dateFin);

    const url = `${API_CONFIG.ENDPOINTS.DASHBOARD.STATISTIQUES}?${queryParams.toString()}`;
    return await get(url);
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
    switch (role) {
      case 'Administrateur':
        return await this.getDashboardAdmin();
      case 'Tresorier':
        return await this.getDashboardTresorier();
      case 'Membre':
        return await this.getDashboardMembre();
      default:
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

    if (role === 'Administrateur') {
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