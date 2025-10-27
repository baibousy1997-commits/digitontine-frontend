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

  /**
   * ÉTAPE 1 : Demander le code de réinitialisation
   */
  const handleRequestCode = async () => {
    if (!email.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir votre email.');
      return;
    }

    // Validation format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Erreur', 'Format d\'email invalide.');
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
        Alert.alert(
          'Erreur',
          result.error?.message || 'Aucun compte associé à cet email.'
        );
      }
    } catch (error) {
      console.error('Erreur forgot password:', error);
      Alert.alert('Erreur', 'Une erreur est survenue. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * ÉTAPE 2 : Réinitialiser le mot de passe
   */
  const handleResetPassword = async () => {
    // Validations
    if (!code.trim() || code.length !== 6) {
      Alert.alert('Erreur', 'Le code doit contenir 6 chiffres.');
      return;
    }

    if (!newPassword.trim() || newPassword.length < 8) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }

    // Validation force du mot de passe
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      Alert.alert(
        'Mot de passe faible',
        'Le mot de passe doit contenir :\n• Au moins 8 caractères\n• 1 majuscule\n• 1 minuscule\n• 1 chiffre\n• 1 caractère spécial (@$!%*?&)'
      );
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
        Alert.alert(
          'Erreur',
          result.error?.message || 'Code invalide ou expiré.'
        );
      }
    } catch (error) {
      console.error('Erreur reset password:', error);
      Alert.alert('Erreur', 'Une erreur est survenue. Réessayez.');
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
              onChangeText={setEmail}
              placeholder="exemple@email.com"
              placeholderTextColor={Colors.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

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
              onChangeText={setCode}
              placeholder="123456"
              placeholderTextColor={Colors.placeholder}
              keyboardType="number-pad"
              maxLength={6}
              style={[styles.input, styles.codeInput]}
            />

            <Text style={styles.inputLabel}>Nouveau mot de passe</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
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

            <Text style={styles.inputLabel}>Confirmer le mot de passe</Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirmez votre mot de passe"
              placeholderTextColor={Colors.placeholder}
              secureTextEntry={!showPassword}
              style={styles.input}
            />

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