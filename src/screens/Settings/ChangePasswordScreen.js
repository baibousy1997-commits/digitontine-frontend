// src/screens/Settings/ChangePasswordScreen.js
import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PropTypes from 'prop-types';
import { useTheme } from '../../context/ThemeContext';
import { useAuthContext } from '../../context/AuthContext';
import authService from '../../services/auth/authService';
import Colors from '../../constants/colors';
import ChangePasswordStyles from '../../styles/ChangePasswordStyles';

const ChangePasswordScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { logout } = useAuthContext();
  
  // Recuperation automatique du mot de passe actuel
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(true);

  // Recuperer le mot de passe actuel au montage du composant
  useEffect(() => {
    const loadCurrentPassword = async () => {
      try {
        const pwd = await AsyncStorage.getItem('temp_current_password');
        if (pwd) {
          setCurrentPassword(pwd);
          console.log('Mot de passe actuel recupere avec succes');
        } else {
          Alert.alert(
            'Erreur',
            'Impossible de recuperer votre mot de passe actuel. Veuillez vous reconnecter.',
            [
              {
                text: 'OK',
                onPress: async () => {
                  await logout(false);
                },
              },
            ]
          );
        }
      } catch (error) {
        console.error('Erreur recuperation password:', error);
        Alert.alert('Erreur', 'Une erreur est survenue.');
      } finally {
        setLoadingPassword(false);
      }
    };

    loadCurrentPassword();
  }, []);

  /**
   * Validation du formulaire
   */
  const validateForm = () => {
    if (!currentPassword) {
      Alert.alert('Erreur', 'Impossible de recuperer votre mot de passe actuel. Veuillez vous reconnecter.');
      return false;
    }

    if (!newPassword.trim() || newPassword.length < 8) {
      Alert.alert('Erreur', 'Le nouveau mot de passe doit contenir au moins 8 caracteres.');
      return false;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return false;
    }

    if (currentPassword === newPassword) {
      Alert.alert('Erreur', 'Le nouveau mot de passe doit etre different de l\'ancien.');
      return false;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      Alert.alert(
        'Mot de passe faible',
        'Le mot de passe doit contenir :\n- Au moins 8 caracteres\n- 1 majuscule\n- 1 minuscule\n- 1 chiffre\n- 1 caractere special (@$!%*?&)'
      );
      return false;
    }

    return true;
  };

  /**
   * Changer le mot de passe avec confirmation email
   */
  const handleChangePassword = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Utiliser changePassword avec confirmation email
      const result = await authService.changePassword(currentPassword, newPassword);

      if (result.success) {
        // NE PAS mettre a jour le mot de passe stocke car il faut d'abord confirmer via email
        
        Alert.alert(
          'Email de confirmation envoye',
          'Un email de confirmation vous a ete envoye.\n\n' +
          'IMPORTANT:\n' +
          '1. Ouvrez votre email\n' +
          '2. Cliquez sur "Confirmer le changement"\n' +
          '3. Revenez ici et reconnectez-vous avec votre NOUVEAU mot de passe\n\n' +
          'ATTENTION: Votre mot de passe actuel ne changera QUE apres avoir clique sur le lien de confirmation dans l\'email.',
          [
            {
              text: 'OK, j\'ai compris',
              onPress: async () => {
                console.log('Deconnexion suite a la demande de changement de password');
                await logout(false);
              },
            },
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert(
          'Erreur',
          result.error?.message || 'Impossible de changer le mot de passe.'
        );
      }
    } catch (error) {
      console.error('Erreur changement mot de passe:', error);
      Alert.alert('Erreur', 'Une erreur est survenue. Reessayez.');
    } finally {
      setLoading(false);
    }
  };

  // Afficher un loader pendant la recuperation du mot de passe
  if (loadingPassword) {
    return (
      <SafeAreaView style={[ChangePasswordStyles.container, { backgroundColor: theme.background }]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.accentYellow} />
          <Text style={{ color: theme.text, marginTop: 10 }}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[ChangePasswordStyles.container, { backgroundColor: theme.background }]}>
      <StatusBar 
        barStyle={theme.isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.background} 
      />
      
      <View style={[ChangePasswordStyles.header, { backgroundColor: theme.background }]}>
        <TouchableOpacity 
          style={ChangePasswordStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
          <Text style={[ChangePasswordStyles.backText, { color: theme.text }]}>Retour</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={ChangePasswordStyles.menuButton}>
          <Ionicons name="menu" size={28} color={theme.text} />
        </TouchableOpacity>
      </View>

      <View style={ChangePasswordStyles.titleContainer}>
        <Text style={[ChangePasswordStyles.title, { color: theme.text }]}>
          Parametres
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={ChangePasswordStyles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={ChangePasswordStyles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={[ChangePasswordStyles.cardContainer, { backgroundColor: theme.surface }]}>
            <Text style={[ChangePasswordStyles.cardTitle, { color: theme.text }]}>
              Changer mon mot de passe
            </Text>

            {/* Info: mot de passe actuel recupere automatiquement */}
            <View style={{ backgroundColor: '#e8f4fd', borderRadius: 10, padding: 12, marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="information-circle" size={20} color={Colors.primaryDark} />
                <Text style={{ fontSize: 13, color: Colors.textDark, marginLeft: 8, flex: 1 }}>
                  Votre mot de passe actuel a ete recupere automatiquement.
                </Text>
              </View>
            </View>

            {/* Champ nouveau mot de passe */}
            <View style={ChangePasswordStyles.inputGroup}>
              <Text style={[ChangePasswordStyles.label, { color: theme.text }]}>
                Nouveau mot de passe
              </Text>
              <View style={[ChangePasswordStyles.inputContainer, { backgroundColor: theme.inputBackground }]}>
                <TextInput
                  style={[ChangePasswordStyles.input, { color: theme.text }]}
                  placeholder="Nouveau mot de passe"
                  placeholderTextColor={theme.placeholder}
                  secureTextEntry={!showNewPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  autoFocus={true}
                />
                <TouchableOpacity
                  style={ChangePasswordStyles.eyeIcon}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  <Ionicons
                    name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={24}
                    color={theme.placeholder}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Champ confirmation mot de passe */}
            <View style={ChangePasswordStyles.inputGroup}>
              <Text style={[ChangePasswordStyles.label, { color: theme.text }]}>
                Confirmation du nouveau mot de passe
              </Text>
              <View style={[ChangePasswordStyles.inputContainer, { backgroundColor: theme.inputBackground }]}>
                <TextInput
                  style={[ChangePasswordStyles.input, { color: theme.text }]}
                  placeholder="Confirmation du nouveau mot de passe"
                  placeholderTextColor={theme.placeholder}
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity
                  style={ChangePasswordStyles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={24}
                    color={theme.placeholder}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ backgroundColor: '#fff4e6', borderRadius: 10, padding: 15, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: Colors.accentYellow }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.textDark, marginBottom: 8 }}>
                Processus de confirmation
              </Text>
              <Text style={{ fontSize: 13, color: Colors.textDark, lineHeight: 20 }}>
                1. Vous serez deconnecte immediatement{'\n'}
                2. Un email de confirmation vous sera envoye{'\n'}
                3. Cliquez sur le lien dans l'email pour confirmer{'\n'}
                4. Reconnectez-vous avec le NOUVEAU mot de passe{'\n\n'}
                Le mot de passe ne changera QUE si vous confirmez via l'email.
              </Text>
            </View>

            <TouchableOpacity
              style={[ChangePasswordStyles.button, loading && { opacity: 0.6 }]}
              onPress={handleChangePassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.textDark} />
              ) : (
                <>
                  <Ionicons 
                    name="checkmark-circle-outline" 
                    size={20} 
                    color={Colors.textDark} 
                    style={{ marginRight: 8 }} 
                  />
                  <Text style={ChangePasswordStyles.buttonText}>
                    Changer mon mot de passe
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

ChangePasswordScreen.propTypes = {
  navigation: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
  }).isRequired,
};

export default ChangePasswordScreen;