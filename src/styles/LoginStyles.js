import { StyleSheet, Dimensions } from 'react-native';
import Colors from '../constants/Colors';

const { width } = Dimensions.get('window');

const LoginStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.textLight,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  // Titres
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primaryDark,
    textAlign: 'center',
    marginBottom: 5,
  },
  appSubtitle: {
    fontSize: 16,
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 40,
  },
  // Toggle
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.inputBackground,
    borderRadius: 10,
    padding: 5,
    marginBottom: 30,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: Colors.textLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textDark,
  },
  activeToggleText: {
    color: Colors.primaryDark,
  },
  // Formulaire
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
  // Bouton Connexion
  loginButton: {
    backgroundColor: Colors.accentYellow,
    borderRadius: 10,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: Colors.accentYellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    marginTop: 10,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  // Mentions légales
  legalText: {
    fontSize: 14,
    color: Colors.placeholder,
    textAlign: 'center',
    marginTop: 40,
    lineHeight: 20,
  },
  linkText: {
    color: Colors.primaryDark,
    fontWeight: '600',
  },
});

export default LoginStyles;
