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
  
  // États pour validation visuelle
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

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
   * Fonctions de validation individuelles
   */
  const validateNewPassword = (value) => {
    if (!value || value.trim() === '') {
      return 'Le nouveau mot de passe est obligatoire';
    }
    if (value.length < 8) {
      return 'Le mot de passe doit contenir au moins 8 caractères';
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(value)) {
      return 'Requis : majuscule, minuscule, chiffre, caractère spécial (@$!%*?&)';
    }
    if (currentPassword && value === currentPassword) {
      return 'Le nouveau mot de passe doit être différent de l\'ancien';
    }
    return null;
  };

  const validateConfirmPassword = (value) => {
    if (!value || value.trim() === '') {
      return 'La confirmation est obligatoire';
    }
    if (value !== newPassword) {
      return 'Les mots de passe ne correspondent pas';
    }
    return null;
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    
    switch (field) {
      case 'newPassword':
        setErrors({ ...errors, newPassword: validateNewPassword(newPassword) });
        // Valider aussi la confirmation si elle est remplie
        if (touched.confirmPassword && confirmPassword) {
          setErrors({ ...errors, confirmPassword: validateConfirmPassword(confirmPassword) });
        }
        break;
      case 'confirmPassword':
        setErrors({ ...errors, confirmPassword: validateConfirmPassword(confirmPassword) });
        break;
    }
  };

  /**
   * Validation du formulaire
   */
  const validateForm = () => {
    if (!currentPassword) {
      Alert.alert('Erreur', 'Impossible de recuperer votre mot de passe actuel. Veuillez vous reconnecter.');
      return false;
    }

    // Marquer tous les champs comme touchés
    setTouched({
      newPassword: true,
      confirmPassword: true,
    });

    // Valider tous les champs
    const allErrors = {
      newPassword: validateNewPassword(newPassword),
      confirmPassword: validateConfirmPassword(confirmPassword),
    };

    setErrors(allErrors);

    // Vérifier s'il y a des erreurs
    const hasErrors = Object.values(allErrors).some(error => error !== null);
    if (hasErrors) {
      Alert.alert('Erreur', 'Veuillez corriger les erreurs dans le formulaire.');
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
        const errorMessage = result.error?.message || 
                            result.error?.error?.message ||
                            result.error?.error ||
                            'Impossible de changer le mot de passe.';
        console.error('Erreur changement mot de passe:', result.error);
        
        let errorTitle = 'Erreur';
        if (result.error?.code === 'INVALID_PASSWORD') {
          errorTitle = 'Mot de passe incorrect';
        } else if (result.error?.code === 'NETWORK_ERROR') {
          errorTitle = 'Erreur de connexion';
        }
        
        Alert.alert(errorTitle, errorMessage, [{ text: 'OK' }]);
      }
    } catch (error) {
      console.error('Erreur changement mot de passe:', error);
      console.error('Erreur stack:', error.stack);
      
      let errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
      let errorTitle = 'Erreur';
      
      if (error.message) {
        if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
          errorTitle = 'Erreur de connexion';
          errorMessage = 'Impossible de se connecter au serveur.\n\nVérifiez votre connexion internet.';
        } else if (error.message.includes('JSON') || error.message.includes('parsing')) {
          errorTitle = 'Erreur serveur';
          errorMessage = 'Le serveur a renvoyé une réponse invalide. Veuillez réessayer.';
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert(errorTitle, errorMessage, [{ text: 'OK' }]);
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
              <View style={[
                ChangePasswordStyles.inputContainer, 
                { backgroundColor: theme.inputBackground },
                errors.newPassword && touched.newPassword && { borderColor: Colors.danger, borderWidth: 2 }
              ]}>
                <TextInput
                  style={[ChangePasswordStyles.input, { color: theme.text }]}
                  placeholder="Nouveau mot de passe"
                  placeholderTextColor={theme.placeholder}
                  secureTextEntry={!showNewPassword}
                  value={newPassword}
                  onChangeText={(value) => {
                    setNewPassword(value);
                    if (touched.newPassword) {
                      setErrors({ ...errors, newPassword: validateNewPassword(value) });
                    }
                    // Valider aussi la confirmation si elle est remplie
                    if (touched.confirmPassword && confirmPassword) {
                      setErrors({ ...errors, confirmPassword: validateConfirmPassword(confirmPassword) });
                    }
                  }}
                  onBlur={() => handleBlur('newPassword')}
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
              {errors.newPassword && touched.newPassword && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                  <Ionicons name="alert-circle" size={16} color={Colors.danger} />
                  <Text style={{ color: Colors.danger, fontSize: 13, marginLeft: 5 }}>
                    {errors.newPassword}
                  </Text>
                </View>
              )}
            </View>

            {/* Champ confirmation mot de passe */}
            <View style={ChangePasswordStyles.inputGroup}>
              <Text style={[ChangePasswordStyles.label, { color: theme.text }]}>
                Confirmation du nouveau mot de passe
              </Text>
              <View style={[
                ChangePasswordStyles.inputContainer, 
                { backgroundColor: theme.inputBackground },
                errors.confirmPassword && touched.confirmPassword && { borderColor: Colors.danger, borderWidth: 2 }
              ]}>
                <TextInput
                  style={[ChangePasswordStyles.input, { color: theme.text }]}
                  placeholder="Confirmation du nouveau mot de passe"
                  placeholderTextColor={theme.placeholder}
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={(value) => {
                    setConfirmPassword(value);
                    if (touched.confirmPassword) {
                      setErrors({ ...errors, confirmPassword: validateConfirmPassword(value) });
                    }
                  }}
                  onBlur={() => handleBlur('confirmPassword')}
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
              {errors.confirmPassword && touched.confirmPassword && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                  <Ionicons name="alert-circle" size={16} color={Colors.danger} />
                  <Text style={{ color: Colors.danger, fontSize: 13, marginLeft: 5 }}>
                    {errors.confirmPassword}
                  </Text>
                </View>
              )}
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