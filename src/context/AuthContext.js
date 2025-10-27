// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import PropTypes from 'prop-types';
import tokenManager from '../utils/tokenManager';
import authService from '../services/auth/authService';

const AuthContext = createContext({});

// Importer Text pour placeholder
import { Text } from 'react-native';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);

  useEffect(() => {
    checkAuth();
    
    const authEvents = require('../utils/authEvents').default;
    authEvents.on('session_expired', handleSessionExpired);
    
    return () => {
      authEvents.off('session_expired', handleSessionExpired);
    };
  }, []);

/**
 * Verifier si l'utilisateur est authentifie
 */
const checkAuth = async () => {
  try {
    const authenticated = await tokenManager.isAuthenticated();
    
    if (!authenticated) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    const storedUser = await tokenManager.getUser();
    
    if (!storedUser) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    // IMPORTANT: Definir l'utilisateur d'abord
    setUser(storedUser);
    
    // Verifier PLUSIEURS conditions pour isFirstLogin
    console.log('=== CHECK AUTH - User Data ===');
    console.log('storedUser.isFirstLogin:', storedUser.isFirstLogin);
    console.log('storedUser.requiresPasswordChange:', storedUser.requiresPasswordChange);
    
    // DETERMINER SI CHANGEMENT DE MDP REQUIS AVANT TOUT
    const needsPasswordChange = 
      storedUser.isFirstLogin === true || 
      storedUser.requiresPasswordChange === true;
    
    if (needsPasswordChange) {
      console.log('>>> Changement de mot de passe REQUIS');
      setRequiresPasswordChange(true);
      setIsAuthenticated(true);
      setLoading(false); // IMPORTANT: Arreter le loading ICI
      return; // SORTIR SANS VERIFIER LE TOKEN
    }
    
    // Si pas besoin de changer le MDP, on continue normalement
    setRequiresPasswordChange(false);
    setIsAuthenticated(true);
    
    // Verifier le token aupres du backend (optionnel, seulement si pas de changement requis)
    try {
      const verifyResult = await authService.verifyToken();
      
      if (!verifyResult.success) {
        if (verifyResult.error?.isNetworkError) {
          console.warn('Impossible de verifier le token (probleme reseau), mais on garde la session locale');
        } else {
          console.log('Token invalide, deconnexion automatique');
          await handleSilentLogout();
        }
      } else {
        // Mettre a jour les donnees utilisateur depuis le serveur
        if (verifyResult.data?.data?.user) {
          const serverUser = verifyResult.data.data.user;
          await tokenManager.saveUser(serverUser);
          setUser(serverUser);
          
          // RE-VERIFIER si le serveur dit qu'il faut changer le MDP
          const serverNeedsPasswordChange = 
            serverUser.isFirstLogin === true || 
            serverUser.requiresPasswordChange === true;
          
          if (serverNeedsPasswordChange) {
            console.log('>>> Changement de mot de passe REQUIS (from server)');
            setRequiresPasswordChange(true);
          }
        }
      }
    } catch (error) {
      console.warn('Erreur verification token, mais on reste connecte avec donnees locales:', error);
    }
    
  } catch (error) {
    console.error('Erreur checkAuth:', error);
    setIsAuthenticated(false);
  } finally {
    setLoading(false);
  }
};

  /**
   * Deconnexion silencieuse (sans message)
   */
  const handleSilentLogout = async () => {
    try {
      await tokenManager.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
      setRequiresPasswordChange(false);
    } catch (error) {
      console.error('Erreur silent logout:', error);
    }
  };

  /**
   * Connexion - Etape 1 : Envoi des identifiants
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
   * Connexion - Etape 2 : Verification OTP
   */
  const verifyOTP = async (email, otpCode) => {
    try {
      const result = await authService.verifyLoginOTP(email, otpCode);
      
      if (result.success) {
        console.log('=== VERIFY OTP SUCCESS ===');
        console.log('result.user:', result.user);
        console.log('result.user.isFirstLogin:', result.user?.isFirstLogin);
        console.log('result.requiresPasswordChange:', result.requiresPasswordChange);
        
        setUser(result.user);
        
        // IMPORTANT: Verifier PLUSIEURS conditions
        const needsPasswordChange = 
          result.user?.isFirstLogin === true || 
          result.requiresPasswordChange === true ||
          result.user?.requiresPasswordChange === true;
        
        console.log('>>> needsPasswordChange:', needsPasswordChange);
        
        if (needsPasswordChange) {
          setRequiresPasswordChange(true);
          // Attendre un peu pour que le state soit bien mis a jour
          await new Promise(resolve => setTimeout(resolve, 100));
        } else {
          setRequiresPasswordChange(false);
        }
        
        // Definir isAuthenticated EN DERNIER
        setIsAuthenticated(true);
      }
      
      return result;
    } catch (error) {
      console.error('Erreur verifyOTP:', error);
      return { success: false, error };
    }
  };

  /**
   *  Marquer le changement de mot de passe comme complete
   * FIX: Nettoyer completement isFirstLogin du storage
   */
  const markPasswordChangeComplete = async () => {
    console.log('=== MARK PASSWORD CHANGE COMPLETE ===');
    
    try {
      // 1. Mettre a jour le state local
      setRequiresPasswordChange(false);
      
      if (user) {
        // 2. Creer un utilisateur propre SANS isFirstLogin ni requiresPasswordChange
        const cleanUser = { 
          ...user, 
          isFirstLogin: false,           //  Forcer a false
          requiresPasswordChange: false   //  Forcer a false
        };
        
        console.log('>>> Sauvegarde utilisateur nettoye:', cleanUser);
        
        // 3. Sauvegarder dans AsyncStorage
        await tokenManager.saveUser(cleanUser);
        
        // 4. Mettre a jour le state
        setUser(cleanUser);
        
        console.log(' Changement de mot de passe complete et sauvegarde');
      }
    } catch (error) {
      console.error(' Erreur markPasswordChangeComplete:', error);
    }
  };

  /**
   * Deconnexion (avec message optionnel)
   */
  const logout = async (showMessage = false) => {
    try {
      await authService.logout();
      await tokenManager.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
      setRequiresPasswordChange(false);
      
      if (showMessage) {
        Alert.alert('Deconnexion', 'Vous avez ete deconnecte avec succes.');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Erreur logout:', error);
      
      await tokenManager.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
      setRequiresPasswordChange(false);
      
      return { success: true };
    }
  };

  /**
   * Gerer l'expiration de session
   */
  const handleSessionExpired = async () => {
    console.log('Session expiree detectee');
    
    await handleSilentLogout();
    
    Alert.alert(
      'Session expiree',
      'Votre session a expire. Veuillez vous reconnecter.',
      [{ text: 'OK' }]
    );
  };

  /**
   * Rafraichir les informations utilisateur
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
   * Mettre a jour l'utilisateur dans le contexte
   */
  const updateUser = (newUserData) => {
    setUser({ ...user, ...newUserData });
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    requiresPasswordChange,
    loginStep1,
    verifyOTP,
    logout,
    checkAuth,
    refreshUser,
    updateUser,
    handleSessionExpired,
    markPasswordChangeComplete,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Hook pour utiliser le contexte
 */
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuthContext doit etre utilise dans un AuthProvider');
  }
  
  return context;
};

export default AuthContext;