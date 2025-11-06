// src/screens/Auth/LoginScreen.js
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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PropTypes from 'prop-types';
import { useAuthContext } from '../../context/AuthContext';
import Colors from '../../constants/colors';

// Logo de l'application
const logo = require('../../../assets/images/logo.png');

const LoginScreen = ({ navigation }) => {
  // Etats pour etape 1
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  
  // Etats pour etape 2
  const [showOTPStep, setShowOTPStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [userEmail, setUserEmail] = useState('');
  
  // Etats pour validation et erreurs
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);
  
  // Etats generaux
  const [loading, setLoading] = useState(false);

  const { loginStep1, verifyOTP, checkAuth } = useAuthContext();

  // Gestion du verrouillage temporaire
  useEffect(() => {
    if (isLocked && lockTimer > 0) {
      const timer = setTimeout(() => {
        setLockTimer(lockTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isLocked && lockTimer === 0) {
      setIsLocked(false);
      setLoginAttempts(0);
    }
  }, [isLocked, lockTimer]);

  // Auto-verifier le code OTP quand 6 chiffres sont entres
  useEffect(() => {
    if (showOTPStep && otpCode.length === 6 && !loading) {
      handleVerifyOTP();
    }
  }, [otpCode, showOTPStep, loading]);

  /**
   * VALIDATION DES CHAMPS
   */
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    // Format senegalais : +221771234567 ou 771234567
    const phoneRegex = /^(\+221)?[7][0-9]{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateIdentifier = (value) => {
    if (!value || value.trim() === '') {
      return 'Ce champ est requis';
    }
    
    const trimmedValue = value.trim();
    const isEmail = trimmedValue.includes('@');
    const isPhone = trimmedValue.startsWith('+221') || trimmedValue.startsWith('7');
    
    if (isEmail && !validateEmail(trimmedValue)) {
      return 'Format d\'email invalide';
    }
    
    if (isPhone && !validatePhone(trimmedValue)) {
      return 'Format de telephone invalide (ex: +221771234567)';
    }
    
    if (!isEmail && !isPhone) {
      return 'Entrez un email ou un numero de telephone valide';
    }
    
    return null;
  };

  const validatePassword = (value) => {
    if (!value || value.trim() === '') {
      return 'Le mot de passe est requis';
    }
    if (value.length < 8) {
      return 'Le mot de passe doit contenir au moins 8 caracteres';
    }
    return null;
  };

  const validateOTP = (value) => {
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

  /**
   * Gestion des changements de champs
   */
  const handleIdentifierChange = (value) => {
    setIdentifier(value);
    if (touched.identifier) {
      const error = validateIdentifier(value);
      setErrors(prev => ({ ...prev, identifier: error }));
    }
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    if (touched.password) {
      const error = validatePassword(value);
      setErrors(prev => ({ ...prev, password: error }));
    }
  };

  const handleOtpChange = (value) => {
    // N'accepter que les chiffres
    const numericValue = value.replace(/[^0-9]/g, '');
    setOtpCode(numericValue);
    if (touched.otp) {
      const error = validateOTP(numericValue);
      setErrors(prev => ({ ...prev, otp: error }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    if (field === 'identifier') {
      const error = validateIdentifier(identifier);
      setErrors(prev => ({ ...prev, identifier: error }));
    } else if (field === 'password') {
      const error = validatePassword(password);
      setErrors(prev => ({ ...prev, password: error }));
    } else if (field === 'otp') {
      const error = validateOTP(otpCode);
      setErrors(prev => ({ ...prev, otp: error }));
    }
  };

  /**
   * ETAPE 1 : Envoi des identifiants
   */
  const handleLoginStep1 = async () => {
    // Marquer tous les champs comme touches
    setTouched({ identifier: true, password: true });

    // Valider tous les champs
    const identifierError = validateIdentifier(identifier);
    const passwordError = validatePassword(password);

    if (identifierError || passwordError) {
      setErrors({
        identifier: identifierError,
        password: passwordError,
      });
      return;
    }

    // Verifier si le compte est verrouille
    if (isLocked) {
      Alert.alert(
        'Compte temporairement verrouille',
        `Trop de tentatives echouees. Reessayez dans ${lockTimer} secondes.`
      );
      return;
    }

    setLoading(true);

    try {
      const result = await loginStep1(identifier.trim(), password);

      if (result.success && result.requiresOTP) {
        // OTP requis - Passer a l'etape 2
        setUserEmail(result.email);
        setShowOTPStep(true);
        setLoginAttempts(0); // Reset tentatives
        Alert.alert(
          'Code envoye',
          `Un code de verification a ete envoye a ${result.email}. Il expire dans ${result.expiresIn || '15 minutes'}.`
        );
      } else if (result.success && !result.requiresOTP) {
        // Connexion directe sans OTP
        console.log('Connexion reussie sans OTP');
        await AsyncStorage.setItem('temp_current_password', password);
        setLoginAttempts(0); // Reset tentatives
        await checkAuth();
      } else if (!result.success) {
        // Gestion des erreurs de connexion
        handleLoginError(result.error);
      }
    } catch (error) {
      console.error('Erreur login step 1:', error);
      handleLoginError({ 
        code: 'NETWORK_ERROR', 
        message: 'Impossible de se connecter au serveur' 
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Gestion des erreurs de connexion
   */
  const handleLoginError = (error) => {
    const newAttempts = loginAttempts + 1;
    setLoginAttempts(newAttempts);

    // Verrouiller apres 5 tentatives
    if (newAttempts >= 5) {
      setIsLocked(true);
      setLockTimer(300); // 5 minutes
      Alert.alert(
        'Compte verrouille',
        'Trop de tentatives echouees. Votre compte est verrouille pendant 5 minutes pour des raisons de securite.'
      );
      return;
    }

    let title = 'Erreur de connexion';
    let message = 'Une erreur est survenue. Veuillez reessayer.';

    // Gestion selon les codes d'erreur de ton backend
    if (error?.code) {
      switch (error.code) {
        case 'INVALID_CREDENTIALS':
        case 'AUTH_INVALID_CREDENTIALS':
          title = 'Identifiants incorrects';
          message = `Email/telephone ou mot de passe incorrect.\nTentatives restantes : ${5 - newAttempts}`;
          break;
        
        case 'USER_NOT_FOUND':
        case 'AUTH_USER_NOT_FOUND':
          title = 'Compte introuvable';
          message = 'Aucun compte ne correspond a ces identifiants.';
          break;
        
        case 'ACCOUNT_DISABLED':
        case 'AUTH_ACCOUNT_DISABLED':
          title = 'Compte desactive';
          message = 'Votre compte a ete desactive. Contactez un administrateur.';
          break;
        
        case 'ACCOUNT_LOCKED':
        case 'AUTH_ACCOUNT_LOCKED':
          title = 'Compte verrouille';
          message = 'Votre compte est verrouille. Contactez un administrateur.';
          break;
        
        case 'TOO_MANY_REQUESTS':
        case 'RATE_LIMIT_EXCEEDED':
          title = 'Trop de tentatives';
          message = 'Trop de tentatives de connexion. Reessayez dans quelques minutes.';
          setIsLocked(true);
          setLockTimer(180); // 3 minutes
          break;
        
        case 'NETWORK_ERROR':
        case 'CONNECTION_ERROR':
          title = 'Erreur de connexion';
          message = 'Impossible de se connecter au serveur. Verifiez votre connexion internet.';
          break;
        
        case 'SERVER_ERROR':
        case 'INTERNAL_ERROR':
          title = 'Erreur serveur';
          message = 'Une erreur est survenue sur le serveur. Reessayez plus tard.';
          break;
        
        case 'VALIDATION_ERROR':
          title = 'Erreur de validation';
          message = error.message || 'Les donnees saisies sont invalides.';
          break;
        
        default:
          if (error.message) {
            message = error.message;
          }
      }
    } else if (error?.message) {
      message = error.message;
    }

    // Ne pas compter les erreurs reseau comme tentatives
    if (error?.code === 'NETWORK_ERROR' || error?.code === 'CONNECTION_ERROR') {
      setLoginAttempts(loginAttempts); // Garder le nombre actuel
    }

    Alert.alert(title, message);
  };

  /**
   * ETAPE 2 : Verification du code OTP (AUTO)
   */
  const handleVerifyOTP = async () => {
    const otpError = validateOTP(otpCode);
    
    if (otpError) {
      setErrors(prev => ({ ...prev, otp: otpError }));
      return;
    }

    setLoading(true);

    try {
      const result = await verifyOTP(userEmail, otpCode);

      if (result.success) {
        console.log('Connexion reussie avec OTP');
        await AsyncStorage.setItem('temp_current_password', password);
        await checkAuth();
      } else {
        handleOTPError(result.error);
      }
    } catch (error) {
      console.error('Erreur verify OTP:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de la verification. Reessayez.'
      );
      setOtpCode('');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Gestion des erreurs OTP
   */
  const handleOTPError = (error) => {
    let title = 'Code invalide';
    let message = 'Le code saisi est incorrect ou expire.';

    if (error?.code) {
      switch (error.code) {
        case 'INVALID_OTP':
        case 'OTP_INVALID':
          message = 'Le code saisi est incorrect. Verifiez et reessayez.';
          break;
        
        case 'EXPIRED_OTP':
        case 'OTP_EXPIRED':
          title = 'Code expire';
          message = 'Le code a expire. Demandez un nouveau code.';
          break;
        
        case 'OTP_ATTEMPTS_EXCEEDED':
        case 'TOO_MANY_ATTEMPTS':
          title = 'Trop de tentatives';
          message = 'Trop de tentatives avec un code incorrect. Demandez un nouveau code.';
          break;
        
        case 'OTP_NOT_FOUND':
          title = 'Code introuvable';
          message = 'Aucun code de verification n\'a ete trouve. Demandez un nouveau code.';
          break;
        
        default:
          if (error.message) {
            message = error.message;
          }
      }
    } else if (error?.message) {
      message = error.message;
    }

    Alert.alert(title, message);
    setOtpCode('');
    setErrors({});
    setTouched({});
  };

  /**
   * Retour a l'etape 1
   */
  const handleBackToStep1 = () => {
    setShowOTPStep(false);
    setOtpCode('');
    setErrors({});
    setTouched({});
  };

  /**
   * Renvoyer le code OTP
   */
  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const result = await loginStep1(identifier.trim(), password);
      
      if (result.success && result.requiresOTP) {
        Alert.alert(
          'Code renvoye',
          `Un nouveau code a ete envoye a ${result.email}.`
        );
        setOtpCode('');
        setErrors({});
        setTouched({});
      } else if (result.success && !result.requiresOTP) {
        // Si l'OTP n'est plus requis
        Alert.alert('Connexion reussie', 'Vous etes maintenant connecte.');
        await AsyncStorage.setItem('temp_current_password', password);
        await checkAuth();
      } else {
        Alert.alert('Erreur', result.error?.message || 'Impossible de renvoyer le code. Reessayez.');
      }
    } catch (error) {
      console.error('Erreur resend OTP:', error);
      Alert.alert('Erreur', 'Une erreur est survenue.');
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
        {/* Logo et titre */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image 
              source={logo} 
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.appTitle}>DigiTontine</Text>
          <Text style={styles.appSubtitle}>
            Épargne collective, sécurité numérique.
          </Text>
        </View>

        {/* ETAPE 1 : Identifiants */}
        {!showOTPStep && (
          <View style={styles.formContainer}>
            <Text style={styles.welcomeText}>Ravi de vous revoir !</Text>

            {/* Champ identifiant */}
            <Text style={styles.inputLabel}>Email ou Telephone</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.inputContainer}>
                <Ionicons 
                  name="person-outline" 
                  size={20} 
                  color={Colors.placeholder} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[
                    styles.input,
                    errors.identifier && touched.identifier && styles.inputError
                  ]}
                  placeholder="Entrez votre identifiant"
                  placeholderTextColor={Colors.placeholder}
                  value={identifier}
                  onChangeText={handleIdentifierChange}
                  onBlur={() => handleBlur('identifier')}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!isLocked}
                />
              </View>
              {errors.identifier && touched.identifier && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color={Colors.error || '#e74c3c'} />
                  <Text style={styles.errorText}>{errors.identifier}</Text>
                </View>
              )}
            </View>

            {/* Champ mot de passe */}
            <Text style={styles.inputLabel}>Mot de passe</Text>
            <View style={styles.inputWrapper}>
              <View style={[
                styles.passwordContainer,
                errors.password && touched.password && styles.inputError
              ]}>
                <Ionicons 
                  name="lock-closed-outline" 
                  size={20} 
                  color={Colors.placeholder} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Entrez votre mot de passe"
                  placeholderTextColor={Colors.placeholder}
                  secureTextEntry={secureTextEntry}
                  value={password}
                  onChangeText={handlePasswordChange}
                  onBlur={() => handleBlur('password')}
                  editable={!isLocked}
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
              {errors.password && touched.password && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color={Colors.error || '#e74c3c'} />
                  <Text style={styles.errorText}>{errors.password}</Text>
                </View>
              )}
            </View>

            {/* Indicateur de verrouillage */}
            {isLocked && (
              <View style={styles.lockWarning}>
                <Ionicons name="lock-closed" size={20} color={Colors.error || '#e74c3c'} />
                <Text style={styles.lockWarningText}>
                  Compte verrouille. Reessayez dans {Math.floor(lockTimer / 60)}:{(lockTimer % 60).toString().padStart(2, '0')}
                </Text>
              </View>
            )}

            {/* Indicateur tentatives restantes */}
            {loginAttempts > 0 && loginAttempts < 5 && !isLocked && (
              <View style={styles.attemptsWarning}>
                <Ionicons name="warning-outline" size={16} color={Colors.warning || '#f39c12'} />
                <Text style={styles.attemptsWarningText}>
                  {5 - loginAttempts} tentative{5 - loginAttempts > 1 ? 's' : ''} restante{5 - loginAttempts > 1 ? 's' : ''}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>Mot de passe oublie ?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.loginButton,
                (loading || isLocked) && styles.buttonDisabled
              ]}
              onPress={handleLoginStep1}
              disabled={loading || isLocked}
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

        {/* ETAPE 2 : Verification OTP (AUTO) */}
        {showOTPStep && (
          <View style={styles.formContainer}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackToStep1}>
              <Ionicons name="arrow-back" size={24} color={Colors.primaryDark} />
            </TouchableOpacity>

            <View style={styles.otpHeader}>
              <View style={styles.otpIconContainer}>
                <Ionicons name="shield-checkmark" size={40} color={Colors.primaryDark} />
              </View>
              <Text style={styles.welcomeText}>Verification</Text>
              <Text style={styles.otpInfoText}>
                Un code a 6 chiffres a ete envoye a {userEmail}
              </Text>
            </View>

            {/* Champ OTP */}
            <Text style={styles.inputLabel}>Code de verification</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[
                  styles.input,
                  styles.otpInput,
                  errors.otp && touched.otp && styles.inputError
                ]}
                placeholder="000000"
                placeholderTextColor={Colors.placeholder}
                value={otpCode}
                onChangeText={handleOtpChange}
                onBlur={() => handleBlur('otp')}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus={true}
                editable={!loading}
              />
              {errors.otp && touched.otp && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color={Colors.error || '#e74c3c'} />
                  <Text style={styles.errorText}>{errors.otp}</Text>
                </View>
              )}
            </View>

            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={Colors.primaryDark} size="large" />
                <Text style={styles.loadingText}>Verification en cours...</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleResendOTP}
              disabled={loading}
            >
              <Ionicons
                name="refresh-outline"
                size={18}
                color={Colors.primaryDark}
                style={{ marginRight: 5 }}
              />
              <Text style={styles.resendButtonText}>Renvoyer le code</Text>
            </TouchableOpacity>

            <Text style={styles.otpHelpText}>
              Vous n'avez pas recu le code ? Verifiez vos spams ou cliquez sur "Renvoyer le code"
            </Text>
          </View>
        )}

        {/* Lien vers creation admin */}
        {!showOTPStep && (
          <TouchableOpacity
            style={styles.createAdminLink}
            onPress={() => navigation.navigate('RegisterAdmin')}
          >
            <Ionicons name="shield-checkmark-outline" size={16} color={Colors.placeholder} />
            <Text style={styles.createAdminText}>
              Premiere installation ? Creer un admin
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
    backgroundColor: Colors.textLight || '#FFFFFF',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primaryDark || '#003366',
    marginBottom: 5,
  },
  appSubtitle: {
    fontSize: 16,
    color: Colors.textDark || '#333333',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textDark || '#333333',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark || '#333333',
    marginBottom: 8,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground || '#F5F5F5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  input: {
    flex: 1,
    backgroundColor: Colors.inputBackground || '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputIcon: {
    marginLeft: 15,
  },
  inputError: {
    borderColor: Colors.error || '#e74c3c',
    borderWidth: 1,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground || '#F5F5F5',
    borderRadius: 10,
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
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    paddingHorizontal: 5,
  },
  errorText: {
    color: Colors.error || '#e74c3c',
    fontSize: 13,
    marginLeft: 5,
    flex: 1,
  },
  lockWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffe6e6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  lockWarningText: {
    color: Colors.error || '#e74c3c',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  attemptsWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff4e6',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  attemptsWarningText: {
    color: Colors.warning || '#f39c12',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: Colors.primaryDark || '#003366',
    fontWeight: '600',
    fontSize: 14,
  },
  loginButton: {
    flexDirection: 'row',
    backgroundColor: Colors.accentYellow || '#FFD700',
    borderRadius: 10,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.accentYellow || '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDark || '#333333',
  },
  backButton: {
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  otpHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  otpIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.accentYellow || '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  otpInfoText: {
    fontSize: 14,
    color: Colors.textDark || '#333333',
    textAlign: 'center',
    lineHeight: 20,
  },
  otpInput: {
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 8,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textDark || '#333333',
    marginTop: 10,
  },
  resendButton: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  resendButtonText: {
    color: Colors.primaryDark || '#003366',
    fontSize: 16,
    fontWeight: '600',
  },
  otpHelpText: {
    fontSize: 12,
    color: Colors.placeholder || '#999999',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
  createAdminLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    paddingVertical: 10,
  },
  createAdminText: {
    color: Colors.placeholder || '#999999',
    fontSize: 14,
    marginLeft: 5,
  },
});

export default LoginScreen;