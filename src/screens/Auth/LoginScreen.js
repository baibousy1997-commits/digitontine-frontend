import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../../constants/colors';

const { width } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  // Champs communs
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');

  // Champs inscription
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [cni, setCni] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [address, setAddress] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Identifiants fictifs pour la connexion
  const FAKE_PHONE = '+221771234567';
  const FAKE_PASSWORD = 'passer123';

  const handleAuth = async () => {
    if (isLogin) {
      if (!phoneNumber.trim() || !password.trim()) {
        Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
        return;
      }

      // Vérification des identifiants
      if (phoneNumber.trim() === FAKE_PHONE && password.trim() === FAKE_PASSWORD) {
        try {
          // Simulation d'un token
          const fakeToken = 'abc123xyz';
          await AsyncStorage.setItem('userToken', fakeToken);

          Alert.alert('Succès', 'Connexion réussie !', [
            {
              text: 'OK',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Main' }],
                });
              }
            }
          ]);
        } catch (error) {
          console.log('Erreur Auth:', error);
          Alert.alert('Erreur', 'Une erreur est survenue, réessayez.');
        }
      } else {
        Alert.alert(
          'Identifiants incorrects', 
          'Numéro de téléphone ou mot de passe incorrect.\n\nTest avec:\nTél: +221771234567\nMot de passe: passer123'
        );
      }
    } else {
      // Vérifications simples pour l'inscription
      if (!firstName || !lastName || !email || !phoneNumber || !cni || !birthDate || !address || !password || !confirmPassword) {
        Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
        return;
      }

      // Inscription fictive
      Alert.alert('Inscription', 'Compte créé avec succès ! Connectez-vous.', [
        {
          text: 'OK',
          onPress: () => setIsLogin(true)
        }
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.appTitle}>DigiTontine</Text>
        <Text style={styles.appSubtitle}>Votre tontine, simplifiée et sécurisée.</Text>
        
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
            <Text style={styles.welcomeText}>Ravi de vous revoir !</Text>
            
            

            <Text style={styles.inputLabel}>Numéro de téléphone</Text>
            <TextInput
              style={styles.input}
              placeholder="+221 7X XXX XX XX"
              placeholderTextColor={Colors.placeholder}
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
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

            <TouchableOpacity style={styles.loginButton} onPress={handleAuth}>
              <Ionicons name="log-in-outline" size={20} color={Colors.textDark} style={{ marginRight: 8 }} />
              <Text style={styles.loginButtonText}>Se Connecter</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={{ marginTop: 40 }}>
            <Text style={styles.welcomeText}>Créer votre compte</Text>

            {/* Prénom */}
            <Text style={styles.inputLabel}>Prénom</Text>
            <TextInput
              style={styles.input}
              placeholder="Votre prénom"
              value={firstName}
              onChangeText={setFirstName}
            />

            {/* Nom */}
            <Text style={styles.inputLabel}>Nom</Text>
            <TextInput
              style={styles.input}
              placeholder="Votre nom"
              value={lastName}
              onChangeText={setLastName}
            />

            {/* Email */}
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="exemple@email.com"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            {/* Numéro de téléphone */}
            <Text style={styles.inputLabel}>Numéro de téléphone</Text>
            <TextInput
              style={styles.input}
              placeholder="+221 7X XXX XX XX"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />

            {/* CNI */}
            <Text style={styles.inputLabel}>CNI (Format sénégalais)</Text>
            <TextInput
              style={styles.input}
              placeholder="1234567890"
              keyboardType="numeric"
              value={cni}
              onChangeText={setCni}
            />

            {/* Date de naissance */}
            <Text style={styles.inputLabel}>Date de naissance</Text>
            <TextInput
              style={styles.input}
              placeholder="JJ/MM/AAAA"
              value={birthDate}
              onChangeText={setBirthDate}
            />

            {/* Adresse */}
            <Text style={styles.inputLabel}>Adresse</Text>
            <TextInput
              style={styles.input}
              placeholder="Votre adresse"
              value={address}
              onChangeText={setAddress}
            />

            {/* Photo de profil */}
            <Text style={styles.inputLabel}>Photo de profil (optionnel)</Text>
            <TouchableOpacity
              style={styles.photoUploadButton}
              onPress={() => alert('Fonctionnalité upload photo')}
            >
              <Ionicons name="camera-outline" size={20} color={Colors.placeholder} />
              <Text style={styles.photoUploadText}>Ajouter une photo</Text>
            </TouchableOpacity>

            {/* Mot de passe */}
            <Text style={styles.inputLabel}>Mot de passe</Text>
            <TextInput
              style={styles.input}
              placeholder="Choisissez un mot de passe"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {/* Confirmation mot de passe */}
            <Text style={styles.inputLabel}>Confirmer le mot de passe</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirmez votre mot de passe"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            {/* Bouton s'inscrire */}
            <TouchableOpacity style={styles.loginButton} onPress={handleAuth}>
              <Ionicons name="person-add-outline" size={20} color={Colors.textDark} style={{ marginRight: 8 }} />
              <Text style={styles.loginButtonText}>S'inscrire</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

LoginScreen.propTypes = {
  navigation: PropTypes.shape({
    replace: PropTypes.func.isRequired,
    reset: PropTypes.func.isRequired,
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
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 20,
  },
  testInfoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f4fd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primaryDark,
  },
  testInfoText: {
    fontSize: 13,
    color: Colors.primaryDark,
    marginLeft: 8,
    fontWeight: '500',
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
    marginTop: 10,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  photoUploadButton: {
    flexDirection: 'row',
    backgroundColor: Colors.inputBackground,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  photoUploadText: {
    color: Colors.placeholder,
    fontSize: 16,
    marginLeft: 8,
  },
});

export default LoginScreen;