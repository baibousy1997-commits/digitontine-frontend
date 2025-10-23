import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Importation des écrans et des navigateurs
import MainTabNavigator from './MainTabNavigator';
import LoginScreen from '../screens/Auth/LoginScreen'; 
import ChooseTontineActionScreen from '../screens/Tontine/ChooseTontineActionScreen';
import CreateTontineScreen from '../screens/Tontine/CreateTontineScreen';
import AddMembersScreen from '../screens/Tontine/AddMembersScreen'; 
import ProfileScreen from '../screens/Profile/ProfileScreen';
import AccountScreen from '../screens/Home/AccountScreen';
import SettingsScreen from '../screens/Home/SettingsScreen';
import ChangePasswordScreen from '../screens/Home/ChangePasswordScreen';
import CreateUsersScreen from '../screens/Users/CreateUsersScreen';


const Stack = createStackNavigator();

/**
 * AppNavigator gère la pile de navigation globale.
 * Il permet de passer de l'écran de connexion/inscription ('Auth')
 * à la navigation principale à onglets ('Main') après une connexion réussie.
 */
const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Auth"
      screenOptions={{ headerShown: false }}
    >
      {/* Écran de Connexion (Auth) */}
      <Stack.Screen name="Auth" component={LoginScreen} />
      
      {/* Navigation principale */}
      <Stack.Screen name="Main" component={MainTabNavigator} />

      {/* Écrans Tontine */}
      <Stack.Screen name="ChooseTontineAction" component={ChooseTontineActionScreen} />
      <Stack.Screen name="CreateTontine" component={CreateTontineScreen} />
      <Stack.Screen name="AddMembers" component={AddMembersScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Account" component={AccountScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen
        name="CreateUser"
        component={CreateUsersScreen}
        options={{ title: 'Créer un utilisateur', headerShown: false }}
      />


    </Stack.Navigator>
  );
};

export default AppNavigator;
