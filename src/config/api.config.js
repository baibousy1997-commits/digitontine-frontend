// src/config/api.config.js
/**
 * Configuration centralisée de l'API DigiTontine
 * VERSION SECURISEE - Clé API sur le serveur uniquement
 */

import Constants from 'expo-constants';

const ENV = Constants.expoConfig?.extra || {};

const API_BASE_URL = ENV.API_BASE_URL || 'https://digitontine-backend.onrender.com';
const API_PREFIX = ENV.API_PREFIX || '/api/proxy';
const API_TIMEOUT = parseInt(ENV.API_TIMEOUT || '120000', 10);

// ========================================
// CONFIGURATION COMPLÈTE
// ========================================
const API_CONFIG = {
  // URLs de base
  BASE_URL: API_BASE_URL,
  API_PREFIX: API_PREFIX,
 FULL_URL: `${API_BASE_URL}/api/proxy`,
  
  // IMPORTANT : Pas de clé API ici
  // La clé est gérée sur le serveur backend
  
  // Timeout (120 secondes)
  TIMEOUT: API_TIMEOUT,
  
  // Nombre de tentatives
  RETRY_ATTEMPTS: 3,
  
  // Headers par défaut (SANS clé API)
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // Endpoints par module
  ENDPOINTS: {
    // ========================================
    // AUTHENTIFICATION
    // ========================================
    AUTH: {
      // Route publique SANS préfixe
      CREATE_ADMIN_PUBLIC: `${API_BASE_URL}/create-admin-public`,
      
      // Autres routes AVEC préfixe
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
    
    // ========================================
    // UTILISATEURS
    // ========================================
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
    
    // ========================================
    // TONTINES
    // ========================================
    TONTINES: {
      LIST: '/tontines',
      CREATE: '/tontines',
      DETAILS: (tontineId) => `/tontines/${tontineId}`,
      DETAILS_FOR_MEMBER: (tontineId) => `/tontines/${tontineId}/details`, 
      MY_TONTINES: '/tontines/me/tontines',
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
    
    // ========================================
    // TRANSACTIONS
    // ========================================
    TRANSACTIONS: {
      LIST: '/transactions',
      CREATE: '/transactions',
      MY_TRANSACTIONS: '/transactions/me',
      DETAILS: (transactionId) => `/transactions/${transactionId}`,
      VALIDATE: (transactionId) => `/transactions/${transactionId}/validate`,
      REJECT: (transactionId) => `/transactions/${transactionId}/reject`,
      WEBHOOK_WAVE: '/transactions/webhook/wave',
    },
    
    // ========================================
    // TIRAGES
    // ========================================
    TIRAGES: {
      LIST_BY_TONTINE: (tontineId) => `/tirages/tontine/${tontineId}`,
      NOTIFY_MEMBERS: (tontineId) => `/tirages/tontine/${tontineId}/notify`,
      AUTOMATIQUE: (tontineId) => `/tirages/tontine/${tontineId}/automatique`,
      MANUEL: (tontineId) => `/tirages/tontine/${tontineId}/manuel`,
      ANNULER: (tirageId) => `/tirages/${tirageId}/annuler`,
      DETAILS: (tirageId) => `/tirages/${tirageId}`,
      AUTOMATIQUE_TEST: (tontineId) => `/tirages/tontine/${tontineId}/automatique-test`,
      MES_GAINS: '/tirages/me/gains',
    },
    
    // ========================================
    // DASHBOARD
    // ========================================
    DASHBOARD: {
      ADMIN: '/dashboard/admin',
      TRESORIER: '/dashboard/tresorier',
      MEMBRE: '/dashboard/membre',
      STATISTIQUES: '/dashboard/statistiques',
    },
    
    // ========================================
    // VALIDATION
    // ========================================
    VALIDATION: {
      CREATE_REQUEST: '/validations/request',
      CONFIRM_TRESORIER: (requestId) => `/validations/confirm/tresorier/${requestId}`,
      REJECT: (requestId) => `/validations/reject/${requestId}`,
      PENDING: '/validations/pending',
      MY_REQUESTS: '/validations/my-requests',
      DETAILS: (requestId) => `/validations/${requestId}`,
      RESEND_OTP: (requestId) => `/validations/resend-otp/${requestId}`,
    },

    // ========================================
    // NOTIFICATIONS
    // ========================================
    NOTIFICATIONS: {
      LIST: '/notifications',
      UNREAD_COUNT: '/notifications/unread-count',
      MARK_AS_READ: (notificationId) => `/notifications/${notificationId}/read`,
      DELETE: (notificationId) => `/notifications/${notificationId}`,
      TAKE_ACTION: (notificationId) => `/notifications/${notificationId}/action`,
    },
  },
  
  // Codes d'erreur personnalisés
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
  
  // Messages d'erreur
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Erreur de connexion. Verifiez votre internet.',
    TIMEOUT: 'La requete a pris trop de temps. Reessayez.',
    UNAUTHORIZED: 'Session expiree. Veuillez vous reconnecter.',
    FORBIDDEN: 'Vous n\'avez pas les permissions necessaires.',
    NOT_FOUND: 'Ressource introuvable.',
    VALIDATION_ERROR: 'Donnees invalides.',
    SERVER_ERROR: 'Erreur serveur. Reessayez plus tard.',
    UNKNOWN_ERROR: 'Une erreur est survenue.',
  },
};

// ========================================
// LOG DE DEBUG
// ========================================
if (__DEV__) {
  console.log('API CONFIG LOADED:');
  console.log('  - BASE_URL:', API_CONFIG.BASE_URL);
  console.log('  - FULL_URL:', API_CONFIG.FULL_URL);
  console.log('  - API_KEY: Geree sur le serveur (securise)');
}

export default API_CONFIG;