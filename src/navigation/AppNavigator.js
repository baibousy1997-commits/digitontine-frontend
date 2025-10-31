// src/navigation/AppNavigator.js
import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuthContext } from '../context/AuthContext';
import { ActivityIndicator, View, Text } from 'react-native';

//  IMPORTS VALIDATION - PLUS DE DOUBLON
import CreateValidationRequestScreen from '../screens/Validation/CreateValidationRequestScreen';
import PendingValidationsScreen from '../screens/Validation/PendingValidationsScreen';
import MyValidationRequestsScreen from '../screens/Validation/MyValidationRequestsScreen';

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
import MyTontinesScreen from '../screens/Tontine/MyTontinesScreen';
import ManageTontinesScreen from '../screens/Tontine/ManageTontinesScreen';
import TontineDetailsScreen from '../screens/Tontine/TontineDetailsScreen';

// Transaction Screens
import MyTransactionsScreen from '../screens/Transaction/MyTransactionsScreen';
import TransactionsValidationScreen from '../screens/Transaction/TransactionsValidationScreen';
import CreateTransactionScreen from '../screens/Transaction/CreateTransactionScreen';
import TransactionDetailsScreen from '../screens/Transaction/TransactionDetailsScreen';

// Notification Screen
import NotificationsScreen from '../screens/Notifications/NotificationsScreen';

const Stack = createStackNavigator();

const WalletPlaceholder = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Wallet - A venir</Text>
  </View>
);

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
    <Stack.Screen name="MyTontines" component={MyTontinesScreen} />
    <Stack.Screen name="ManageTontines" component={ManageTontinesScreen} />
    <Stack.Screen name="TontineDetails" component={TontineDetailsScreen} />
    <Stack.Screen name="MyTransactions" component={MyTransactionsScreen} />
    <Stack.Screen name="TransactionsValidation" component={TransactionsValidationScreen} />
    <Stack.Screen name="CreateTransaction" component={CreateTransactionScreen} />
    <Stack.Screen name="TransactionDetails" component={TransactionDetailsScreen} />
    
    {/*  VALIDATION SCREENS */}
    <Stack.Screen 
      name="CreateValidationRequest" 
      component={CreateValidationRequestScreen} 
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="MyValidationRequests" 
      component={MyValidationRequestsScreen} 
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="PendingValidations" 
      component={PendingValidationsScreen} 
      options={{ headerShown: false }}
    />
    
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="Wallet" component={WalletPlaceholder} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { isAuthenticated, loading, requiresPasswordChange } = useAuthContext();

  useEffect(() => {
    console.log('AppNavigator State:', { isAuthenticated, requiresPasswordChange, loading });
  }, [isAuthenticated, requiresPasswordChange, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#004aad" />
      </View>
    );
  }

  if (isAuthenticated && requiresPasswordChange) {
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

  return isAuthenticated ? <MainStack /> : <AuthStack />;
};

export default AppNavigator;