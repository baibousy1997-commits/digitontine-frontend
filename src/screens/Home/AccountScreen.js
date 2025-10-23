import React from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../../constants/colors';
import AccountStyles from '../../styles/AccountScreenStyles';

const AccountScreen = ({ navigation }) => {
  const userName = 'Adama Sy';

  // Fonction pour gérer la déconnexion
  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: async () => {
            try {
              // Supprime le token ou les données utilisateur
              await AsyncStorage.removeItem('userToken');

              // Réinitialise la pile de navigation vers l'écran Auth/Login
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            } catch (error) {
              console.log('Erreur lors de la déconnexion:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={AccountStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header */}
      <View style={AccountStyles.header}>
        <TouchableOpacity 
          style={AccountStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textLight} />
          <Text style={AccountStyles.backText}>Retour</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={AccountStyles.menuButton}>
          <Ionicons name="menu" size={28} color={Colors.textLight} />
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <View style={AccountStyles.profileSection}>
        <View style={AccountStyles.avatarContainer}>
          <View style={AccountStyles.avatar}>
            <Ionicons name="person-outline" size={60} color="#B0B0B0" />
          </View>
        </View>
        <Text style={AccountStyles.userName}>{userName}</Text>
      </View>

      {/* Menu Items */}
      <View style={AccountStyles.menuContainer}>
        {/* Mon profil */}
        <TouchableOpacity
          style={AccountStyles.menuItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <View style={AccountStyles.menuIconContainer}>
            <Ionicons name="person-outline" size={24} color={Colors.primaryDark} />
          </View>
          <Text style={AccountStyles.menuText}>Mon profil</Text>
        </TouchableOpacity>

        {/* Mes tontines */}
        <TouchableOpacity style={AccountStyles.menuItem}>
          <View style={AccountStyles.menuIconContainer}>
            <Ionicons name="refresh-outline" size={24} color={Colors.primaryDark} />
          </View>
          <Text style={AccountStyles.menuText}>Mes tontines</Text>
        </TouchableOpacity>

        {/* Mon Wallet */}
        <TouchableOpacity style={AccountStyles.menuItem}>
          <View style={AccountStyles.menuIconContainer}>
            <Ionicons name="wallet-outline" size={24} color={Colors.primaryDark} />
          </View>
          <Text style={AccountStyles.menuText}>Mon Wallet</Text>
        </TouchableOpacity>

        {/* Paramètres */}
        <TouchableOpacity 
          style={AccountStyles.menuItem}
          onPress={() => navigation.navigate('Settings')}
        >
          <View style={AccountStyles.menuIconContainer}>
            <Ionicons name="settings-outline" size={24} color={Colors.primaryDark} />
          </View>
          <Text style={AccountStyles.menuText}>Paramètres</Text>
        </TouchableOpacity>

        {/* Déconnexion */}
        <TouchableOpacity 
          style={AccountStyles.menuItem}
          onPress={handleLogout}
        >
          <View style={AccountStyles.menuIconContainer}>
            <Ionicons name="log-out-outline" size={24} color="#E74C3C" />
          </View>
          <Text style={[AccountStyles.menuText, { color: '#E74C3C' }]}>Déconnexion</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

AccountScreen.propTypes = {
  navigation: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
    reset: PropTypes.func.isRequired,
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

export default AccountScreen;
