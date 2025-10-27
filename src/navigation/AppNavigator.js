// src/navigation/AppNavigator.js
import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuthContext } from '../context/AuthContext';
import { ActivityIndicator, View, Text } from 'react-native';

// Auth Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterAdminScreen from '../screens/Auth/RegisterAdminScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import FirstPasswordChangeScreen from '../screens/Auth/FirstPasswordChangeScreen';

// Main Screens
import HomeScreen from '../screens/Home/HomeScreen';
import DashboardAdminScreen from '../screens/Dashboard/DashboardAdminScreen';
import DashboardTresorierScreen from '../screens/Dashboard/DashboardTresorierScreen';
import DashboardMembreScreen from '../screens/Dashboard/DashboardMembreScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import AccountScreen from '../screens/Account/AccountScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import ChangePasswordScreen from '../screens/Settings/ChangePasswordScreen';
import CreateUsersScreen from '../screens/Users/CreateUsersScreen';

// Tontine Screens
import ChooseTontineActionScreen from '../screens/Tontine/ChooseTontineActionScreen';
import CreateTontineScreen from '../screens/Tontine/CreateTontineScreen';
import AddMembersScreen from '../screens/Tontine/AddMembersScreen';

const Stack = createStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="RegisterAdmin" component={RegisterAdminScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);

const MainStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Accueil" component={HomeScreen} />
    
    <Stack.Screen name="DashboardAdmin" component={DashboardAdminScreen} />
    <Stack.Screen name="DashboardTresorier" component={DashboardTresorierScreen} />
    <Stack.Screen name="DashboardMembre" component={DashboardMembreScreen} />
    
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="Account" component={AccountScreen} />
    
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    
    <Stack.Screen name="CreateUser" component={CreateUsersScreen} />
    
    <Stack.Screen name="ChooseTontineAction" component={ChooseTontineActionScreen} />
    <Stack.Screen name="CreateTontine" component={CreateTontineScreen} />
    <Stack.Screen name="AddMembers" component={AddMembersScreen} />
    
    <Stack.Screen 
      name="Wallet" 
      component={() => (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Wallet - A venir</Text>
        </View>
      )}
    />
    <Stack.Screen 
      name="Notifications" 
      component={() => (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Notifications - A venir</Text>
        </View>
      )}
    />
    <Stack.Screen 
      name="MyTontines" 
      component={() => (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Mes Tontines - A venir</Text>
        </View>
      )}
    />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { isAuthenticated, loading, requiresPasswordChange } = useAuthContext();

  // DEBUG: Logger les changements d'état
  useEffect(() => {
    console.log('===== AppNavigator State Change =====');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('requiresPasswordChange:', requiresPasswordChange);
    console.log('loading:', loading);
  }, [isAuthenticated, requiresPasswordChange, loading]);

  if (loading) {
    console.log('Affichage: Loading');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#004aad" />
      </View>
    );
  }

  if (isAuthenticated && requiresPasswordChange) {
    console.log('Affichage: FirstPasswordChange');
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen 
          name="FirstPasswordChange" 
          component={FirstPasswordChangeScreen}
          options={{ animationEnabled: false }}
        />
      </Stack.Navigator>
    );
  }

  console.log('Affichage:', isAuthenticated ? 'MainStack' : 'AuthStack');
  return isAuthenticated ? <MainStack /> : <AuthStack />;
};

export default AppNavigator;