// src/context/AuthContext.js
/**
 * Context d'authentification mis à jour
 * Intégré avec les nouveaux services
 */

import React, { createContext, useState, useEffect, useContext } from 'react';
import tokenManager from '../utils/tokenManager';
import authService from '../services/auth/authService';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Vérifier si l'utilisateur est authentifié
   */
  const checkAuth = async () => {
    try {
      const authenticated = await tokenManager.isAuthenticated();
      
      if (authenticated) {
        // Récupérer les infos utilisateur depuis le storage
        const storedUser = await tokenManager.getUser();
        
        if (storedUser) {
          setUser(storedUser);
          setIsAuthenticated(true);
          
          // Optionnel : Vérifier que le token est encore valide
          const verifyResult = await authService.verifyToken();
          if (!verifyResult.success) {
            // Token invalide, déconnecter
            await logout();
          }
        } else {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Erreur checkAuth:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Connexion - Étape 1 : Envoi des identifiants
   */
  const loginStep1 = async (identifier, motDePasse) => {
    try {
      const result = await authService.login(identifier, motDePasse);
      return result;
    } catch (error) {
      console.error('Erreur loginStep1:', error);
      return { success: false, error };
    }
  };

  /**
   * Connexion - Étape 2 : Vérification OTP
   */
  const verifyOTP = async (identifier, otpCode) => {
    try {
      const result = await authService.verifyLoginOTP(identifier, otpCode);
      
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
      }
      
      return result;
    } catch (error) {
      console.error('Erreur verifyOTP:', error);
      return { success: false, error };
    }
  };

  /**
   * Déconnexion
   */
  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (error) {
      console.error('Erreur logout:', error);
      return { success: false, error };
    }
  };

  /**
   * Rafraîchir les informations utilisateur
   */
  const refreshUser = async () => {
    try {
      const result = await authService.getMe();
      
      if (result.success) {
        const updatedUser = result.data?.data?.user;
        await tokenManager.saveUser(updatedUser);
        setUser(updatedUser);
        return { success: true, user: updatedUser };
      }
      
      return { success: false };
    } catch (error) {
      console.error('Erreur refreshUser:', error);
      return { success: false, error };
    }
  };

  /**
   * Mettre à jour l'utilisateur dans le contexte
   */
  const updateUser = (newUserData) => {
    setUser({ ...user, ...newUserData });
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    loginStep1,
    verifyOTP,
    logout,
    checkAuth,
    refreshUser,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook pour utiliser le contexte
 */
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuthContext doit être utilisé dans un AuthProvider');
  }
  
  return context;
};

export default AuthContext;