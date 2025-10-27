// src/config/api.config.js
/**
 * Configuration centralisée de l'API DigiTontine
 * ✅ Valeurs en dur temporaires (à remplacer par .env + app.json après)
 */

// ========================================
// CONFIGURATION API
// ========================================
const API_BASE_URL = 'https://digitontine-backend.onrender.com';
const API_KEY = 'digitontine_2025_secret_key_change_this_in_production';
const API_PREFIX = '/digitontine';

const API_CONFIG = {
  // URLs de base
  BASE_URL: API_BASE_URL,
  API_PREFIX: API_PREFIX,
  FULL_URL: `${API_BASE_URL}${API_PREFIX}`,
  
  // Clé API (OBLIGATOIRE)
  API_KEY: API_KEY,
  
  // Timeout (30 secondes)
  TIMEOUT: 30000,
  
  // Nombre de tentatives
  RETRY_ATTEMPTS: 3,
  
  // Headers par défaut
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-API-Key': API_KEY,
  },
  
  // ========================================
  // ENDPOINTS
  // ========================================
  ENDPOINTS: {
    AUTH: {
      CREATE_ADMIN_PUBLIC: `${API_BASE_URL}/create-admin-public`,
      LOGIN_STEP1: '/auth/login',
      LOGIN_STEP2: '/auth/verify-login-otp',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
      CONFIRM_PASSWORD_CHANGE: '/auth/confirm-password-change',
      FIRST_PASSWORD_CHANGE: '/auth/first-password-change',
      CHANGE_PASSWORD: '/auth/change-password',
      GET_ME: '/auth/me',
      LOGOUT: '/auth/logout',
      VERIFY_TOKEN: '/auth/verify',
      FCM_TOKEN: '/auth/fcm-token',
    },
    
    USERS: {
      LIST: '/users',
      CREATE_MEMBRE: '/users/membre',
      CREATE_TRESORIER: '/users/tresorier',
      STATS: '/users/stats',
      DETAILS: (userId) => `/users/${userId}`,
      UPDATE: (userId) => `/users/${userId}`,
      DELETE: (userId) => `/users/${userId}`,
      TOGGLE_ACTIVATION: (userId) => `/users/${userId}/toggle-activation`,
      RESET_PASSWORD: (userId) => `/users/${userId}/reset-password`,
      UPDATE_MY_PROFILE: '/users/me',
      UPDATE_PROFILE_PHOTO: '/users/me/photo-profil',
      DELETE_PROFILE_PHOTO: '/users/me/photo-profil',
    },
    
    TONTINES: {
      LIST: '/tontines',
      CREATE: '/tontines',
      DETAILS: (tontineId) => `/tontines/${tontineId}`,
      UPDATE: (tontineId) => `/tontines/${tontineId}`,
      DELETE: (tontineId) => `/tontines/${tontineId}`,
      ADD_MEMBERS: (tontineId) => `/tontines/${tontineId}/membres`,
      REMOVE_MEMBER: (tontineId, userId) => `/tontines/${tontineId}/membres/${userId}`,
      ACTIVATE: (tontineId) => `/tontines/${tontineId}/activate`,
      BLOCK: (tontineId) => `/tontines/${tontineId}/block`,
      UNBLOCK: (tontineId) => `/tontines/${tontineId}/unblock`,
      CLOSE: (tontineId) => `/tontines/${tontineId}/close`,
      OPT_IN_TIRAGE: (tontineId) => `/tontines/${tontineId}/opt-in`,
    },
    
    TRANSACTIONS: {
      LIST: '/transactions',
      CREATE: '/transactions',
      MY_TRANSACTIONS: '/transactions/me',
      DETAILS: (transactionId) => `/transactions/${transactionId}`,
      VALIDATE: (transactionId) => `/transactions/${transactionId}/validate`,
      REJECT: (transactionId) => `/transactions/${transactionId}/reject`,
      WEBHOOK_WAVE: '/transactions/webhook/wave',
    },
    
    TIRAGES: {
      LIST_BY_TONTINE: (tontineId) => `/tirages/tontine/${tontineId}`,
      NOTIFY_MEMBERS: (tontineId) => `/tirages/tontine/${tontineId}/notify`,
      AUTOMATIQUE: (tontineId) => `/tirages/tontine/${tontineId}/automatique`,
      MANUEL: (tontineId) => `/tirages/tontine/${tontineId}/manuel`,
      ANNULER: (tirageId) => `/tirages/${tirageId}/annuler`,
      DETAILS: (tirageId) => `/tirages/${tirageId}`,
      MES_GAINS: '/tirages/me/gains',
    },
    
    DASHBOARD: {
      ADMIN: '/dashboard/admin',
      TRESORIER: '/dashboard/tresorier',
      MEMBRE: '/dashboard/membre',
      STATISTIQUES: '/dashboard/statistiques',
    },
    
    VALIDATION: {
      CREATE_REQUEST: '/validations/request',
      CONFIRM_TRESORIER: (requestId) => `/validations/confirm/tresorier/${requestId}`,
      REJECT: (requestId) => `/validations/reject/${requestId}`,
      PENDING: '/validations/pending',
      MY_REQUESTS: '/validations/my-requests',
      DETAILS: (requestId) => `/validations/${requestId}`,
      RESEND_OTP: (requestId) => `/validations/resend-otp/${requestId}`,
    },
  },
  
  ERROR_CODES: {
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT: 'TIMEOUT',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    NOT_FOUND: 'NOT_FOUND',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    SERVER_ERROR: 'SERVER_ERROR',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  },
  
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Erreur de connexion. Vérifiez votre internet.',
    TIMEOUT: 'La requête a pris trop de temps. Réessayez.',
    UNAUTHORIZED: 'Session expirée. Veuillez vous reconnecter.',
    FORBIDDEN: 'Vous n\'avez pas les permissions nécessaires.',
    NOT_FOUND: 'Ressource introuvable.',
    VALIDATION_ERROR: 'Données invalides.',
    SERVER_ERROR: 'Erreur serveur. Réessayez plus tard.',
    UNKNOWN_ERROR: 'Une erreur est survenue.',
  },
};

console.log('🔧 API Config chargée:', {
  baseUrl: API_CONFIG.BASE_URL,
  fullUrl: API_CONFIG.FULL_URL,
  hasApiKey: !!API_CONFIG.API_KEY,
});

export default API_CONFIG;