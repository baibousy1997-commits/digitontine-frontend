// src/context/ThemeContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PropTypes from 'prop-types';
import Colors from '../constants/colors';

const THEME_KEY = '@digitontine_theme';

// Définition des thèmes
const lightTheme = {
  ...Colors,
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#333333',
  textSecondary: '#666666',
  inputBackground: '#F5F5F5',
  placeholder: '#999999',
  border: '#E1E1E1',
  cardBackground: '#FFFFFF',
  headerBackground: Colors.primaryDark,
  bottomNavBackground: '#FFFFFF',
};

const darkTheme = {
  ...Colors,
  primaryDark: '#0066ff',
  primaryLight: '#3385ff',
  background: '#121212',
  surface: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textDark: '#FFFFFF',
  textLight: '#1E1E1E',
  inputBackground: '#2C2C2C',
  placeholder: '#757575',
  border: '#3A3A3A',
  cardBackground: '#1E1E1E',
  headerBackground: '#1E1E1E',
  bottomNavBackground: '#1E1E1E',
};

// Création du contexte
const ThemeContext = createContext({
  isDarkMode: false,
  theme: lightTheme,
  toggleTheme: () => {},
});

// Provider Component
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Charger le thème sauvegardé au démarrage
  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_KEY);
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Erreur chargement thème:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      await AsyncStorage.setItem(THEME_KEY, newMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Erreur sauvegarde thème:', error);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  const value = {
    isDarkMode,
    theme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// PropTypes
ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Hook personnalisé
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme doit être utilisé dans un ThemeProvider');
  }
  return context;
};

// Export par défaut
export default ThemeContext;