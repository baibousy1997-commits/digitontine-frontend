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
    
    // ✅ CORRECTION : Envoyer le fichier correctement pour React Native
    if (photoIdentite) {
      formData.append('photoIdentite', {
        uri: photoIdentite.uri,
        type: photoIdentite.type || 'image/jpeg',
        name: photoIdentite.name || `photo_${Date.now()}.jpg`,
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
    
    // ✅ CORRECTION : Envoyer le fichier correctement pour React Native
    if (photoIdentite) {
      formData.append('photoIdentite', {
        uri: photoIdentite.uri,
        type: photoIdentite.type || 'image/jpeg',
        name: photoIdentite.name || `photo_${Date.now()}.jpg`,
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

  async getUserStats() {
    return await get(API_CONFIG.ENDPOINTS.USERS.STATS);
  },

  // ========================================
  // DÉTAILS ET MODIFICATION
  // ========================================

  async getUserDetails(userId) {
    return await get(API_CONFIG.ENDPOINTS.USERS.DETAILS(userId));
  },

  async updateUser(userId, data) {
    return await put(API_CONFIG.ENDPOINTS.USERS.UPDATE(userId), data);
  },

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
    
    // ✅ CORRECTION : Format React Native
    formData.append('photoProfil', {
      uri: photo.uri,
      type: photo.type || 'image/jpeg',
      name: photo.name || `profile_${Date.now()}.jpg`,
    });

    return await put(API_CONFIG.ENDPOINTS.USERS.UPDATE_PROFILE_PHOTO, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  async deleteProfilePhoto() {
    return await del(API_CONFIG.ENDPOINTS.USERS.DELETE_PROFILE_PHOTO);
  },

  // ========================================
  // ACTIVATION/DÉSACTIVATION
  // ========================================

  async toggleActivation(userId, validationRequestId, raison = '') {
    return await post(API_CONFIG.ENDPOINTS.USERS.TOGGLE_ACTIVATION(userId), {
      validationRequestId,
      raison,
    });
  },

  // ========================================
  // SUPPRESSION
  // ========================================

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

  async adminResetPassword(userId, notifyUser = true) {
    return await post(API_CONFIG.ENDPOINTS.USERS.RESET_PASSWORD(userId), {
      notifyUser,
    });
  },
};

export default userService;