// src/services/auth/authService.js
/**
 * Service d'authentification
 * Tous les endpoints liés à l'authentification
 */

import { get, post, del } from '../api/apiClient';
import API_CONFIG from '../../config/api.config';
import tokenManager from '../../utils/tokenManager';

const authService = {
  // ========================================
  // CONNEXION (2 ÉTAPES OBLIGATOIRES)
  // ========================================

  /**
   * Étape 1 : Connexion - Envoi des identifiants
   * @param {string} identifier - Email ou numéro de téléphone
   * @param {string} motDePasse - Mot de passe
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async login(identifier, motDePasse) {
    const result = await post(API_CONFIG.ENDPOINTS.AUTH.LOGIN_STEP1, {
      identifier,
      motDePasse,
    });

    if (result.success && result.data?.data) {
      const responseData = result.data.data;

      // TOUJOURS OTP requis maintenant
      if (responseData.requiresOTP) {
        return {
          success: true,
          requiresOTP: true,
          email: responseData.email,
          message: responseData.message,
          expiresIn: responseData.expiresIn,
        };
      }

      // Cas connexion directe (ne devrait plus arriver)
      if (responseData.accessToken && responseData.user) {
        const { user, accessToken, refreshToken, requiresPasswordChange } = responseData;

        await tokenManager.saveTokens(accessToken, refreshToken);
        await tokenManager.saveUser(user);

        console.log('Tokens sauvegardes (connexion directe)');

        return {
          success: true,
          requiresOTP: false,
          user,
          requiresPasswordChange: requiresPasswordChange || false,
        };
      }
    }

    return result;
  },

  /**
   * Étape 2 : Vérification du code OTP
   * @param {string} email - Email de l'utilisateur (depuis étape 1)
   * @param {string} code - Code OTP à 6 chiffres
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async verifyLoginOTP(email, code) {
    console.log('Envoi verification OTP:', { email, code });

    const result = await post(API_CONFIG.ENDPOINTS.AUTH.LOGIN_STEP2, {
      email,
      code,
    });

    if (result.success && result.data?.data) {
      const { user, accessToken, refreshToken, requiresPasswordChange } = result.data.data;

      // Sauvegarder les tokens et les infos utilisateur
      await tokenManager.saveTokens(accessToken, refreshToken);
      await tokenManager.saveUser(user);

      console.log('OTP verifie, tokens sauvegardes');

      return {
        success: true,
        user,
        requiresPasswordChange,
      };
    }

    return result;
  },

  // ========================================
  // MOT DE PASSE OUBLIÉ
  // ========================================

  /**
   * Demander un code de réinitialisation
   * @param {string} email - Email de l'utilisateur
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async forgotPassword(email) {
    return await post(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  },

  /**
   * Réinitialiser le mot de passe avec le code reçu
   * @param {string} email - Email de l'utilisateur
   * @param {string} code - Code à 6 chiffres reçu par email
   * @param {string} nouveauMotDePasse - Nouveau mot de passe
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async resetPassword(email, code, nouveauMotDePasse) {
    return await post(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, {
      email,
      code,
      nouveauMotDePasse,
    });
  },

  /**
   * Confirmer le changement de mot de passe via le token du lien email
   * @param {string} token - Token reçu du lien email
   * @param {string} action - 'approve' ou 'reject'
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async confirmPasswordChange(token, action = 'approve') {
    return await get(
      `${API_CONFIG.ENDPOINTS.AUTH.CONFIRM_PASSWORD_CHANGE}/${token}?action=${action}`
    );
  },

  // ========================================
  // CHANGEMENT DE MOT DE PASSE
  // ========================================

  /**
   * Changement de mot de passe première connexion (obligatoire)
   * @param {string} ancienMotDePasse - Ancien mot de passe
   * @param {string} nouveauMotDePasse - Nouveau mot de passe
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async firstPasswordChange(ancienMotDePasse, nouveauMotDePasse) {
    return await post(API_CONFIG.ENDPOINTS.AUTH.FIRST_PASSWORD_CHANGE, {
      ancienMotDePasse,
      nouveauMotDePasse,
    });
  },





/**
 * Changement de mot de passe volontaire (AVEC confirmation email)
 * @param {string} ancienMotDePasse - Ancien mot de passe
 * @param {string} nouveauMotDePasse - Nouveau mot de passe
 * @returns {Promise<{success: boolean, data?: any, error?: any}>}
 */
async changePassword(ancienMotDePasse, nouveauMotDePasse) {
  return await post(API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD, {
    ancienMotDePasse,
    nouveauMotDePasse,
  });
},

  // ========================================
  // PROFIL
  // ========================================

/**
 * Obtenir mon profil
 * @returns {Promise<{success: boolean, data?: any, error?: any}>}
 */
async getMe() {
  try {
    console.log('🔍 Appel API getMe...');
    const result = await get(API_CONFIG.ENDPOINTS.AUTH.GET_ME);
    
    console.log('📦 Réponse brute getMe:', JSON.stringify(result, null, 2));
    
    // Vérifier la structure de la réponse
    if (result.success) {
      console.log('✅ Success = true');
      console.log('📄 result.data:', result.data);
      
      // Si la réponse a result.data.data (double imbrication)
      if (result.data && result.data.data) {
        console.log('⚠️ Double imbrication détectée - extraction de data.data');
        return {
          success: true,
          data: result.data.data,
        };
      }
      
      // Si la réponse a directement result.data
      if (result.data) {
        console.log('✅ Structure normale - data directement accessible');
        return result;
      }
    }
    
    console.log('❌ Pas de données dans la réponse');
    return result;
    
  } catch (error) {
    console.error('💥 Exception getMe:', error);
    return {
      success: false,
      error: {
        message: error.message || 'Erreur lors de la récupération du profil',
        isNetworkError: error?.isNetworkError || false,
      },
    };
  }
},

/**
 * Vérifier la validité du token
 * @returns {Promise<{success: boolean, data?: any, error?: any}>}
 */
async verifyToken() {
  try {
    const result = await get(API_CONFIG.ENDPOINTS.AUTH.VERIFY_TOKEN);
    
    // Propager le flag isNetworkError si présent
    if (!result.success && result.error?.isNetworkError) {
      return {
        success: false,
        error: {
          ...result.error,
          isNetworkError: true,
        },
      };
    }
    
    return result;
  } catch (error) {
    return {
      success: false,
      error: {
        ...error,
        isNetworkError: error?.isNetworkError || false,
      },
    };
  }
},

  // ========================================
  // DÉCONNEXION
  // ========================================

  /**
   * Déconnexion
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async logout() {
    const result = await post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    
    // Supprimer les tokens locaux
    await tokenManager.clearTokens();
    
    return result;
  },

  // ========================================
  // NOTIFICATIONS (FCM)
  // ========================================

  /**
   * Enregistrer un token FCM pour les notifications push
   * @param {string} fcmToken - Token FCM
   * @param {string} device - Nom de l'appareil (optionnel)
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async registerFCMToken(fcmToken, device = 'Mobile') {
    return await post(API_CONFIG.ENDPOINTS.AUTH.FCM_TOKEN, { fcmToken, device });
  },

  /**
   * Supprimer un token FCM
   * @param {string} fcmToken - Token FCM à supprimer
   * @returns {Promise<{success: boolean, data?: any, error?: any}>}
   */
  async removeFCMToken(fcmToken) {
    return await del(API_CONFIG.ENDPOINTS.AUTH.FCM_TOKEN, {
      data: { fcmToken },
    });
  },

  // ========================================
  // HELPERS
  // ========================================

  /**
   * Vérifier si l'utilisateur est connecté
   * @returns {Promise<boolean>}
   */
  async isAuthenticated() {
    return await tokenManager.isAuthenticated();
  },

  /**
   * Obtenir l'utilisateur actuel depuis le stockage local
   * @returns {Promise<object|null>}
   */
  async getCurrentUser() {
    return await tokenManager.getUser();
  },
};

export default authService;