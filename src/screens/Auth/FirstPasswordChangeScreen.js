// src/screens/Auth/FirstPasswordChangeScreen.js
/**
 * Écran de changement de mot de passe OBLIGATOIRE
 * Après première connexion avec mot de passe temporaire
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
import authService from '../../services/auth/authService';
import Colors from '../../constants/colors';

const FirstPasswordChangeScreen = ({ navigation }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);

  const validatePassword = () => {
    if (!oldPassword.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir votre mot de passe actuel.');
      return false;
    }

    if (!newPassword.trim() || newPassword.length < 8) {
      Alert.alert('Erreur', 'Le nouveau mot de passe doit contenir au moins 8 caractères.');
      return false;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return false;
    }

    if (oldPassword === newPassword) {
      Alert.alert('Erreur', 'Le nouveau mot de passe doit être différent de l\'ancien.');
      return false;
    }

    // Validation force du mot de passe
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      Alert.alert(
        'Mot de passe faible',
        'Le mot de passe doit contenir :\n• Au moins 8 caractères\n• 1 majuscule\n• 1 minuscule\n• 1 chiffre\n• 1 caractère spécial (@$!%*?&)'
      );
      return false;
    }

    return true;
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;

    setLoading(true);

    try {
      const result = await authService.firstPasswordChange(oldPassword, newPassword);

      if (result.success) {
        Alert.alert(
          'Email de confirmation envoyé',
          'Un email vous a été envoyé. Veuillez confirmer le changement de mot de passe pour accéder à l\'application.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Déconnecter et rediriger vers login
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              },
            },
          ]
        );
      } else {
        Alert.alert(
          'Erreur',
          result.error?.message || 'Impossible de changer le mot de passe.'
        );
      }
    } catch (error) {
      console.error('Erreur first password change:', error);
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
        {/* Header avec icône attention */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="warning-outline" size={60} color={Colors.accentYellow} />
          </View>
          <Text style={styles.title}>Changement obligatoire</Text>
          <Text style={styles.subtitle}>
            Pour des raisons de sécurité, vous devez changer votre mot de passe temporaire.
          </Text>
        </View>

        {/* Formulaire */}
        <View style={styles.formContainer}>
          {/* Ancien mot de passe */}
          <Text style={styles.inputLabel}>Mot de passe actuel</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Mot de passe temporaire"
              placeholderTextColor={Colors.placeholder}
              secureTextEntry={!showPasswords}
              value={oldPassword}
              onChangeText={setOldPassword}
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

          {/* Nouveau mot de passe */}
          <Text style={styles.inputLabel}>Nouveau mot de passe</Text>
          <TextInput
            style={styles.input}
            placeholder="Minimum 8 caractères"
            placeholderTextColor={Colors.placeholder}
            secureTextEntry={!showPasswords}
            value={newPassword}
            onChangeText={setNewPassword}
          />

          {/* Confirmation */}
          <Text style={styles.inputLabel}>Confirmer le mot de passe</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirmez votre nouveau mot de passe"
            placeholderTextColor={Colors.placeholder}
            secureTextEntry={!showPasswords}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          {/* Exigences */}
          <View style={styles.passwordRequirements}>
            <Text style={styles.requirementTitle}>Exigences du mot de passe :</Text>
            <Text style={styles.requirement}>• Au moins 8 caractères</Text>
            <Text style={styles.requirement}>• 1 lettre majuscule</Text>
            <Text style={styles.requirement}>• 1 lettre minuscule</Text>
            <Text style={styles.requirement}>• 1 chiffre</Text>
            <Text style={styles.requirement}>• 1 caractère spécial (@$!%*?&)</Text>
          </View>

          {/* Info importante */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color={Colors.primaryDark} />
            <Text style={styles.infoText}>
              Après validation, un email de confirmation vous sera envoyé. Vous devrez confirmer
              le changement pour vous connecter.
            </Text>
          </View>

          {/* Bouton de validation */}
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
    reset: PropTypes.func.isRequired,
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
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#fff4e6',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textDark,
    marginLeft: 10,
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