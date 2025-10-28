import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import PropTypes from 'prop-types';

// Importation des écrans
import HomeScreen from '../screens/Home/HomeScreen';

const Tab = createBottomTabNavigator();

// Composant vide pour simuler les autres écrans (en dehors du composant principal)
const PlaceholderScreen = ({ name }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 24 }}>Écran {name}</Text>
  </View>
);

PlaceholderScreen.propTypes = {
  name: PropTypes.string.isRequired,
};

// Fonction de rendu des placeholders en dehors du composant
const makeScreenComponent = (name) => {
  const ScreenComponent = () => <PlaceholderScreen name={name} />;
  ScreenComponent.displayName = `${name}Screen`;
  return ScreenComponent;
};

const WalletScreenPlaceholder = makeScreenComponent('Wallet');
const NotificationsScreenPlaceholder = makeScreenComponent('Notifications');
const ContactScreenPlaceholder = makeScreenComponent('Contact');

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Accueil"
      screenOptions={{
        headerShown: false, // Cache l'en-tête de la navigation
        tabBarShowLabel: false,
        // IMPORTANT : Masque la barre d'onglets de React Navigation pour utiliser la barre personnalisée dans HomeScreen.js
        tabBarStyle: { display: 'none', height: 0 }, 
      }}
    >
     <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
      />
      <Tab.Screen 
        name="DashboardAdmin" 
        component={DashboardAdminScreen} 
      />
      <Tab.Screen 
        name="DashboardTresorier" 
        component={DashboardTresorierScreen} 
      />
      <Tab.Screen 
        name="DashboardMembre" 
        component={DashboardMembreScreen} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;