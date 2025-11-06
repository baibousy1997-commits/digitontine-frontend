// src/screens/Auth/FirstPasswordChangeScreen.js
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PropTypes from 'prop-types';
import { useAuthContext } from '../../context/AuthContext';
import authService from '../../services/auth/authService';
import Colors from '../../constants/colors';

const FirstPasswordChangeScreen = ({ navigation }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // États pour validation visuelle
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const { logout, markPasswordChangeComplete, checkAuth } = useAuthContext();

  // Recuperer le mot de passe temporaire stocke lors du login
  useEffect(() => {
    const loadTemporaryPassword = async () => {
      try {
        const tempPassword = await AsyncStorage.getItem('temp_current_password');
        if (tempPassword) {
          setOldPassword(tempPassword);
          console.log('Mot de passe temporaire recupere et pre-rempli');
        } else {
          console.warn('Aucun mot de passe temporaire trouve dans AsyncStorage');
        }
      } catch (error) {
        console.error('Erreur lors de la recuperation du mot de passe temporaire:', error);
      }
    };

    loadTemporaryPassword();
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
    if (oldPassword && value === oldPassword) {
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
        if (touched.confirmPassword && confirmPassword) {
          setErrors({ ...errors, confirmPassword: validateConfirmPassword(confirmPassword) });
        }
        break;
      case 'confirmPassword':
        setErrors({ ...errors, confirmPassword: validateConfirmPassword(confirmPassword) });
        break;
    }
  };

  const validatePassword = () => {
    if (!oldPassword.trim()) {
      Alert.alert('Erreur', 'Le mot de passe actuel est manquant. Veuillez vous reconnecter.');
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

const handleChangePassword = async () => {
  if (!validatePassword()) return;

  setLoading(true);

  try {
    console.log('=== DEBUT CHANGEMENT MOT DE PASSE ===');
    const result = await authService.firstPasswordChange(oldPassword, newPassword);
    console.log('Result firstPasswordChange:', result);

    if (result.success) {
      // Supprimer le mot de passe temporaire
      await AsyncStorage.removeItem('temp_current_password');
      console.log('Mot de passe temporaire supprime');
      
      setLoading(false);
      
      //  NOUVEAU MESSAGE (pas de mention d'email)
      Alert.alert(
        'Succes',
        'Votre mot de passe a ete change avec succes ! Reconnectez-vous avec votre nouveau mot de passe.',
        [
          {
            text: 'OK',
            onPress: async () => {
              console.log('Deconnexion apres changement de mot de passe');
              await logout(false); // false = pas de message de deconnexion
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
      console.error('Erreur first password change:', result.error);
      
      let errorTitle = 'Erreur';
      if (result.error?.code === 'INVALID_PASSWORD') {
        errorTitle = 'Mot de passe incorrect';
      } else if (result.error?.code === 'NETWORK_ERROR') {
        errorTitle = 'Erreur de connexion';
      }
      
      Alert.alert(errorTitle, errorMessage, [{ text: 'OK' }]);
    }
  } catch (error) {
    console.error('Erreur first password change:', error);
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="warning-outline" size={60} color={Colors.accentYellow} />
          </View>
          <Text style={styles.title}>Changement obligatoire</Text>
          <Text style={styles.subtitle}>
            Pour des raisons de securite, vous devez changer votre mot de passe temporaire.
          </Text>
        </View>

        <View style={styles.formContainer}>
          {/* Pas d'affichage du mot de passe actuel puisqu'il est automatiquement recupere */}
          
          <Text style={styles.inputLabel}>Nouveau mot de passe</Text>
          <View style={[
            styles.passwordContainer,
            errors.newPassword && touched.newPassword && { borderColor: Colors.danger || '#dc3545', borderWidth: 2 }
          ]}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Minimum 8 caracteres"
              placeholderTextColor={Colors.placeholder}
              secureTextEntry={!showPasswords}
              value={newPassword}
              onChangeText={(value) => {
                setNewPassword(value);
                if (touched.newPassword) {
                  setErrors({ ...errors, newPassword: validateNewPassword(value) });
                }
                if (touched.confirmPassword && confirmPassword) {
                  setErrors({ ...errors, confirmPassword: validateConfirmPassword(confirmPassword) });
                }
              }}
              onBlur={() => handleBlur('newPassword')}
              autoFocus={true}
            />
            <TouchableOpacity
              onPress={() => setShowPasswords(!showPasswords)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showPasswords ? 'eye-outline' : 'eye-off-outline'}
                size={24}
                color={Colors.placeholder}
              />
            </TouchableOpacity>
          </View>
          {errors.newPassword && touched.newPassword && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
              <Ionicons name="alert-circle" size={16} color={Colors.danger || '#dc3545'} />
              <Text style={{ color: Colors.danger || '#dc3545', fontSize: 13, marginLeft: 5 }}>
                {errors.newPassword}
              </Text>
            </View>
          )}

          <Text style={styles.inputLabel}>Confirmer le mot de passe</Text>
          <TextInput
            style={[
              styles.input,
              errors.confirmPassword && touched.confirmPassword && { borderColor: Colors.danger || '#dc3545', borderWidth: 2 }
            ]}
            placeholder="Confirmez votre nouveau mot de passe"
            placeholderTextColor={Colors.placeholder}
            secureTextEntry={!showPasswords}
            value={confirmPassword}
            onChangeText={(value) => {
              setConfirmPassword(value);
              if (touched.confirmPassword) {
                setErrors({ ...errors, confirmPassword: validateConfirmPassword(value) });
              }
            }}
            onBlur={() => handleBlur('confirmPassword')}
          />
          {errors.confirmPassword && touched.confirmPassword && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
              <Ionicons name="alert-circle" size={16} color={Colors.danger || '#dc3545'} />
              <Text style={{ color: Colors.danger || '#dc3545', fontSize: 13, marginLeft: 5 }}>
                {errors.confirmPassword}
              </Text>
            </View>
          )}

          <View style={styles.passwordRequirements}>
            <Text style={styles.requirementTitle}>Exigences du mot de passe :</Text>
            <Text style={styles.requirement}>- Au moins 8 caracteres</Text>
            <Text style={styles.requirement}>- 1 lettre majuscule</Text>
            <Text style={styles.requirement}>- 1 lettre minuscule</Text>
            <Text style={styles.requirement}>- 1 chiffre</Text>
            <Text style={styles.requirement}>- 1 caractere special (@$!%*?&)</Text>
          </View>


          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
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
                <Text style={styles.buttonText}>Changer le mot de passe</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

FirstPasswordChangeScreen.propTypes = {
  navigation: PropTypes.shape({
    reset: PropTypes.func,
  }),
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.textLight,
  },
  container: {
    padding: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    backgroundColor: '#fff4e6',
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textDark,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  formContainer: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 8,
  },
  input: {
    width: '100%',
    backgroundColor: Colors.inputBackground,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
    color: Colors.textDark,
  },
  eyeIcon: {
    padding: 10,
  },
  passwordRequirements: {
    backgroundColor: '#e8f4fd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  requirementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 8,
  },
  requirement: {
    fontSize: 13,
    color: Colors.textDark,
    marginBottom: 4,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#fff4e6',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accentYellow,
  },
  warningTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 13,
    color: Colors.textDark,
    lineHeight: 20,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: Colors.accentYellow,
    borderRadius: 10,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.accentYellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
});

export default FirstPasswordChangeScreen;