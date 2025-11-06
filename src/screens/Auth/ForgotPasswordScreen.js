// src/screens/Auth/ForgotPasswordScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import authService from '../../services/auth/authService';
import Colors from '../../constants/colors';

export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep] = useState(1); // 1: email, 2: code + nouveau mot de passe, 3: confirmation
  
  // Étape 1
  const [email, setEmail] = useState('');
  
  // Étape 2
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Étape 3
  const [confirmationToken, setConfirmationToken] = useState('');
  
  const [loading, setLoading] = useState(false);
  
  // États pour validation visuelle
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  /**
   * Fonctions de validation
   */
  const validateEmail = (value) => {
    if (!value || value.trim() === '') {
      return 'L\'email est obligatoire';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Format d\'email invalide';
    }
    return null;
  };

  const validateCode = (value) => {
    if (!value || value.trim() === '') {
      return 'Le code est requis';
    }
    if (value.length !== 6) {
      return 'Le code doit contenir 6 chiffres';
    }
    if (!/^\d+$/.test(value)) {
      return 'Le code ne doit contenir que des chiffres';
    }
    return null;
  };

  const validateNewPassword = (value) => {
    if (!value || value.trim() === '') {
      return 'Le mot de passe est obligatoire';
    }
    if (value.length < 8) {
      return 'Le mot de passe doit contenir au moins 8 caractères';
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(value)) {
      return 'Requis : majuscule, minuscule, chiffre, caractère spécial (@$!%*?&)';
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
      case 'email':
        setErrors({ ...errors, email: validateEmail(email) });
        break;
      case 'code':
        setErrors({ ...errors, code: validateCode(code) });
        break;
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

  /**
   * ÉTAPE 1 : Demander le code de réinitialisation
   */
  const handleRequestCode = async () => {
    setTouched({ ...touched, email: true });
    const emailError = validateEmail(email);
    if (emailError) {
      setErrors({ ...errors, email: emailError });
      return;
    }

    setLoading(true);

    try {
      const result = await authService.forgotPassword(email);

      if (result.success) {
        Alert.alert(
          'Code envoyé',
          result.data?.message || 'Un code a été envoyé à votre email.',
          [
            {
              text: 'OK',
              onPress: () => setStep(2),
            },
          ]
        );
      } else {
        const errorMessage = result.error?.message || 
                            result.error?.error?.message ||
                            result.error?.error ||
                            'Aucun compte associé à cet email.';
        console.error('Erreur forgot password:', result.error);
        
        let errorTitle = 'Erreur';
        if (result.error?.code === 'USER_NOT_FOUND') {
          errorTitle = 'Email introuvable';
        } else if (result.error?.code === 'NETWORK_ERROR') {
          errorTitle = 'Erreur de connexion';
        }
        
        Alert.alert(errorTitle, errorMessage, [{ text: 'OK' }]);
      }
    } catch (error) {
      console.error('Erreur forgot password:', error);
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

  /**
   * ÉTAPE 2 : Réinitialiser le mot de passe
   */
  const handleResetPassword = async () => {
    // Marquer tous les champs comme touchés
    setTouched({
      code: true,
      newPassword: true,
      confirmPassword: true,
    });

    // Valider tous les champs
    const allErrors = {
      code: validateCode(code),
      newPassword: validateNewPassword(newPassword),
      confirmPassword: validateConfirmPassword(confirmPassword),
    };

    setErrors(allErrors);

    // Vérifier s'il y a des erreurs
    const hasErrors = Object.values(allErrors).some(error => error !== null);
    if (hasErrors) {
      Alert.alert('Erreur', 'Veuillez corriger les erreurs dans le formulaire.');
      return;
    }

    setLoading(true);

    try {
      const result = await authService.resetPassword(email, code, newPassword);

      if (result.success) {
        // Récupérer le token de confirmation depuis la réponse
        const token = result.data?.data?.confirmationToken;
        
        if (token) {
          setConfirmationToken(token);
          setStep(3);
          
          Alert.alert(
            'Vérification requise',
            'Un email de confirmation vous a été envoyé. Cliquez sur le lien dans l\'email pour confirmer le changement.',
            [{ text: 'OK' }]
          );
        } else {
          // Si pas de token, afficher le message standard
          Alert.alert(
            'Succès',
            result.data?.message || 'Vérifiez votre email pour confirmer le changement.',
            [
              {
                text: 'OK',
                onPress: () => navigation.navigate('Login'),
              },
            ]
          );
        }
      } else {
        const errorMessage = result.error?.message || 
                            result.error?.error?.message ||
                            result.error?.error ||
                            'Code invalide ou expiré.';
        console.error('Erreur reset password:', result.error);
        
        let errorTitle = 'Erreur';
        if (result.error?.code === 'INVALID_CODE') {
          errorTitle = 'Code invalide';
        } else if (result.error?.code === 'EXPIRED_CODE') {
          errorTitle = 'Code expiré';
        } else if (result.error?.code === 'NETWORK_ERROR') {
          errorTitle = 'Erreur de connexion';
        }
        
        Alert.alert(errorTitle, errorMessage, [{ text: 'OK' }]);
      }
    } catch (error) {
      console.error('Erreur reset password:', error);
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

  /**
   * ÉTAPE 3 : Confirmer le changement (optionnel - si token disponible)
   * Normalement l'utilisateur clique sur le lien dans l'email
   */
  const handleConfirmPassword = async () => {
    if (!confirmationToken.trim()) {
      Alert.alert('Erreur', 'Token de confirmation manquant.');
      return;
    }

    setLoading(true);

    try {
      const result = await authService.confirmPasswordChange(confirmationToken, 'approve');

      if (result.success) {
        Alert.alert(
          'Succès',
          'Votre mot de passe a été changé avec succès. Vous pouvez maintenant vous connecter.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      } else {
        Alert.alert(
          'Erreur',
          result.error?.message || 'Erreur lors de la confirmation.'
        );
      }
    } catch (error) {
      console.error('Erreur confirmation:', error);
      Alert.alert('Erreur', 'Une erreur est survenue. Réessayez.');
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
        {/* Header */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.primaryDark} />
        </TouchableOpacity>

        <Text style={styles.title}>Mot de passe oublié</Text>

        {/* ÉTAPE 1 : Email */}
        {step === 1 && (
          <View style={styles.formContainer}>
            <Text style={styles.subtitle}>
              Entrez votre email pour recevoir un code de réinitialisation.
            </Text>

            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                if (touched.email) {
                  setErrors({ ...errors, email: validateEmail(value) });
                }
              }}
              onBlur={() => handleBlur('email')}
              placeholder="exemple@email.com"
              placeholderTextColor={Colors.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[
                styles.input,
                errors.email && touched.email && { borderColor: Colors.danger || '#dc3545', borderWidth: 2 }
              ]}
            />
            {errors.email && touched.email && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                <Ionicons name="alert-circle" size={16} color={Colors.danger || '#dc3545'} />
                <Text style={{ color: Colors.danger || '#dc3545', fontSize: 13, marginLeft: 5 }}>
                  {errors.email}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRequestCode}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.textDark} />
              ) : (
                <>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={Colors.textDark}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.buttonText}>Envoyer le code</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* ÉTAPE 2 : Code + Nouveau mot de passe */}
        {step === 2 && (
          <View style={styles.formContainer}>
            <Text style={styles.subtitle}>
              Un code a été envoyé à {email}. Saisissez-le ci-dessous.
            </Text>

            <Text style={styles.inputLabel}>Code de vérification</Text>
            <TextInput
              value={code}
              onChangeText={(value) => {
                setCode(value);
                if (touched.code) {
                  setErrors({ ...errors, code: validateCode(value) });
                }
              }}
              onBlur={() => handleBlur('code')}
              placeholder="123456"
              placeholderTextColor={Colors.placeholder}
              keyboardType="number-pad"
              maxLength={6}
              style={[
                styles.input, 
                styles.codeInput,
                errors.code && touched.code && { borderColor: Colors.danger || '#dc3545', borderWidth: 2 }
              ]}
            />
            {errors.code && touched.code && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                <Ionicons name="alert-circle" size={16} color={Colors.danger || '#dc3545'} />
                <Text style={{ color: Colors.danger || '#dc3545', fontSize: 13, marginLeft: 5 }}>
                  {errors.code}
                </Text>
              </View>
            )}

            <Text style={styles.inputLabel}>Nouveau mot de passe</Text>
            <View style={[
              styles.passwordContainer,
              errors.newPassword && touched.newPassword && { borderColor: Colors.danger || '#dc3545', borderWidth: 2 }
            ]}>
              <TextInput
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
                placeholder="Minimum 8 caractères"
                placeholderTextColor={Colors.placeholder}
                secureTextEntry={!showPassword}
                style={styles.passwordInput}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
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
              value={confirmPassword}
              onChangeText={(value) => {
                setConfirmPassword(value);
                if (touched.confirmPassword) {
                  setErrors({ ...errors, confirmPassword: validateConfirmPassword(value) });
                }
              }}
              onBlur={() => handleBlur('confirmPassword')}
              placeholder="Confirmez votre mot de passe"
              placeholderTextColor={Colors.placeholder}
              secureTextEntry={!showPassword}
              style={[
                styles.input,
                errors.confirmPassword && touched.confirmPassword && { borderColor: Colors.danger || '#dc3545', borderWidth: 2 }
              ]}
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
              <Text style={styles.requirementTitle}>Le mot de passe doit contenir :</Text>
              <Text style={styles.requirement}>• Au moins 8 caractères</Text>
              <Text style={styles.requirement}>• 1 lettre majuscule</Text>
              <Text style={styles.requirement}>• 1 lettre minuscule</Text>
              <Text style={styles.requirement}>• 1 chiffre</Text>
              <Text style={styles.requirement}>• 1 caractère spécial (@$!%*?&)</Text>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleResetPassword}
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
                  <Text style={styles.buttonText}>Réinitialiser</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleRequestCode}
              disabled={loading}
            >
              <Text style={styles.resendButtonText}>
                Renvoyer le code
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ÉTAPE 3 : Confirmation (si token disponible) */}
        {step === 3 && (
          <View style={styles.formContainer}>
            <View style={styles.successContainer}>
              <Ionicons name="checkmark-circle" size={60} color={Colors.accentYellow} />
              <Text style={styles.successTitle}>Vérification requise</Text>
              <Text style={styles.successMessage}>
                Un email de confirmation a été envoyé à {email}.
              </Text>
              <Text style={styles.successMessage}>
                Cliquez sur le lien dans l'email pour confirmer le changement de mot de passe.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleConfirmPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.textDark} />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-done-outline"
                    size={20}
                    color={Colors.textDark}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.buttonText}>Confirmer</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.resendButtonText}>
                Retour à la connexion
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

ForgotPasswordScreen.propTypes = {
  navigation: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
    navigate: PropTypes.func.isRequired,
  }).isRequired,
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
  backButton: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textDark,
    marginBottom: 30,
    lineHeight: 22,
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
  codeInput: {
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 8,
    fontWeight: 'bold',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
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
  successContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginTop: 15,
    marginBottom: 10,
  },
  successMessage: {
    fontSize: 15,
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 8,
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
  resendButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  resendButtonText: {
    color: Colors.primaryDark,
    fontSize: 16,
    fontWeight: '600',
  },
});