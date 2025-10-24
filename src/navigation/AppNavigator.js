// src/navigation/AppNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';

// Context d'authentification
import { useAuthContext } from '../context/AuthContext';

// Navigateurs
import MainTabNavigator from './MainTabNavigator';

// Écrans d'authentification
import LoginScreen from '../screens/Auth/LoginScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import RegisterAdminScreen from '../screens/Auth/RegisterAdminScreen';
import FirstPasswordChangeScreen from '../screens/Auth/FirstPasswordChangeScreen';

// Écrans Tontine
import ChooseTontineActionScreen from '../screens/Tontine/ChooseTontineActionScreen';
import CreateTontineScreen from '../screens/Tontine/CreateTontineScreen';
import AddMembersScreen from '../screens/Tontine/AddMembersScreen';

// Écrans Profil et Paramètres
import ProfileScreen from '../screens/Profile/ProfileScreen';
import AccountScreen from '../screens/Home/AccountScreen';
import SettingsScreen from '../screens/Home/SettingsScreen';
import ChangePasswordScreen from '../screens/Home/ChangePasswordScreen';

// Écrans Utilisateurs
import CreateUsersScreen from '../screens/Users/CreateUsersScreen';

const Stack = createStackNavigator();

/**
 * AppNavigator avec gestion automatique de l'authentification
 * Navigation dynamique basée sur isAuthenticated et user.isFirstLogin
 */
const AppNavigator = () => {
  const { isAuthenticated, loading, user } = useAuthContext();

  // Écran de chargement pendant la vérification de l'authentification
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#2b6cb0" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        // ========================================
        // ROUTES D'AUTHENTIFICATION (Publiques)
        // ========================================
        <>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ title: 'Connexion' }}
          />
          <Stack.Screen 
            name="ForgotPassword" 
            component={ForgotPasswordScreen}
            options={{ title: 'Mot de passe oublie' }}
          />
          <Stack.Screen 
            name="RegisterAdmin" 
            component={RegisterAdminScreen}
            options={{ title: 'Creer un Admin' }}
          />
        </>
      ) : user?.isFirstLogin ? (
        // ========================================
        // CHANGEMENT DE MOT DE PASSE OBLIGATOIRE
        // ========================================
        <Stack.Screen 
          name="FirstPasswordChange" 
          component={FirstPasswordChangeScreen}
          options={{ 
            title: 'Changement obligatoire',
            gestureEnabled: false,
          }}
        />
      ) : (
        // ========================================
        // ROUTES PROTÉGÉES (Authentifié)
        // ========================================
        <>
          {/* Navigation principale (Tabs avec HomeScreen) */}
          <Stack.Screen name="Main" component={MainTabNavigator} />

          {/* Écrans Tontine */}
          <Stack.Screen 
            name="ChooseTontineAction" 
            component={ChooseTontineActionScreen}
            options={{ title: 'Action Tontine' }}
          />
          <Stack.Screen 
            name="CreateTontine" 
            component={CreateTontineScreen}
            options={{ title: 'Creer une tontine' }}
          />
          <Stack.Screen 
            name="AddMembers" 
            component={AddMembersScreen}
            options={{ title: 'Ajouter des membres' }}
          />

          {/* Écrans Profil */}
          <Stack.Screen 
            name="Profile" 
            component={ProfileScreen}
            options={{ title: 'Profil' }}
          />
          <Stack.Screen 
            name="Account" 
            component={AccountScreen}
            options={{ title: 'Mon compte' }}
          />
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{ title: 'Parametres' }}
          />
          <Stack.Screen 
            name="ChangePassword" 
            component={ChangePasswordScreen}
            options={{ title: 'Changer le mot de passe' }}
          />

          {/* Écrans Utilisateurs (Admin uniquement) */}
          <Stack.Screen
            name="CreateUser"
            component={CreateUsersScreen}
            options={{ title: 'Creer un utilisateur' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;