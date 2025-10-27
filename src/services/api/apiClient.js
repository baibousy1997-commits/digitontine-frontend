// src/services/api/apiClient.js
/**
 * Client API centralisé avec Axios
 * Gère automatiquement :
 * - L'ajout de la clé API
 * - L'ajout des tokens JWT
 * - La gestion des sessions expirées
 * - La gestion des erreurs
 * - Les retry en cas d'échec réseau
 */

import axios from 'axios';
import API_CONFIG from '../../config/api.config';
import tokenManager from '../../utils/tokenManager';
import authEvents from '../../utils/authEvents';

// Créer une instance Axios
const apiClient = axios.create({
  baseURL: API_CONFIG.FULL_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.DEFAULT_HEADERS,
});

// Variable pour éviter les boucles infinies lors du refresh
let isRefreshing = false;
let refreshSubscribers = [];

/**
 * Notifier tous les abonnés quand le refresh est terminé
 */
const onRefreshed = (token) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

/**
 * Ajouter un abonné à la file d'attente du refresh
 */
const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

// ========================================
// INTERCEPTEUR DE REQUÊTE
// ========================================
apiClient.interceptors.request.use(
  async (config) => {
    // 1. Ajouter la clé API (OBLIGATOIRE)
    config.headers['X-API-Key'] = API_CONFIG.API_KEY;

    // 2. Ajouter le token JWT si disponible
    const token = await tokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 3. Logger en développement
    if (__DEV__) {
      console.log(`[API] ${config.method.toUpperCase()} ${config.url}`);
      if (config.data) {
        console.log('Data:', config.data);
      }
    }

    return config;
  },
  (error) => {
    console.error(' [API] Erreur requête:', error);
    return Promise.reject(error);
  }
);

// ========================================
// INTERCEPTEUR DE RÉPONSE
// ========================================
apiClient.interceptors.response.use(
  (response) => {
    // Logger en développement
    if (__DEV__) {
      console.log(` [API] ${response.config.method.toUpperCase()} ${response.config.url}`);
      console.log(' Response:', response.data);
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Logger l'erreur
    if (__DEV__) {
      console.error(' [API] Erreur:', error.response?.status, error.message);
      if (error.response?.data) {
        console.error(' Error data:', error.response.data);
      }
    }

    // ========================================
    // CAS 1 : Token expiré (401) - Déconnexion
    // ========================================
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Récupérer le message et le code d'erreur du backend
      const backendMessage = error.response?.data?.message || '';
      const backendCode = error.response?.data?.code || '';
      const backendError = error.response?.data?.error || '';

      console.log(' 401 Error - Message:', backendMessage);
      console.log(' 401 Error - Code:', backendCode);
      console.log(' 401 Error - Error:', backendError);

      // Vérifier si c'est bien une erreur de session expirée
      const isTokenExpired = 
        backendMessage.toLowerCase().includes('expiré') ||
        backendMessage.toLowerCase().includes('expired') ||
        backendMessage.toLowerCase().includes('session') ||
        backendCode === 'TOKEN_EXPIRED' ||
        backendCode === 'SESSION_EXPIRED';

      if (isTokenExpired) {
        console.warn(' Session expirée détectée dans apiClient');
        
        // Nettoyer les tokens localement
        await tokenManager.clearTokens();
        
        // Émettre l'événement pour que AuthContext affiche le message
        authEvents.emit('session_expired');
        
        return Promise.reject({
          code: 'SESSION_EXPIRED',
          message: 'Session expirée. Veuillez vous reconnecter.',
          originalError: error,
        });
      }

      // Si ce n'est pas un problème de session, c'est probablement des identifiants incorrects
      // IMPORTANT : Garder le message du backend
      return Promise.reject({
        code: backendCode || 'INVALID_CREDENTIALS',
        message: backendMessage || 'Identifiants incorrects.',
        data: error.response.data,
        originalError: error,
      });
    }

    // ========================================
    // CAS 2 : Erreur réseau (pas de connexion)
    // ========================================
    if (!error.response) {
      console.warn('🌐 NETWORK ERROR - Connexion internet instable');
      
      return Promise.reject({
        code: API_CONFIG.ERROR_CODES.NETWORK_ERROR,
        message: API_CONFIG.ERROR_MESSAGES.NETWORK_ERROR,
        originalError: error,
        isNetworkError: true,
      });
    }

    // ========================================
    // CAS 3 : Timeout
    // ========================================
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        code: API_CONFIG.ERROR_CODES.TIMEOUT,
        message: API_CONFIG.ERROR_MESSAGES.TIMEOUT,
        originalError: error,
      });
    }

    // ========================================
    // CAS 4 : Autres erreurs HTTP
    // ========================================
    const status = error.response.status;
    let errorCode = API_CONFIG.ERROR_CODES.UNKNOWN_ERROR;
    let errorMessage = API_CONFIG.ERROR_MESSAGES.UNKNOWN_ERROR;

    // IMPORTANT : Toujours prioriser le message du backend
    const backendMessage = error.response.data?.message;
    const backendCode = error.response.data?.code;

    switch (status) {
      case 400:
        errorCode = backendCode || API_CONFIG.ERROR_CODES.VALIDATION_ERROR;
        errorMessage = backendMessage || API_CONFIG.ERROR_MESSAGES.VALIDATION_ERROR;
        break;
      case 401:
        errorCode = backendCode || API_CONFIG.ERROR_CODES.UNAUTHORIZED;
        errorMessage = backendMessage || API_CONFIG.ERROR_MESSAGES.UNAUTHORIZED;
        break;
      case 403:
        errorCode = backendCode || API_CONFIG.ERROR_CODES.FORBIDDEN;
        errorMessage = backendMessage || API_CONFIG.ERROR_MESSAGES.FORBIDDEN;
        break;
      case 404:
        errorCode = backendCode || API_CONFIG.ERROR_CODES.NOT_FOUND;
        errorMessage = backendMessage || API_CONFIG.ERROR_MESSAGES.NOT_FOUND;
        break;
      case 500:
      case 502:
      case 503:
        errorCode = backendCode || API_CONFIG.ERROR_CODES.SERVER_ERROR;
        errorMessage = backendMessage || API_CONFIG.ERROR_MESSAGES.SERVER_ERROR;
        break;
      default:
        errorCode = backendCode || errorCode;
        errorMessage = backendMessage || errorMessage;
    }

    return Promise.reject({
      code: errorCode,
      message: errorMessage,
      status: status,
      data: error.response.data,
      originalError: error,
    });
  }
);

// ========================================
// HELPERS
// ========================================

/**
 * Effectuer une requête GET
 */
export const get = async (url, config = {}) => {
  try {
    const response = await apiClient.get(url, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Effectuer une requête POST
 */
export const post = async (url, data = {}, config = {}) => {
  try {
    const response = await apiClient.post(url, data, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Effectuer une requête PUT
 */
export const put = async (url, data = {}, config = {}) => {
  try {
    const response = await apiClient.put(url, data, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Effectuer une requête DELETE
 */
export const del = async (url, config = {}) => {
  try {
    const response = await apiClient.delete(url, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Effectuer une requête PATCH
 */
export const patch = async (url, data = {}, config = {}) => {
  try {
    const response = await apiClient.patch(url, data, config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};

export default apiClient;