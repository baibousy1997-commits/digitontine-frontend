// src/services/user/userService.js
/**
 * Service de gestion des utilisateurs
 * CRUD utilisateurs, profil, photos, etc.
 */

import { get, post, put, del } from '../api/apiClient';
import API_CONFIG from '../../config/api.config';
import tokenManager from '../../utils/tokenManager';

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
    // Si pas de photo, envoyer en JSON (plus rapide et fiable)
    if (!photoIdentite) {
      console.log('[userService] Création membre SANS photo - envoi JSON');
      return await post(API_CONFIG.ENDPOINTS.USERS.CREATE_MEMBRE, data, {
        timeout: 30000, // 30 secondes pour JSON
      });
    }
    
    // Si photo, utiliser FormData
    console.log('[userService] Création membre AVEC photo - envoi multipart');
    const formData = new FormData();
    
    // Ajouter les champs texte
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });
    
    // CORRECTION : Envoyer le fichier correctement pour React Native
    // Extraire le type MIME depuis l'URI ou utiliser le type par défaut
    let fileType = 'image/jpeg'; // Par défaut
    if (photoIdentite.mimeType) {
      fileType = photoIdentite.mimeType;
    } else if (photoIdentite.type) {
      // Si type est "image", convertir en MIME type selon l'extension
      if (photoIdentite.type === 'image') {
        const uri = photoIdentite.uri.toLowerCase();
        if (uri.includes('.png')) {
          fileType = 'image/png';
        } else if (uri.includes('.jpg') || uri.includes('.jpeg')) {
          fileType = 'image/jpeg';
        } else {
          fileType = 'image/jpeg'; // Par défaut
        }
      } else {
        fileType = photoIdentite.type;
      }
    }
    
    // Extraire le nom de fichier depuis l'URI ou utiliser un nom par défaut
    let fileName = `photo_${Date.now()}.jpg`;
    if (photoIdentite.fileName) {
      fileName = photoIdentite.fileName;
    } else if (photoIdentite.name) {
      fileName = photoIdentite.name;
      // S'assurer que le nom a une extension
      if (!fileName.includes('.')) {
        fileName += '.jpg';
      }
    } else if (photoIdentite.uri) {
      // Extraire le nom depuis l'URI
      const uriParts = photoIdentite.uri.split('/');
      const lastPart = uriParts[uriParts.length - 1];
      if (lastPart && lastPart.includes('.')) {
        fileName = lastPart;
      }
    }
    
    formData.append('photoIdentite', {
      uri: photoIdentite.uri,
      type: fileType,
      name: fileName,
    });
    
    console.log('Image preparee pour membre:', {
      uri: photoIdentite.uri.substring(0, 50) + '...',
      type: fileType,
      name: fileName,
    });

    // Pour React Native, utiliser fetch directement pour les uploads FormData
    // car axios a des problèmes avec React Native FormData
    try {
      console.log('[userService] Envoi FormData avec', formData._parts?.length || 0, 'parts');
      
      const token = await tokenManager.getAccessToken();
      const url = `${API_CONFIG.FULL_URL}${API_CONFIG.ENDPOINTS.USERS.CREATE_MEMBRE}`;
      
      console.log('[userService] URL complète:', url);
      
      // Utiliser fetch avec timeout manuel
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 secondes
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          // Ne pas mettre Content-Type, fetch le gère automatiquement pour FormData
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // Gérer les erreurs de parsing JSON
      let data;
      try {
        const text = await response.text();
        if (!text) {
          throw new Error('Réponse vide du serveur');
        }
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('[userService] Erreur parsing JSON:', parseError);
        return {
          success: false,
          error: {
            code: 'PARSE_ERROR',
            message: 'Réponse invalide du serveur. Veuillez réessayer.',
            originalError: parseError
          }
        };
      }
      
      console.log('[userService] Réponse status:', response.status);
      console.log('[userService] Réponse reçue:', data.success);
      
      if (!response.ok) {
        return {
          success: false,
          error: {
            message: data.message || data.error?.message || data.error || 'Erreur lors de la création',
            code: data.code || data.error?.code || 'SERVER_ERROR',
            details: data.error,
            error: data.error
          }
        };
      }
      
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('[userService] Erreur upload membre:', error);
      console.error('[userService] Erreur stack:', error.stack);
      
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: {
            code: 'TIMEOUT',
            message: 'La requête a pris trop de temps. Veuillez réessayer.',
            originalError: error
          }
        };
      }
      
      let errorCode = 'NETWORK_ERROR';
      let errorMessage = 'Erreur de connexion. Vérifiez votre internet.';
      
      if (error.message) {
        if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
          errorCode = 'NETWORK_ERROR';
          errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
        } else if (error.message.includes('JSON') || error.message.includes('parsing')) {
          errorCode = 'PARSE_ERROR';
          errorMessage = 'Réponse invalide du serveur. Veuillez réessayer.';
        }
      }
      
      return {
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
          originalError: error
        }
      };
    }
  },

  /**
   * Créer un compte Trésorier (avec photo d'identité optionnelle)
   * @param {object} data - Données du trésorier
   * @param {File} photoIdentite - Photo d'identité (optionnel)
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async createTresorier(data, photoIdentite = null) {
    // Si pas de photo, envoyer en JSON (plus rapide et fiable)
    if (!photoIdentite) {
      console.log('[userService] Création trésorier SANS photo - envoi JSON');
      return await post(API_CONFIG.ENDPOINTS.USERS.CREATE_TRESORIER, data, {
        timeout: 30000, // 30 secondes pour JSON
      });
    }
    
    // Si photo, utiliser FormData
    console.log('[userService] Création trésorier AVEC photo - envoi multipart');
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });
    
    // CORRECTION : Envoyer le fichier correctement pour React Native
    // Extraire le type MIME depuis l'URI ou utiliser le type par défaut
    let fileType = 'image/jpeg'; // Par défaut
    if (photoIdentite.mimeType) {
      fileType = photoIdentite.mimeType;
    } else if (photoIdentite.type) {
      // Si type est "image", convertir en MIME type selon l'extension
      if (photoIdentite.type === 'image') {
        const uri = photoIdentite.uri.toLowerCase();
        if (uri.includes('.png')) {
          fileType = 'image/png';
        } else if (uri.includes('.jpg') || uri.includes('.jpeg')) {
          fileType = 'image/jpeg';
        } else {
          fileType = 'image/jpeg'; // Par défaut
        }
      } else {
        fileType = photoIdentite.type;
      }
    }
    
    // Extraire le nom de fichier depuis l'URI ou utiliser un nom par défaut
    let fileName = `photo_${Date.now()}.jpg`;
    if (photoIdentite.fileName) {
      fileName = photoIdentite.fileName;
    } else if (photoIdentite.name) {
      fileName = photoIdentite.name;
      // S'assurer que le nom a une extension
      if (!fileName.includes('.')) {
        fileName += '.jpg';
      }
    } else if (photoIdentite.uri) {
      // Extraire le nom depuis l'URI
      const uriParts = photoIdentite.uri.split('/');
      const lastPart = uriParts[uriParts.length - 1];
      if (lastPart && lastPart.includes('.')) {
        fileName = lastPart;
      }
    }
    
    formData.append('photoIdentite', {
      uri: photoIdentite.uri,
      type: fileType,
      name: fileName,
    });
    
    console.log('Image preparee pour tresorier:', {
      uri: photoIdentite.uri.substring(0, 50) + '...',
      type: fileType,
      name: fileName,
    });

    // Pour React Native, utiliser fetch directement pour les uploads FormData
    // car axios a des problèmes avec React Native FormData
    try {
      console.log('[userService] Envoi FormData avec', formData._parts?.length || 0, 'parts');
      
      const token = await tokenManager.getAccessToken();
      const url = `${API_CONFIG.FULL_URL}${API_CONFIG.ENDPOINTS.USERS.CREATE_TRESORIER}`;
      
      console.log('[userService] URL complète:', url);
      
      // Utiliser fetch avec timeout manuel
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 secondes
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          // Ne pas mettre Content-Type, fetch le gère automatiquement pour FormData
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // Gérer les erreurs de parsing JSON
      let data;
      try {
        const text = await response.text();
        if (!text) {
          throw new Error('Réponse vide du serveur');
        }
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('[userService] Erreur parsing JSON:', parseError);
        return {
          success: false,
          error: {
            code: 'PARSE_ERROR',
            message: 'Réponse invalide du serveur. Veuillez réessayer.',
            originalError: parseError
          }
        };
      }
      
      console.log('[userService] Réponse status:', response.status);
      console.log('[userService] Réponse reçue:', data.success);
      
      if (!response.ok) {
        return {
          success: false,
          error: {
            message: data.message || data.error?.message || data.error || 'Erreur lors de la création',
            code: data.code || data.error?.code || 'SERVER_ERROR',
            details: data.error,
            error: data.error
          }
        };
      }
      
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('[userService] Erreur upload trésorier:', error);
      console.error('[userService] Erreur stack:', error.stack);
      
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: {
            code: 'TIMEOUT',
            message: 'La requête a pris trop de temps. Veuillez réessayer.',
            originalError: error
          }
        };
      }
      
      let errorCode = 'NETWORK_ERROR';
      let errorMessage = 'Erreur de connexion. Vérifiez votre internet.';
      
      if (error.message) {
        if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
          errorCode = 'NETWORK_ERROR';
          errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
        } else if (error.message.includes('JSON') || error.message.includes('parsing')) {
          errorCode = 'PARSE_ERROR';
          errorMessage = 'Réponse invalide du serveur. Veuillez réessayer.';
        }
      }
      
      return {
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
          originalError: error
        }
      };
    }
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
  
  // LOG POUR DÉBOGUER
  console.log('URL complete:', url);
  
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
    
    // CORRECTION : Format React Native
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