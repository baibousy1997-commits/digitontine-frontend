import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import PropTypes from 'prop-types';

// Importation des écrans
import HomeScreen from '../screens/Home/HomeScreen';
import TransactionListScreen from '../screens/Transactions/TransactionListScreen';


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
      <Tab.Screen name="Accueil" component={HomeScreen} />
      <Tab.Screen name="Wallet" component={TransactionListScreen} />
      {/* L'onglet central "+" n'est pas un écran, il est géré par un bouton flottant dans HomeScreen */}
      <Tab.Screen name="Notifications" component={NotificationsScreenPlaceholder} />
      <Tab.Screen name="Contact" component={ContactScreenPlaceholder} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
