import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Importation des écrans et des navigateurs
import MainTabNavigator from './MainTabNavigator';
import LoginScreen from '../screens/Auth/LoginScreen'; 

const Stack = createStackNavigator();

/**
 * AppNavigator gère la pile de navigation globale.
 * Il permet de passer de l'écran de connexion/inscription ('Auth')
 * à la navigation principale à onglets ('Main') après une connexion réussie.
 */
const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Auth" // Commence par l'écran d'authentification
      screenOptions={{ headerShown: false }} // Cache l'en-tête pour tous les écrans
    >
      {/* Écran de Connexion (Auth) */}
      <Stack.Screen name="Auth" component={LoginScreen} />
      
      {/* Navigation Principale (Main) après connexion réussie */}
      <Stack.Screen name="Main" component={MainTabNavigator} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
