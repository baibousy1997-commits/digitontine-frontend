// src/screens/Auth/RegisterAdminScreen.js
import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Button,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import API_CONFIG from '../../config/api.config';
import Colors from '../../constants/colors';

// Indicatifs téléphoniques
const COUNTRY_CODES = [
  { code: '+221', country: 'Sénégal', length: 9 },
  { code: '+33', country: 'France', length: 9 },
  { code: '+225', country: "Côte d'Ivoire", length: 10 },
  { code: '+223', country: 'Mali', length: 8 },
  { code: '+226', country: 'Burkina Faso', length: 8 },
];

const RegisterAdminScreen = ({ navigation }) => {
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [numeroTelephone, setNumeroTelephone] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateNaissance, setDateNaissance] = useState(null); // Date object
  const [adresse, setAdresse] = useState('');
  const [carteIdentite, setCarteIdentite] = useState('');

  const [selectedCountryCode, setSelectedCountryCode] = useState(COUNTRY_CODES[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // === OUVRIR LE CALENDRIER ===
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dateNaissance;
    setShowDatePicker(Platform.OS === 'ios');
    setDateNaissance(currentDate);
  };

  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  // Formatage pour affichage
  const formatDate = (date) => {
    if (!date) return 'Sélectionner une date';
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // === TÉLÉPHONE ===
  const handlePhoneChange = useCallback(
    (value) => {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length <= selectedCountryCode.length) {
        setNumeroTelephone(cleaned);
      }
    },
    [selectedCountryCode.length]
  );

  const handleCountrySelect = useCallback((country) => {
    setSelectedCountryCode(country);
    setShowCountryPicker(false);
    setNumeroTelephone('');
  }, []);

  // === VALIDATION ===
  const validateForm = () => {
    if (!prenom || !nom || !email || !numeroTelephone || !motDePasse || !dateNaissance || !carteIdentite) {
      Alert.alert('Erreur', 'Tous les champs obligatoires doivent être remplis.');
      return false;
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Erreur', 'Email invalide.');
      return false;
    }

    // Téléphone
    if (numeroTelephone.length !== selectedCountryCode.length) {
      Alert.alert('Erreur', `Le numéro doit contenir ${selectedCountryCode.length} chiffres.`);
      return false;
    }

    // Date de naissance
    const today = new Date();
    const age = Math.floor((today - dateNaissance) / (365.25 * 24 * 60 * 60 * 1000));
    if (age < 18) {
      Alert.alert('Erreur', 'Vous devez avoir au moins 18 ans.');
      return false;
    }

    // Mot de passe
    if (motDePasse.length < 8) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 8 caractères.');
      return false;
    }

    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!pwdRegex.test(motDePasse)) {
      Alert.alert(
        'Mot de passe faible',
        'Requis : majuscule, minuscule, chiffre, caractère spécial (@$!%*?&).'
      );
      return false;
    }

    if (motDePasse !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return false;
    }

    return true;
  };

  // === SOUMISSION ===
  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const fullPhone = selectedCountryCode.code + numeroTelephone;
      const formattedDate = formatDate(dateNaissance);

      const response = await fetch(API_CONFIG.ENDPOINTS.AUTH.CREATE_ADMIN_PUBLIC, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': API_CONFIG.API_KEY,
        },
        body: JSON.stringify({
          prenom: prenom.trim(),
          nom: nom.trim(),
          email: email.toLowerCase().trim(),
          numeroTelephone: fullPhone,
          motDePasse,
          dateNaissance: formattedDate,
          adresse: adresse.trim() || 'Non spécifiée',
          carteIdentite: carteIdentite.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert('Succès', 'Compte admin créé !', [
          { text: 'OK', onPress: () => navigation.replace('Login') },
        ]);
      } else {
        Alert.alert('Erreur', data.message || 'Échec de création.');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Bouton retour */}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.primaryDark} />
          </TouchableOpacity>

          <Text style={styles.title}>Créer un Admin</Text>
          <Text style={styles.subtitle}>Premier compte administrateur</Text>

          <View style={styles.formContainer}>
            {/* Prénom */}
            <Text style={styles.label}>Prénom *</Text>
            <TextInput style={styles.input} value={prenom} onChangeText={setPrenom} placeholder="Prénom" />

            {/* Nom */}
            <Text style={styles.label}>Nom *</Text>
            <TextInput style={styles.input} value={nom} onChangeText={setNom} placeholder="Nom" />

            {/* Email */}
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="admin@digitontine.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Téléphone */}
            <Text style={styles.label}>Téléphone *</Text>
            <View style={styles.phoneRow}>
              <TouchableOpacity
                style={styles.codeBtn}
                onPress={() => setShowCountryPicker(!showCountryPicker)}
              >
                <Text style={styles.codeText}>{selectedCountryCode.code}</Text>
                <Ionicons name="chevron-down" size={18} color={Colors.textDark} />
              </TouchableOpacity>
              <TextInput
                style={styles.phoneInput}
                value={numeroTelephone}
                onChangeText={handlePhoneChange}
                placeholder={'7'.repeat(selectedCountryCode.length)}
                keyboardType="phone-pad"
                maxLength={selectedCountryCode.length}
              />
            </View>

            {/* Picker pays */}
            {showCountryPicker && (
              <View style={styles.picker}>
                {COUNTRY_CODES.map((c) => (
                  <TouchableOpacity
                    key={c.code}
                    style={styles.pickerItem}
                    onPress={() => handleCountrySelect(c)}
                  >
                    <Text style={styles.pickerText}>{c.country} {c.code}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* === CALENDRIER === */}
            <Text style={styles.label}>Date de naissance *</Text>
            <TouchableOpacity style={styles.dateButton} onPress={openDatePicker}>
              <Text style={styles.dateText}>{formatDate(dateNaissance)}</Text>
              <Ionicons name="calendar-outline" size={20} color={Colors.textDark} />
            </TouchableOpacity>
            <Text style={styles.helper}>Entre 2000 et aujourd'hui (18 ans min)</Text>

            {showDatePicker && (
              <DateTimePicker
                value={dateNaissance || new Date(2000, 0, 1)}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                maximumDate={new Date()} // Aujourd'hui
                minimumDate={new Date(1900, 0, 1)} // On limite via validation
              />
            )}

            {/* Carte d'identité */}
            <Text style={styles.label}>Carte d'identité *</Text>
            <TextInput
              style={styles.input}
              value={carteIdentite}
              onChangeText={setCarteIdentite}
              placeholder="" // Vide
            />

            {/* Adresse */}
            <Text style={styles.label}>Adresse *</Text>
            <TextInput
              style={styles.input}
              value={adresse}
              onChangeText={setAdresse}
              placeholder="Dakar, Sénégal"
            />

            {/* Mot de passe */}
            <Text style={styles.label}>Mot de passe *</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={styles.passwordInput}
                value={motDePasse}
                onChangeText={setMotDePasse}
                placeholder="8+ caractères"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eye}>
                <Ionicons
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={24}
                  color={Colors.placeholder}
                />
              </TouchableOpacity>
            </View>

            {/* Confirmation */}
            <Text style={styles.label}>Confirmer *</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Répétez le mot de passe"
              secureTextEntry={!showPassword}
            />

            {/* Règles */}
            <View style={styles.rules}>
              <Text style={styles.ruleTitle}>Mot de passe :</Text>
              <Text style={styles.rule}>• 8 caractères min</Text>
              <Text style={styles.rule}>• 1 majuscule</Text>
              <Text style={styles.rule}>• 1 minuscule</Text>
              <Text style={styles.rule}>• 1 chiffre</Text>
              <Text style={styles.rule}>• 1 spécial (@$!%*?&)</Text>
            </View>

            {/* Bouton */}
            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <>
                  <Ionicons name="person-add" size={20} color="#000" style={{ marginRight: 8 }} />
                  <Text style={styles.btnText}>Créer le compte</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.linkText}>Déjà un compte ? Se connecter</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterAdminScreen;

// === STYLES ===
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40,
    paddingBottom: 120,
  },
  backButton: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#000', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#555', marginBottom: 30 },

  formContainer: { width: '100%' },
  label: { fontSize: 16, fontWeight: '600', color: '#000', marginBottom: 8 },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
    marginBottom: 16,
  },
  helper: { fontSize: 13, color: '#666', marginBottom: 16, fontStyle: 'italic' },

  // === DATEPICKER BUTTON ===
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    color: '#000',
  },

  phoneRow: { flexDirection: 'row', marginBottom: 16 },
  codeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 15,
    marginRight: 10,
  },
  codeText: { fontSize: 16, fontWeight: '600', color: '#000', marginRight: 5 },
  phoneInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
  },

  picker: { backgroundColor: '#f5f5f5', borderRadius: 10, marginBottom: 16, padding: 10 },
  pickerItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  pickerText: { fontSize: 15, color: '#000' },

  passwordRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 10, marginBottom: 16 },
  passwordInput: { flex: 1, paddingHorizontal: 15, paddingVertical: 15, fontSize: 16 },
  eye: { padding: 10 },

  rules: { backgroundColor: '#e8f4fd', borderRadius: 10, padding: 15, marginBottom: 20 },
  ruleTitle: { fontSize: 14, fontWeight: '600', color: '#000', marginBottom: 8 },
  rule: { fontSize: 13, color: '#000', marginBottom: 4 },

  btn: {
    flexDirection: 'row',
    backgroundColor: '#FFD700',
    borderRadius: 10,
    paddingVertical: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { fontSize: 18, fontWeight: 'bold', color: '#000' },

  link: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#0066CC', fontSize: 16, fontWeight: '600' },
});