// src/utils/tokenManager.js
/**
 * Gestionnaire de tokens JWT sécurisé
 * Utilise expo-secure-store pour un stockage chiffré
 */

import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'digitontine_access_token';
const REFRESH_TOKEN_KEY = 'digitontine_refresh_token';
const USER_KEY = 'digitontine_user';

const tokenManager = {
  /**
   * Sauvegarder le token d'accès
   */
  async saveAccessToken(token) {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      return true;
    } catch (error) {
      console.error('Erreur sauvegarde access token:', error);
      return false;
    }
  },

  /**
   * Récupérer le token d'accès
   */
  async getAccessToken() {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('Erreur récupération access token:', error);
      return null;
    }
  },

  /**
   * Sauvegarder le refresh token
   */
  async saveRefreshToken(token) {
    try {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
      return true;
    } catch (error) {
      console.error('Erreur sauvegarde refresh token:', error);
      return false;
    }
  },

  /**
   * Récupérer le refresh token
   */
  async getRefreshToken() {
    try {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Erreur récupération refresh token:', error);
      return null;
    }
  },

  /**
   * Sauvegarder les deux tokens en même temps
   */
  async saveTokens(accessToken, refreshToken) {
    try {
      await Promise.all([
        SecureStore.setItemAsync(TOKEN_KEY, accessToken),
        SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
      ]);
      return true;
    } catch (error) {
      console.error('Erreur sauvegarde tokens:', error);
      return false;
    }
  },

  /**
   * Sauvegarder les informations utilisateur
   */
  async saveUser(user) {
    try {
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
      return true;
    } catch (error) {
      console.error('Erreur sauvegarde user:', error);
      return false;
    }
  },

  /**
   * Récupérer les informations utilisateur
   */
  async getUser() {
    try {
      const userJson = await SecureStore.getItemAsync(USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Erreur récupération user:', error);
      return null;
    }
  },

  /**
   * Supprimer tous les tokens (déconnexion)
   */
  async clearTokens() {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(TOKEN_KEY),
        SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
        SecureStore.deleteItemAsync(USER_KEY),
      ]);
      return true;
    } catch (error) {
      console.error('Erreur suppression tokens:', error);
      return false;
    }
  },

  /**
   * Vérifier si l'utilisateur est connecté
   */
  async isAuthenticated() {
    const token = await this.getAccessToken();
    return !!token;
  },
};

export default tokenManager;