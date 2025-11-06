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
// INTERCEPTEUR DE REQUETE
// ========================================
apiClient.interceptors.request.use(
  async (config) => {
    // 1. La clé API est gérée sur le serveur backend

    // 2. Ajouter le token JWT si disponible
    const token = await tokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 3. Augmenter le timeout pour les requêtes de tirage
    if (config.url.includes('/tirages/') || config.url.includes('/tontine/')) {
      config.timeout = 120000; // 120 secondes pour les tirages et tontines
    }
    
    // 4. Pour FormData (uploads), augmenter le timeout et retirer Content-Type
    // Vérifier si c'est FormData (React Native ou Web)
    // React Native utilise une implémentation spéciale de FormData
    const isFormData = config.data instanceof FormData || 
                      (config.data && typeof config.data === 'object' && 
                       config.data._parts !== undefined) || // React Native FormData
                      (config.data && typeof config.data.constructor === 'function' && 
                       config.data.constructor.name === 'FormData');
    
    if (isFormData) {
      // Configuration spéciale pour FormData (uploads)
      config.timeout = config.timeout || 120000; // 120 secondes par défaut pour FormData
      config.maxContentLength = Infinity;
      config.maxBodyLength = Infinity;
      
      // Ne pas définir Content-Type, laissez axios/navigateur le faire automatiquement
      // avec le boundary correct pour multipart/form-data
      if (config.headers) {
        delete config.headers['Content-Type'];
      }
      
      // Pour React Native, s'assurer que transformRequest est undefined
      // Cela permet à axios de gérer correctement le FormData
      config.transformRequest = undefined;
      
      if (__DEV__) {
        console.log('[API] FormData détecté - timeout:', config.timeout);
        console.log('[API] FormData type:', config.data.constructor?.name || typeof config.data);
        console.log('[API] FormData has _parts:', config.data._parts !== undefined);
      }
    }

    // 4. Logger en développement
    if (__DEV__) {
      console.log(`[API] ${config.method.toUpperCase()} ${config.url}`);
      console.log('[API] Timeout:', config.timeout);
      console.log('[API] Headers:', {
        'Content-Type': config.headers['Content-Type'],
        'Authorization': config.headers['Authorization'] ? 'présent' : 'absent',
        'Content-Length': config.headers['Content-Length']
      });
      
      if (config.data) {
        if (isFormData) {
          console.log('[API] FormData détecté - nombre de parts:', config.data._parts?.length || 'N/A');
          // Log les premières parts pour debug (sans le fichier complet)
          if (config.data._parts) {
            config.data._parts.slice(0, 3).forEach((part, index) => {
              if (Array.isArray(part) && part.length >= 2) {
                const [key, value] = part;
                if (typeof value === 'object' && value.uri) {
                  console.log(`[API] FormData part ${index}: ${key} = [FILE: ${value.name || 'unnamed'}]`);
                } else {
                  console.log(`[API] FormData part ${index}: ${key} = ${String(value).substring(0, 50)}`);
                }
              }
            });
          }
        } else {
          console.log('[API] Data (JSON):', config.data);
        }
      }
    }

    return config;
  },
  (error) => {
    console.error('[API] Erreur requete:', error);
    return Promise.reject(error);
  }
);

// ========================================
// INTERCEPTEUR DE REPONSE
// ========================================
apiClient.interceptors.response.use(
  (response) => {
    // Logger en développement
    if (__DEV__) {
      console.log(`[API] ${response.config.method.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
      if (response.data) {
        console.log('[API] Response:', response.data);
      }
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Logger l'erreur
    if (__DEV__) {
      console.error('[API] Erreur:', error.response?.status, error.message);
      if (error.response?.data) {
        console.error('[API] Error data:', error.response.data);
      } else if (error.code) {
        console.error('[API] Error code:', error.code);
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

      console.log('[API] 401 Error - Message:', backendMessage);
      console.log('[API] 401 Error - Code:', backendCode);
      console.log('[API] 401 Error - Error:', backendError);

      // Vérifier si c'est bien une erreur de session expirée
      const isTokenExpired = 
        backendMessage.toLowerCase().includes('expiré') ||
        backendMessage.toLowerCase().includes('expired') ||
        backendMessage.toLowerCase().includes('session') ||
        backendCode === 'TOKEN_EXPIRED' ||
        backendCode === 'SESSION_EXPIRED';

      if (isTokenExpired) {
        console.warn('[API] Session expirée détectée');
        
        // Nettoyer les tokens localement
        await tokenManager.clearTokens();
        
        // Emettre l'événement pour que AuthContext affiche le message
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
      const errorMessage = error.message || 'Erreur réseau inconnue';
      console.warn('[API] NETWORK ERROR -', errorMessage);
      console.warn('[API] Error code:', error.code);
      console.warn('[API] Request config:', {
        method: originalRequest?.method,
        url: originalRequest?.url,
        timeout: originalRequest?.timeout,
        hasData: !!originalRequest?.data,
        dataType: originalRequest?.data?.constructor?.name || typeof originalRequest?.data
      });
      
      // Vérifier si c'est un timeout
      const isTimeout = error.code === 'ECONNABORTED' || 
                       errorMessage.includes('timeout') || 
                       errorMessage.includes('ECONNABORTED');
      
      return Promise.reject({
        code: isTimeout ? API_CONFIG.ERROR_CODES.TIMEOUT : API_CONFIG.ERROR_CODES.NETWORK_ERROR,
        message: isTimeout ? 'La requete a expire. Veuillez reessayer.' : API_CONFIG.ERROR_MESSAGES.NETWORK_ERROR,
        originalError: error,
        isNetworkError: true,
        isTimeout: isTimeout,
      });
    }

    // ========================================
    // CAS 3 : Autres erreurs HTTP
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

    console.error('[API] HTTP Error', status, '-', errorCode, ':', errorMessage);

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
    console.error('[API Helper] GET Error:', error.code || error.message);
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
    console.error('[API Helper] POST Error:', error.code || error.message);
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
    console.error('[API Helper] PUT Error:', error.code || error.message);
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
    console.error('[API Helper] DELETE Error:', error.code || error.message);
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
    console.error('[API Helper] PATCH Error:', error.code || error.message);
    return { success: false, error };
  }
};

export default apiClient;