// src/services/api/apiClient.js
/**
 * Client API centralisé avec Axios
 * Gère automatiquement :
 * - L'ajout de la clé API
 * - L'ajout des tokens JWT
 * - Le refresh automatique des tokens (désactivé, redirige vers login)
 * - La gestion des erreurs
 * - Les retry en cas d'échec réseau
 */

import axios from 'axios';
import API_CONFIG from '../../config/api.config';
import tokenManager from '../../utils/tokenManager'; // Vérifiez ce chemin

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
      console.log(` [API] ${config.method.toUpperCase()} ${config.url}`);
      if (config.data) {
        console.log(' Data:', config.data);
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
    }

    // ========================================
    // CAS 1 : Token expiré (401) - Déconnexion
    // ========================================
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Nettoyer les tokens et forcer la reconnexion
      await tokenManager.clearTokens();
      
      console.warn(' Token expiré ou invalide. Déconnexion...');
      
      // Note: La redirection vers Login sera gérée par AuthContext
      // qui détectera l'absence de token via checkAuth()
      
      return Promise.reject({
        code: API_CONFIG.ERROR_CODES.UNAUTHORIZED,
        message: 'Session expirée. Veuillez vous reconnecter.',
        originalError: error,
      });
    }

    // ========================================
    // CAS 2 : Erreur réseau (pas de connexion)
    // ========================================
    if (!error.response) {
      return Promise.reject({
        code: API_CONFIG.ERROR_CODES.NETWORK_ERROR,
        message: API_CONFIG.ERROR_MESSAGES.NETWORK_ERROR,
        originalError: error,
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

    switch (status) {
      case 400:
        errorCode = API_CONFIG.ERROR_CODES.VALIDATION_ERROR;
        errorMessage = error.response.data?.message || API_CONFIG.ERROR_MESSAGES.VALIDATION_ERROR;
        break;
      case 401:
        errorCode = API_CONFIG.ERROR_CODES.UNAUTHORIZED;
        errorMessage = API_CONFIG.ERROR_MESSAGES.UNAUTHORIZED;
        break;
      case 403:
        errorCode = API_CONFIG.ERROR_CODES.FORBIDDEN;
        errorMessage = API_CONFIG.ERROR_MESSAGES.FORBIDDEN;
        break;
      case 404:
        errorCode = API_CONFIG.ERROR_CODES.NOT_FOUND;
        errorMessage = API_CONFIG.ERROR_MESSAGES.NOT_FOUND;
        break;
      case 500:
      case 502:
      case 503:
        errorCode = API_CONFIG.ERROR_CODES.SERVER_ERROR;
        errorMessage = API_CONFIG.ERROR_MESSAGES.SERVER_ERROR;
        break;
      default:
        errorMessage = error.response.data?.message || errorMessage;
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