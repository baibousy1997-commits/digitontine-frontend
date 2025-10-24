// src/screens/Auth/LoginScreen.js
import React, { useState } from 'react';
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
import PropTypes from 'prop-types';
import { useAuthContext } from '../../context/AuthContext';
import Colors from '../../constants/colors';

const LoginScreen = ({ navigation }) => {
  // États pour étape 1
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  
  // États pour étape 2
  const [showOTPStep, setShowOTPStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [userEmail, setUserEmail] = useState('');
  
  // États généraux
  const [loading, setLoading] = useState(false);

  const { loginStep1, verifyOTP, checkAuth } = useAuthContext();

  /**
   * ÉTAPE 1 : Envoi des identifiants
   */
  const handleLoginStep1 = async () => {
    if (!identifier.trim() || !password.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);

    try {
      const result = await loginStep1(identifier, password);

      if (result.success && result.requiresOTP) {
        // Cas 1 : OTP requis - Passer à l'étape 2 (saisie OTP)
        setUserEmail(result.email);
        setShowOTPStep(true);
        Alert.alert(
          'Code envoyé',
          `Un code de verification a ete envoye a ${result.email}. Il expire dans ${result.expiresIn || '15 minutes'}.`
        );
      } else if (result.success && !result.requiresOTP) {
        // Cas 2 : Connexion directe sans OTP (tokens déjà sauvegardés)
        console.log('✅ Connexion réussie sans OTP, rechargement du contexte...');
        
        // Forcer la vérification de l'authentification
        await checkAuth();
        
        console.log('✅ Contexte rechargé, navigation automatique vers HomeScreen');
      } else if (!result.success) {
        Alert.alert(
          'Erreur de connexion',
          result.error?.message || 'Identifiants incorrects'
        );
      }
    } catch (error) {
      console.error('Erreur login step 1:', error);
      Alert.alert('Erreur', 'Une erreur est survenue. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * ÉTAPE 2 : Vérification du code OTP
   */
  const handleVerifyOTP = async () => {
    if (!otpCode.trim() || otpCode.length !== 6) {
      Alert.alert('Erreur', 'Veuillez saisir le code a 6 chiffres.');
      return;
    }

    setLoading(true);

    try {
      const result = await verifyOTP(userEmail, otpCode);

      if (result.success) {
        console.log('✅ Connexion réussie, rechargement du contexte...');
        
        // Forcer la vérification de l'authentification
        await checkAuth();
        
        console.log('✅ Contexte rechargé, navigation automatique vers HomeScreen');
        
        // La navigation se fera automatiquement via AppNavigator
        // car isAuthenticated est maintenant true
      } else {
        Alert.alert(
          'Code invalide',
          result.error?.message || 'Le code saisi est incorrect ou expiré.'
        );
      }
    } catch (error) {
      console.error('Erreur verify OTP:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la verification.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Retour à l'étape 1
   */
  const handleBackToStep1 = () => {
    setShowOTPStep(false);
    setOtpCode('');
    setPassword('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo et titre */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>DigiTontine</Text>
          <Text style={styles.appSubtitle}>
            Votre tontine, simplifiée et sécurisée.
          </Text>
        </View>

        {/* ÉTAPE 1 : Identifiants */}
        {!showOTPStep && (
          <View style={styles.formContainer}>
            <Text style={styles.welcomeText}>Ravi de vous revoir !</Text>

            <Text style={styles.inputLabel}>Email ou Téléphone</Text>
            <TextInput
              style={styles.input}
              placeholder="exemple@email.com ou +221771234567"
              placeholderTextColor={Colors.placeholder}
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.inputLabel}>Mot de passe</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Entrez votre mot de passe"
                placeholderTextColor={Colors.placeholder}
                secureTextEntry={secureTextEntry}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setSecureTextEntry(!secureTextEntry)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={secureTextEntry ? 'eye-off-outline' : 'eye-outline'}
                  size={24}
                  color={Colors.placeholder}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.buttonDisabled]}
              onPress={handleLoginStep1}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.textDark} />
              ) : (
                <>
                  <Ionicons
                    name="log-in-outline"
                    size={20}
                    color={Colors.textDark}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.loginButtonText}>Se Connecter</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* ÉTAPE 2 : Vérification OTP */}
        {showOTPStep && (
          <View style={styles.formContainer}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackToStep1}>
              <Ionicons name="arrow-back" size={24} color={Colors.primaryDark} />
            </TouchableOpacity>

            <Text style={styles.welcomeText}>Vérification</Text>
            <Text style={styles.otpInfoText}>
              Un code à 6 chiffres a été envoyé à {userEmail}
            </Text>

            <Text style={styles.inputLabel}>Code de vérification</Text>
            <TextInput
              style={[styles.input, styles.otpInput]}
              placeholder="123456"
              placeholderTextColor={Colors.placeholder}
              value={otpCode}
              onChangeText={setOtpCode}
              keyboardType="number-pad"
              maxLength={6}
            />

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.buttonDisabled]}
              onPress={handleVerifyOTP}
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
                  <Text style={styles.loginButtonText}>Vérifier</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleLoginStep1}
              disabled={loading}
            >
              <Text style={styles.resendButtonText}>
                Renvoyer le code
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Lien vers création admin (première installation) */}
        {!showOTPStep && (
          <TouchableOpacity
            style={styles.createAdminLink}
            onPress={() => navigation.navigate('RegisterAdmin')}
          >
            <Ionicons name="shield-checkmark-outline" size={16} color={Colors.placeholder} />
            <Text style={styles.createAdminText}>
              Première installation ? Créer un admin
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

LoginScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
    reset: PropTypes.func.isRequired,
  }).isRequired,
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.textLight,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primaryDark,
    marginBottom: 5,
  },
  appSubtitle: {
    fontSize: 16,
    color: Colors.textDark,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 20,
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    borderRadius: 10,
    marginBottom: 8,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: Colors.primaryDark,
    fontWeight: '600',
  },
  loginButton: {
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
  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  backButton: {
    marginBottom: 20,
  },
  otpInfoText: {
    fontSize: 14,
    color: Colors.textDark,
    marginBottom: 20,
    lineHeight: 20,
  },
  otpInput: {
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 8,
    fontWeight: 'bold',
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
  createAdminLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  createAdminText: {
    color: Colors.placeholder,
    fontSize: 14,
    marginLeft: 5,
  },
});

export default LoginScreen;