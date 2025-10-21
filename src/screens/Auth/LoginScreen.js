import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import Colors from '../../constants/colors';

const { width } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('+221 77 123 45 67');
  const [password, setPassword] = useState('password123'); // Fictif

  /**
   * Fonction de connexion fictive.
   * Après une validation simplifiée, navigue vers l'écran principal 'Main'.
   */
  const handleAuth = () => {
    // Logique de validation et de connexion/inscription fictive
    if (isLogin) {
      if (phoneNumber.trim() && password.trim()) {
        // Navigation réussie : remplace l'écran actuel par la navigation principale
        navigation.replace('Main');
      }
    } else {
      // Logique d'inscription fictive...
      alert("Fonctionnalité d'inscription à implémenter."); 
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Titre principal */}
        <Text style={styles.appTitle}>DigiTontine</Text>
        <Text style={styles.appSubtitle}>Votre tontine, simplifiée et sécurisée.</Text>
        
        {/* Toggle Se Connecter / S'inscrire */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleButton, isLogin && styles.activeToggle]}
            onPress={() => setIsLogin(true)}
          >
            <Text style={[styles.toggleText, isLogin && styles.activeToggleText]}>Se Connecter</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleButton, !isLogin && styles.activeToggle]}
            onPress={() => setIsLogin(false)}
          >
            <Text style={[styles.toggleText, !isLogin && styles.activeToggleText]}>S'inscrire</Text>
          </TouchableOpacity>
        </View>

        {isLogin ? (
          <>
            {/* Formulaire de Connexion */}
            <Text style={styles.welcomeText}>Ravi de vous revoir !</Text>
            
            {/* Numéro de téléphone */}
            <Text style={styles.inputLabel}>Numéro de téléphone</Text>
            <TextInput
              style={styles.input}
              placeholder="+221 7X XXX XX XX"
              placeholderTextColor={Colors.placeholder}
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
            
            {/* Mot de passe */}
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
              <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)} style={styles.eyeIcon}>
                <Ionicons 
                  name={secureTextEntry ? 'eye-off-outline' : 'eye-outline'} 
                  size={24} 
                  color={Colors.placeholder} 
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            {/* Bouton Se Connecter */}
            <TouchableOpacity style={styles.loginButton} onPress={handleAuth}>
              <Text style={styles.loginButtonText}>Se Connecter</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={{ marginTop: 40 }}>
            <Text style={styles.welcomeText}>Créer votre compte</Text>
            <Text style={styles.inputLabel}>Nom Complet</Text>
            <TextInput style={styles.input} placeholder="Votre nom" />
            <Text style={styles.inputLabel}>Numéro de téléphone</Text>
            <TextInput style={styles.input} placeholder="+221 7X XXX XX XX" keyboardType="phone-pad" />
            <Text style={styles.inputLabel}>Mot de passe</Text>
            <TextInput style={styles.input} placeholder="Choisissez un mot de passe" secureTextEntry />
             <TouchableOpacity style={styles.loginButton} onPress={handleAuth}>
              <Text style={styles.loginButtonText}>S'inscrire</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Mentions légales */}
        <Text style={styles.legalText}>
          En continuant, vous acceptez nos <Text style={styles.linkText}>Conditions d'utilisation</Text> et notre <Text style={styles.linkText}>Politique de confidentialité</Text>
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
};

LoginScreen.propTypes = {
  navigation: PropTypes.shape({
    replace: PropTypes.func.isRequired,
    navigate: PropTypes.func.isRequired,
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

export default LoginScreen;
