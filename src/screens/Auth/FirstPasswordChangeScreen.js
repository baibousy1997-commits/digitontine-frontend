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

  const validatePassword = () => {
    if (!oldPassword.trim()) {
      Alert.alert('Erreur', 'Le mot de passe actuel est manquant. Veuillez vous reconnecter.');
      return false;
    }

    if (!newPassword.trim() || newPassword.length < 8) {
      Alert.alert('Erreur', 'Le nouveau mot de passe doit contenir au moins 8 caracteres.');
      return false;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return false;
    }

    if (oldPassword === newPassword) {
      Alert.alert('Erreur', 'Le nouveau mot de passe doit etre different de l\'ancien.');
      return false;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      Alert.alert(
        'Mot de passe faible',
        'Le mot de passe doit contenir :\n- Au moins 8 caracteres\n- 1 majuscule\n- 1 minuscule\n- 1 chiffre\n- 1 caractere special (@$!%*?&)'
      );
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
      
      Alert.alert(
        'Succes',
        'Votre mot de passe a ete change avec succes. Vous allez etre deconnecte.Verifier votre email pour confirmer Reconnectez-vous avec votre nouveau mot de passe.',
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
      setLoading(false);
      Alert.alert(
        'Erreur',
        result.error?.message || 'Impossible de changer le mot de passe.'
      );
    }
  } catch (error) {
    console.error('Erreur first password change:', error);
    setLoading(false);
    Alert.alert('Erreur', 'Une erreur est survenue. Reessayez.');
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
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Minimum 8 caracteres"
              placeholderTextColor={Colors.placeholder}
              secureTextEntry={!showPasswords}
              value={newPassword}
              onChangeText={setNewPassword}
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

          <Text style={styles.inputLabel}>Confirmer le mot de passe</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirmez votre nouveau mot de passe"
            placeholderTextColor={Colors.placeholder}
            secureTextEntry={!showPasswords}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <View style={styles.passwordRequirements}>
            <Text style={styles.requirementTitle}>Exigences du mot de passe :</Text>
            <Text style={styles.requirement}>- Au moins 8 caracteres</Text>
            <Text style={styles.requirement}>- 1 lettre majuscule</Text>
            <Text style={styles.requirement}>- 1 lettre minuscule</Text>
            <Text style={styles.requirement}>- 1 chiffre</Text>
            <Text style={styles.requirement}>- 1 caractere special (@$!%*?&)</Text>
          </View>

          <View style={styles.warningBox}>
            <Ionicons name="alert-circle-outline" size={24} color="#d32f2f" />
            <View style={styles.warningTextContainer}>
              <Text style={styles.warningTitle}>Important</Text>
              <Text style={styles.warningText}>
                Apres validation, vous serez automatiquement redirige vers votre espace avec votre nouveau mot de passe.
              </Text>
            </View>
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
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 20,
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