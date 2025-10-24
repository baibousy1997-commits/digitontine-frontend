// src/services/user/userService.js
/**
 * Service de gestion des utilisateurs
 * CRUD utilisateurs, profil, photos, etc.
 */

import { get, post, put, del } from '../api/apiClient';
import API_CONFIG from '../../config/api.config';

const userService = {
  // ========================================
  // CRÉATION D'UTILISATEURS (Admin uniquement)
  // ========================================

  /**
   * Créer un compte Membre (avec photo d'identité optionnelle)
   * @param {object} data - Données du membre
   * @param {File} photoIdentite - Photo d'identité (optionnel)
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async createMembre(data, photoIdentite = null) {
    const formData = new FormData();
    
    // Ajouter les champs texte
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });
    
    // Ajouter la photo si présente
    if (photoIdentite) {
      formData.append('photoIdentite', {
        uri: photoIdentite.uri,
        type: photoIdentite.type || 'image/jpeg',
        name: photoIdentite.name || 'photo.jpg',
      });
    }

    return await post(API_CONFIG.ENDPOINTS.USERS.CREATE_MEMBRE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Créer un compte Trésorier (avec photo d'identité optionnelle)
   * @param {object} data - Données du trésorier
   * @param {File} photoIdentite - Photo d'identité (optionnel)
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async createTresorier(data, photoIdentite = null) {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });
    
    if (photoIdentite) {
      formData.append('photoIdentite', {
        uri: photoIdentite.uri,
        type: photoIdentite.type || 'image/jpeg',
        name: photoIdentite.name || 'photo.jpg',
      });
    }

    return await post(API_CONFIG.ENDPOINTS.USERS.CREATE_TRESORIER, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // ========================================
  // LISTE ET RECHERCHE
  // ========================================

  /**
   * Liste des utilisateurs avec filtres et pagination
   * @param {object} params - Paramètres de recherche
   * @param {number} params.page - Numéro de page
   * @param {number} params.limit - Nombre d'éléments par page
   * @param {string} params.role - Filtrer par rôle (Membre, Tresorier, Administrateur)
   * @param {boolean} params.isActive - Filtrer par statut (true/false)
   * @param {string} params.search - Recherche textuelle
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async listUsers(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.role) queryParams.append('role', params.role);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);
    if (params.search) queryParams.append('search', params.search);

    const url = `${API_CONFIG.ENDPOINTS.USERS.LIST}?${queryParams.toString()}`;
    return await get(url);
  },

  /**
   * Obtenir les statistiques des utilisateurs
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async getUserStats() {
    return await get(API_CONFIG.ENDPOINTS.USERS.STATS);
  },

  // ========================================
  // DÉTAILS ET MODIFICATION
  // ========================================

  /**
   * Obtenir les détails d'un utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async getUserDetails(userId) {
    return await get(API_CONFIG.ENDPOINTS.USERS.DETAILS(userId));
  },

  /**
   * Modifier un utilisateur (Admin uniquement)
   * @param {string} userId - ID de l'utilisateur
   * @param {object} data - Données à modifier
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async updateUser(userId, data) {
    return await put(API_CONFIG.ENDPOINTS.USERS.UPDATE(userId), data);
  },

  /**
   * Modifier mon propre profil
   * @param {object} data - Données à modifier (numeroTelephone, adresse, preferences)
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async updateMyProfile(data) {
    return await put(API_CONFIG.ENDPOINTS.USERS.UPDATE_MY_PROFILE, data);
  },

  // ========================================
  // PHOTOS
  // ========================================

  /**
   * Mettre à jour ma photo de profil
   * @param {File} photo - Photo de profil
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async updateProfilePhoto(photo) {
    const formData = new FormData();
    formData.append('photoProfil', {
      uri: photo.uri,
      type: photo.type || 'image/jpeg',
      name: photo.name || 'profile.jpg',
    });

    return await put(API_CONFIG.ENDPOINTS.USERS.UPDATE_PROFILE_PHOTO, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Supprimer ma photo de profil
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async deleteProfilePhoto() {
    return await del(API_CONFIG.ENDPOINTS.USERS.DELETE_PROFILE_PHOTO);
  },

  // ========================================
  // ACTIVATION/DÉSACTIVATION
  // ========================================

  /**
   * Activer/Désactiver un utilisateur (avec double validation)
   * @param {string} userId - ID de l'utilisateur
   * @param {string} validationRequestId - ID de la demande de validation
   * @param {string} raison - Raison de l'action (optionnel)
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async toggleActivation(userId, validationRequestId, raison = '') {
    return await post(API_CONFIG.ENDPOINTS.USERS.TOGGLE_ACTIVATION(userId), {
      validationRequestId,
      raison,
    });
  },

  // ========================================
  // SUPPRESSION
  // ========================================

  /**
   * Supprimer un utilisateur (avec double validation)
   * @param {string} userId - ID de l'utilisateur
   * @param {string} validationRequestId - ID de la demande de validation
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async deleteUser(userId, validationRequestId) {
    return await del(API_CONFIG.ENDPOINTS.USERS.DELETE(userId), {
      data: {
        validationRequestId,
        confirmation: 'SUPPRIMER',
      },
    });
  },

  // ========================================
  // RÉINITIALISATION MOT DE PASSE (Admin)
  // ========================================

  /**
   * Réinitialiser le mot de passe d'un utilisateur (Admin)
   * @param {string} userId - ID de l'utilisateur
   * @param {boolean} notifyUser - Envoyer un email à l'utilisateur (défaut: true)
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async adminResetPassword(userId, notifyUser = true) {
    return await post(API_CONFIG.ENDPOINTS.USERS.RESET_PASSWORD(userId), {
      notifyUser,
    });
  },
};

export default userService;