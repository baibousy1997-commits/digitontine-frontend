// src/hooks/useAuth.js
/**
 * Hook personnalisé pour l'authentification
 * Utilise le AuthContext et les services
 */

import { useState } from 'react';
import authService from '../services/auth/authService';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Connexion étape 1 : Envoi identifiants
   */
  const loginStep1 = async (identifier, motDePasse) => {
    setLoading(true);
    setError(null);

    try {
      const result = await authService.login(identifier, motDePasse);
      
      if (result.success) {
        return {
          success: true,
          requiresOTP: result.requiresOTP,
          email: result.email,
          message: result.message,
        };
      } else {
        setError(result.error?.message || 'Erreur de connexion');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = err.message || 'Erreur inattendue';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Connexion étape 2 : Vérification OTP
   */
  const loginStep2 = async (email, code) => {
    setLoading(true);
    setError(null);

    try {
      const result = await authService.verifyLoginOTP(email, code);
      
      if (result.success) {
        return {
          success: true,
          user: result.user,
          requiresPasswordChange: result.requiresPasswordChange,
        };
      } else {
        setError(result.error?.message || 'Code OTP invalide');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = err.message || 'Erreur inattendue';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mot de passe oublié
   */
  const forgotPassword = async (email) => {
    setLoading(true);
    setError(null);

    try {
      const result = await authService.forgotPassword(email);
      
      if (result.success) {
        return { success: true, message: 'Code envoyé par email' };
      } else {
        setError(result.error?.message || 'Erreur');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = err.message || 'Erreur inattendue';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Réinitialiser mot de passe
   */
  const resetPassword = async (email, code, nouveauMotDePasse) => {
    setLoading(true);
    setError(null);

    try {
      const result = await authService.resetPassword(email, code, nouveauMotDePasse);
      
      if (result.success) {
        return { success: true, message: 'Mot de passe réinitialisé' };
      } else {
        setError(result.error?.message || 'Erreur');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = err.message || 'Erreur inattendue';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Changement de mot de passe première connexion
   */
  const firstPasswordChange = async (ancienMotDePasse, nouveauMotDePasse) => {
    setLoading(true);
    setError(null);

    try {
      const result = await authService.firstPasswordChange(ancienMotDePasse, nouveauMotDePasse);
      
      if (result.success) {
        return { success: true, message: 'Email de confirmation envoyé' };
      } else {
        setError(result.error?.message || 'Erreur');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = err.message || 'Erreur inattendue';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Changement de mot de passe
   */
  const changePassword = async (ancienMotDePasse, nouveauMotDePasse) => {
    setLoading(true);
    setError(null);

    try {
      const result = await authService.changePassword(ancienMotDePasse, nouveauMotDePasse);
      
      if (result.success) {
        return { success: true, message: 'Email de confirmation envoyé' };
      } else {
        setError(result.error?.message || 'Erreur');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = err.message || 'Erreur inattendue';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Déconnexion
   */
  const logout = async () => {
    setLoading(true);
    setError(null);

    try {
      await authService.logout();
      return { success: true };
    } catch (err) {
      const errorMsg = err.message || 'Erreur inattendue';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtenir mon profil
   */
  const getProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await authService.getMe();
      
      if (result.success) {
        return { success: true, user: result.data?.data?.user };
      } else {
        setError(result.error?.message || 'Erreur');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = err.message || 'Erreur inattendue';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    loginStep1,
    loginStep2,
    forgotPassword,
    resetPassword,
    firstPasswordChange,
    changePassword,
    logout,
    getProfile,
  };
};

export default useAuth;