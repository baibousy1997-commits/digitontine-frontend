// src/screens/Settings/SettingsScreen.js
import React, { useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Switch,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import { useAuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Colors from '../../constants/colors';
import SettingsStyles from '../../styles/SettingsScreenStyles';

const SettingsScreen = ({ navigation }) => {
  const { logout } = useAuthContext();
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [loggingOut, setLoggingOut] = useState(false);

  /**
   * Gerer la deconnexion
   */
  const handleLogout = () => {
    Alert.alert(
      'Deconnexion',
      'Etes-vous sur de vouloir vous deconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Deconnexion',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            await logout();
            // Le composant sera demonte automatiquement apres la deconnexion
            // via AppNavigator qui detecte isAuthenticated = false
          },
        },
      ]
    );
  };

  /**
   * Supprimer le compte
   */
  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer mon compte',
      'ATTENTION: Cette action est irreversible. Toutes vos donnees seront definitivement supprimees.\n\nEtes-vous sur de vouloir continuer ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Fonctionnalite en developpement',
              'La suppression de compte necessite une validation administrative. Contactez votre administrateur.'
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[SettingsStyles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />
      
      {/* Header */}
      <View style={[SettingsStyles.header, { backgroundColor: theme.background }]}>
        <TouchableOpacity 
          style={SettingsStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
          <Text style={[SettingsStyles.backText, { color: theme.text }]}>Retour</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={SettingsStyles.menuButton}>
          <Ionicons name="menu" size={28} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <View style={SettingsStyles.titleContainer}>
        <Text style={[SettingsStyles.title, { color: theme.text }]}>
          Parametres
        </Text>
      </View>

      {/* Settings Items */}
      <ScrollView 
        style={SettingsStyles.settingsContainer}
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >

        {/* Mode sombre / clair */}
        <View style={[styles.settingItem, { backgroundColor: theme.surface }]}>
          <View style={styles.settingLeft}>
            <View style={[styles.iconContainer, { backgroundColor: theme.inputBackground }]}>
              <Ionicons
                name={isDarkMode ? 'moon' : 'sunny-outline'}
                size={24}
                color={theme.text}
              />
            </View>
            <Text style={[styles.settingText, { color: theme.text }]}>
              Mode sombre
            </Text>
          </View>
          <Switch
            trackColor={{ false: '#D1D1D1', true: Colors.primaryDark }}
            thumbColor={isDarkMode ? Colors.accentYellow : '#F4F3F4'}
            ios_backgroundColor="#D1D1D1"
            onValueChange={toggleTheme}
            value={isDarkMode}
          />
        </View>

        {/* Notifications */}
        <TouchableOpacity
          style={[styles.settingItem, { backgroundColor: theme.surface }]}
          onPress={() => navigation.navigate('Notifications')}
        >
          <View style={styles.settingLeft}>
            <View style={[styles.iconContainer, { backgroundColor: theme.inputBackground }]}>
              <Ionicons name="notifications-outline" size={24} color={theme.text} />
            </View>
            <Text style={[styles.settingText, { color: theme.text }]}>
              Notifications
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.placeholder} />
        </TouchableOpacity>

     


        {/* Deconnexion */}
        <TouchableOpacity
          style={[styles.settingItem, { backgroundColor: theme.surface }]}
          onPress={handleLogout}
          disabled={loggingOut}
        >
          <View style={styles.settingLeft}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(231, 76, 60, 0.1)' }]}>
              <Ionicons name="log-out-outline" size={24} color="#E74C3C" />
            </View>
            <Text style={[styles.settingText, { color: '#E74C3C' }]}>
              Se deconnecter
            </Text>
          </View>
          {loggingOut && <ActivityIndicator size="small" color="#E74C3C" />}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

SettingsScreen.propTypes = {
  navigation: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

export default SettingsScreen;

// === Styles additionnels specifiques au composant ===
const styles = StyleSheet.create({
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  settingValue: {
    fontSize: 14,
    marginRight: 5,
  },
});