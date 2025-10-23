import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Switch,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import Colors from '../../constants/colors';
import SettingsStyles from '../../styles/SettingsScreenStyles';

const SettingsScreen = ({ navigation }) => {
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [themeColors, setThemeColors] = useState(Colors);

  // Basculer entre clair et sombre
  useEffect(() => {
    if (darkModeEnabled) {
      setThemeColors({
        ...Colors,
        background: '#121212',
        textDark: '#FFFFFF',
        textLight: '#1E1E1E',
        inputBackground: '#1E1E1E',
        placeholder: '#AAAAAA',
      });
    } else {
      setThemeColors(Colors);
    }
  }, [darkModeEnabled]);

  return (
    <SafeAreaView
      style={[
        SettingsStyles.container,
        { backgroundColor: themeColors.background || '#F5F5F5' },
      ]}
    >
      <StatusBar
        barStyle={darkModeEnabled ? 'light-content' : 'dark-content'}
        backgroundColor={themeColors.background}
      />
      
      {/* Header */}
      <View style={SettingsStyles.header}>
        <TouchableOpacity 
          style={SettingsStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={themeColors.textDark} />
          <Text style={[SettingsStyles.backText, { color: themeColors.textDark }]}>Retour</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={SettingsStyles.menuButton}>
          <Ionicons name="menu" size={28} color={themeColors.textDark} />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <View style={SettingsStyles.titleContainer}>
        <Text style={[SettingsStyles.title, { color: themeColors.textDark }]}>
          Paramètres
        </Text>
      </View>

      {/* Settings Items */}
      <View style={SettingsStyles.settingsContainer}>

        {/* Mode sombre / clair */}
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={styles.iconContainer}>
              <Ionicons
                name={darkModeEnabled ? 'moon' : 'sunny-outline'}
                size={24}
                color={themeColors.textDark}
              />
            </View>
            <Text style={[styles.settingText, { color: themeColors.textDark }]}>
              Mode sombre
            </Text>
          </View>
          <Switch
            trackColor={{ false: '#D1D1D1', true: Colors.primary }}
            thumbColor={darkModeEnabled ? Colors.textLight : '#F4F3F4'}
            ios_backgroundColor="#D1D1D1"
            onValueChange={setDarkModeEnabled}
            value={darkModeEnabled}
          />
        </View>

        {/* Changer mot de passe */}
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => navigation.navigate('ChangePassword')}
        >
          <View style={styles.settingLeft}>
            <View style={styles.iconContainer}>
              <Ionicons name="lock-closed-outline" size={24} color={themeColors.textDark} />
            </View>
            <Text style={[styles.settingText, { color: themeColors.textDark }]}>
              Changer mon mot de passe
            </Text>
          </View>
        </TouchableOpacity>

        {/* Supprimer compte */}
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={styles.iconContainer}>
              <Ionicons name="trash-outline" size={24} color="#E74C3C" />
            </View>
            <Text style={[styles.settingText, { color: '#E74C3C' }]}>
              Supprimer mon compte
            </Text>
          </View>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

SettingsScreen.propTypes = {
  navigation: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
  }).isRequired,
};

export default SettingsScreen;

// === Styles additionnels spécifiques au composant ===
const styles = StyleSheet.create({
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#DDD',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
