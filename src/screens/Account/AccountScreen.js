// src/screens/Account/AccountScreen.js
import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import { useAuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import authService from '../../services/auth/authService';
import Colors from '../../constants/colors';
import AccountStyles from '../../styles/AccountScreenStyles';

const AccountScreen = ({ navigation }) => {
  const { user, logout } = useAuthContext();
  const { theme } = useTheme();
  const [loggingOut, setLoggingOut] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  /**
   * Charger le profil utilisateur
   */
  const loadUserProfile = async () => {
    try {
      const result = await authService.getMe();
      if (result.success && result.data) {
        setProfileData(result.data);
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtenir les initiales de l'utilisateur
   */
  const getInitials = () => {
    const currentUser = profileData || user;
    if (!currentUser) return '??';
    
    const firstInitial = currentUser.prenom?.charAt(0).toUpperCase() || '';
    const lastInitial = currentUser.nom?.charAt(0).toUpperCase() || '';
    return `${firstInitial}${lastInitial}`;
  };

  /**
   * Gerer la deconnexion
   */
  const handleLogout = async () => {
    Alert.alert(
      'Deconnexion',
      'Voulez-vous vraiment vous deconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Deconnecter',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            try {
              const result = await logout();
              
              if (result.success) {
                console.log('Deconnexion reussie');
              } else {
                Alert.alert('Erreur', 'Impossible de se deconnecter. Reessayez.');
              }
            } catch (error) {
              console.error('Erreur deconnexion:', error);
              Alert.alert('Erreur', 'Une erreur est survenue.');
            } finally {
              setLoggingOut(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const currentUser = profileData || user;
  const userName = currentUser 
    ? `${currentUser.prenom} ${currentUser.nom}` 
    : 'Utilisateur';
  const userRole = currentUser?.role || 'Membre';
  const hasPhoto = currentUser?.photoProfil;

  if (loading) {
    return (
      <SafeAreaView style={[AccountStyles.container, { backgroundColor: theme.background }]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primaryDark} />
          <Text style={{ color: theme.text, marginTop: 10 }}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[AccountStyles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.headerBackground} />

      {/* Header */}
      <View style={[AccountStyles.header, { backgroundColor: theme.headerBackground }]}>
        <TouchableOpacity 
          style={AccountStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textLight} />
          <Text style={AccountStyles.backText}>Retour</Text>
        </TouchableOpacity>
        
      </View>

      {/* Profile Section */}
      <View style={[AccountStyles.profileSection, { backgroundColor: theme.headerBackground }]}>
        <View style={AccountStyles.avatarContainer}>
          {hasPhoto ? (
            <Image 
              source={{ uri: currentUser.photoProfil }} 
              style={AccountStyles.avatar} 
            />
          ) : (
            <View style={[AccountStyles.avatar, AccountStyles.avatarWithInitials]}>
              <Text style={AccountStyles.avatarInitials}>{getInitials()}</Text>
            </View>
          )}
        </View>
        <Text style={[AccountStyles.userName, { color: theme.text }]}>{userName}</Text>
        <Text style={[AccountStyles.userRole, { color: theme.textSecondary }]}>{userRole}</Text>
      </View>

      {/* Menu Items */}
      <View style={AccountStyles.menuContainer}>
        {/* Mon profil */}
        <TouchableOpacity
          style={[AccountStyles.menuItem, { backgroundColor: theme.surface }]}
          onPress={() => navigation.navigate('Profile')}
        >
          <View style={[AccountStyles.menuIconContainer, { backgroundColor: theme.inputBackground }]}>
            <Ionicons name="person-outline" size={24} color={Colors.primaryDark} />
          </View>
          <Text style={[AccountStyles.menuText, { color: theme.text }]}>Mon profil</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
        </TouchableOpacity>

        {/* Mes tontines */}
        <TouchableOpacity 
          style={[AccountStyles.menuItem, { backgroundColor: theme.surface }]}
          onPress={() => navigation.navigate('MyTontines')}
        >
          <View style={[AccountStyles.menuIconContainer, { backgroundColor: theme.inputBackground }]}>
            <Ionicons name="refresh-outline" size={24} color={Colors.primaryDark} />
          </View>
          <Text style={[AccountStyles.menuText, { color: theme.text }]}>Mes tontines</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
        </TouchableOpacity>

        {/* Parametres */}
        <TouchableOpacity 
          style={[AccountStyles.menuItem, { backgroundColor: theme.surface }]}
          onPress={() => navigation.navigate('Settings')}
        >
          <View style={[AccountStyles.menuIconContainer, { backgroundColor: theme.inputBackground }]}>
            <Ionicons name="settings-outline" size={24} color={Colors.primaryDark} />
          </View>
          <Text style={[AccountStyles.menuText, { color: theme.text }]}>Parametres</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
        </TouchableOpacity>

       
      </View>
    </SafeAreaView>
  );
};

AccountScreen.propTypes = {
  navigation: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

export default AccountScreen;