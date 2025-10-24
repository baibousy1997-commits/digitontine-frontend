// src/screens/Auth/RegisterAdminScreen.js
/**
 * Écran d'inscription pour créer le PREMIER ADMIN
 * Utilise la route publique POST /create-admin-public (SANS préfixe /digitontine)
 * 
 * ⚠️ À DÉSACTIVER EN PRODUCTION ou protéger avec un code d'accès
 */

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
import API_CONFIG from '../../config/api.config';
import Colors from '../../constants/colors';

const RegisterAdminScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    numeroTelephone: '',
    motDePasse: '',
    confirmPassword: '',
    dateNaissance: '',
    adresse: '',
    carteIdentite: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const validateForm = () => {
    const {
      prenom,
      nom,
      email,
      numeroTelephone,
      motDePasse,
      confirmPassword,
      dateNaissance,
    } = formData;

    if (!prenom || !nom || !email || !numeroTelephone || !motDePasse || !dateNaissance) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
      return false;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Erreur', 'Format d\'email invalide.');
      return false;
    }

    // Validation téléphone sénégalais
    const phoneRegex = /^\+221[7][0-9]{8}$/;
    if (!phoneRegex.test(numeroTelephone)) {
      Alert.alert(
        'Erreur',
        'Format de téléphone invalide. Ex: +221771234567'
      );
      return false;
    }

    // Validation mot de passe
    if (motDePasse.length < 8) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 8 caractères.');
      return false;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(motDePasse)) {
      Alert.alert(
        'Mot de passe faible',
        'Le mot de passe doit contenir :\n• 1 majuscule\n• 1 minuscule\n• 1 chiffre\n• 1 caractère spécial'
      );
      return false;
    }

    if (motDePasse !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return false;
    }

    // Validation date de naissance (18+ ans)
    const birthDate = new Date(dateNaissance);
    const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    if (age < 18) {
      Alert.alert('Erreur', 'Vous devez avoir au moins 18 ans.');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Log pour debug
      const url = API_CONFIG.ENDPOINTS.AUTH.CREATE_ADMIN_PUBLIC;
      console.log('🔵 URL appelée:', url);
      console.log('🔵 Type de url:', typeof url);
      
      // Utiliser fetch directement pour cette route publique spéciale (SANS préfixe /digitontine)
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_CONFIG.API_KEY,
        },
        body: JSON.stringify({
          prenom: formData.prenom.trim(),
          nom: formData.nom.trim(),
          email: formData.email.toLowerCase().trim(),
          numeroTelephone: formData.numeroTelephone.trim(),
          motDePasse: formData.motDePasse,
          dateNaissance: formData.dateNaissance,
          adresse: formData.adresse.trim() || 'Non spécifiée',
          carteIdentite: formData.carteIdentite.trim() || `TEMP_${Date.now()}`,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert(
          'Succès',
          'Compte administrateur créé avec succès ! Vous pouvez maintenant vous connecter.',
          [
            {
              text: 'OK',
              onPress: () => navigation.replace('Login'),
            },
          ]
        );
      } else {
        Alert.alert(
          'Erreur',
          data.message || 'Impossible de créer le compte.'
        );
      }
    } catch (error) {
      console.error('Erreur register admin:', error);
      Alert.alert('Erreur', 'Une erreur est survenue. Vérifiez votre connexion.');
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

        <Text style={styles.title}>Créer un Admin</Text>
        <Text style={styles.subtitle}>
          Créez le premier compte administrateur de l'application.
        </Text>

        {/* Formulaire */}
        <View style={styles.formContainer}>
          {/* Prénom */}
          <Text style={styles.inputLabel}>Prénom *</Text>
          <TextInput
            style={styles.input}
            placeholder="Votre prénom"
            placeholderTextColor={Colors.placeholder}
            value={formData.prenom}
            onChangeText={(value) => handleChange('prenom', value)}
          />

          {/* Nom */}
          <Text style={styles.inputLabel}>Nom *</Text>
          <TextInput
            style={styles.input}
            placeholder="Votre nom"
            placeholderTextColor={Colors.placeholder}
            value={formData.nom}
            onChangeText={(value) => handleChange('nom', value)}
          />

          {/* Email */}
          <Text style={styles.inputLabel}>Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="admin@digitontine.com"
            placeholderTextColor={Colors.placeholder}
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={(value) => handleChange('email', value)}
          />

          {/* Téléphone */}
          <Text style={styles.inputLabel}>Numéro de téléphone *</Text>
          <TextInput
            style={styles.input}
            placeholder="+221771234567"
            placeholderTextColor={Colors.placeholder}
            keyboardType="phone-pad"
            value={formData.numeroTelephone}
            onChangeText={(value) => handleChange('numeroTelephone', value)}
          />

          {/* Date de naissance */}
          <Text style={styles.inputLabel}>Date de naissance * (AAAA-MM-JJ)</Text>
          <TextInput
            style={styles.input}
            placeholder="1990-01-15"
            placeholderTextColor={Colors.placeholder}
            value={formData.dateNaissance}
            onChangeText={(value) => handleChange('dateNaissance', value)}
          />

          {/* Carte d'identité (optionnel) */}
          <Text style={styles.inputLabel}>Carte d'identité (optionnel)</Text>
          <TextInput
            style={styles.input}
            placeholder="SN1234567890"
            placeholderTextColor={Colors.placeholder}
            value={formData.carteIdentite}
            onChangeText={(value) => handleChange('carteIdentite', value)}
          />

          {/* Adresse (optionnel) */}
          <Text style={styles.inputLabel}>Adresse (optionnel)</Text>
          <TextInput
            style={styles.input}
            placeholder="Dakar, Sénégal"
            placeholderTextColor={Colors.placeholder}
            value={formData.adresse}
            onChangeText={(value) => handleChange('adresse', value)}
          />

          {/* Mot de passe */}
          <Text style={styles.inputLabel}>Mot de passe *</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Min 8 caractères"
              placeholderTextColor={Colors.placeholder}
              secureTextEntry={!showPassword}
              value={formData.motDePasse}
              onChangeText={(value) => handleChange('motDePasse', value)}
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

          {/* Confirmation mot de passe */}
          <Text style={styles.inputLabel}>Confirmer le mot de passe *</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirmez votre mot de passe"
            placeholderTextColor={Colors.placeholder}
            secureTextEntry={!showPassword}
            value={formData.confirmPassword}
            onChangeText={(value) => handleChange('confirmPassword', value)}
          />

          {/* Exigences mot de passe */}
          <View style={styles.passwordRequirements}>
            <Text style={styles.requirementTitle}>Exigences du mot de passe :</Text>
            <Text style={styles.requirement}>• Au moins 8 caractères</Text>
            <Text style={styles.requirement}>• 1 lettre majuscule</Text>
            <Text style={styles.requirement}>• 1 lettre minuscule</Text>
            <Text style={styles.requirement}>• 1 chiffre</Text>
            <Text style={styles.requirement}>• 1 caractère spécial (@$!%*?&)</Text>
          </View>

          {/* Bouton d'inscription */}
          <TouchableOpacity
            style={[styles.registerButton, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.textDark} />
            ) : (
              <>
                <Ionicons
                  name="person-add-outline"
                  size={20}
                  color={Colors.textDark}
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.registerButtonText}>Créer le compte</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Lien vers connexion */}
          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginLinkText}>
              Déjà un compte ? Se connecter
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

RegisterAdminScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
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
    marginBottom: 5,
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
  registerButton: {
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
  registerButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginLinkText: {
    color: Colors.primaryDark,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RegisterAdminScreen;