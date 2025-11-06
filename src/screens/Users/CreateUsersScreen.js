// src/screens/Users/CreateUsersScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import userService from '../../services/user/userService';
import Colors from '../../constants/colors';
import styles from '../../styles/CreateUsersScreenStyles';
import { validateAndCompressImage } from '../../utils/imageUtils';

// Liste des indicatifs pays
const COUNTRY_CODES = [
  { code: '+221', flag: '🇸🇳', name: 'Sénégal', format: '77 123 45 67' },
  { code: '+33', flag: '🇫🇷', name: 'France', format: '6 12 34 56 78' },
  { code: '+225', flag: '🇨🇮', name: 'Côte d\'Ivoire', format: '01 23 45 67 89' },
  { code: '+223', flag: '🇲🇱', name: 'Mali', format: '70 12 34 56' },
  { code: '+226', flag: '🇧🇫', name: 'Burkina Faso', format: '70 12 34 56' },
  { code: '+224', flag: '🇬🇳', name: 'Guinée', format: '601 23 45 67' },
  { code: '+227', flag: '🇳🇪', name: 'Niger', format: '90 12 34 56' },
  { code: '+228', flag: '🇹🇬', name: 'Togo', format: '90 12 34 56' },
  { code: '+229', flag: '🇧🇯', name: 'Bénin', format: '90 12 34 56' },
  { code: '+212', flag: '🇲🇦', name: 'Maroc', format: '6 12 34 56 78' },
  { code: '+213', flag: '🇩🇿', name: 'Algérie', format: '5 12 34 56 78' },
  { code: '+216', flag: '🇹🇳', name: 'Tunisie', format: '20 123 456' },
  { code: '+1', flag: '🇺🇸', name: 'USA/Canada', format: '(202) 555-0123' },
  { code: '+44', flag: '🇬🇧', name: 'Royaume-Uni', format: '7400 123456' },
];

const CreateUsersScreen = ({ navigation }) => {
  const { theme } = useTheme();
  
  // États des champs
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+221');
  const [telephone, setTelephone] = useState('');
  const [adresse, setAdresse] = useState('');
  const [cni, setCni] = useState('');
 // Date par défaut : il y a 25 ans
const getDefaultBirthDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 25);
  return date;
};

const [dateNaissance, setDateNaissance] = useState(getDefaultBirthDate());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [role, setRole] = useState('membre');
  const [photo, setPhoto] = useState(null);
  
  // États de validation
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  // États des modals
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  
  // État général
  const [loading, setLoading] = useState(false);

  /**
   * VALIDATION DES CHAMPS
   */
  const validatePrenom = (value) => {
    if (!value || value.trim() === '') {
      return 'Le prénom est obligatoire';
    }
    if (value.trim().length < 2) {
      return 'Le prénom doit contenir au moins 2 caractères';
    }
    if (!/^[a-zA-ZÀ-ÿ\s\-']+$/.test(value)) {
      return 'Le prénom ne doit contenir que des lettres';
    }
    return null;
  };

  const validateNom = (value) => {
    if (!value || value.trim() === '') {
      return 'Le nom est obligatoire';
    }
    if (value.trim().length < 2) {
      return 'Le nom doit contenir au moins 2 caractères';
    }
    if (!/^[a-zA-ZÀ-ÿ\s\-']+$/.test(value)) {
      return 'Le nom ne doit contenir que des lettres';
    }
    return null;
  };

  const validateEmail = (value) => {
    if (!value || value.trim() === '') {
      return 'L\'email est obligatoire';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Format d\'email invalide';
    }
    return null;
  };

  const validateTelephone = (value) => {
    if (!value || value.trim() === '') {
      return 'Le numéro de téléphone est obligatoire';
    }
    
    // Retirer tous les espaces et caractères non numériques
    const cleanPhone = value.replace(/\s/g, '');
    
    // Validation selon le pays
    if (countryCode === '+221') {
      // Sénégal : 9 chiffres commençant par 7
      if (!/^7[0-9]{8}$/.test(cleanPhone)) {
        return 'Format invalide. Ex: 77 123 45 67';
      }
    } else if (countryCode === '+33') {
      // France : 9 chiffres commençant par 6 ou 7
      if (!/^[67][0-9]{8}$/.test(cleanPhone)) {
        return 'Format invalide. Ex: 6 12 34 56 78';
      }
    } else {
      // Validation générique : entre 8 et 15 chiffres
      if (!/^[0-9]{8,15}$/.test(cleanPhone)) {
        return 'Le numéro doit contenir entre 8 et 15 chiffres';
      }
    }
    
    return null;
  };

  const validateAdresse = (value) => {
    // Adresse obligatoire
    if (!value || value.trim() === '') {
      return 'L\'adresse est obligatoire';
    }
    if (value.trim().length < 2) {
      return 'L\'adresse doit contenir au moins 2 caractères';
    }
    if (value.trim().length > 200) {
      return 'L\'adresse ne doit pas dépasser 200 caractères';
    }
    return null;
  };

  const validateCni = (value) => {
    // CNI obligatoire
    if (!value || value.trim() === '') {
      return 'Le numéro CNI est obligatoire';
    }
    
    // Validation selon le pays
    if (countryCode === '+221') {
      // Format sénégalais : NIN (Numéro d'Identification Nationale) - 13 chiffres uniquement
      // Structure : 1 chiffre (sexe) + 3 chiffres (centre) + 4 chiffres (année) + 5 chiffres (séquence)
      const trimmedValue = value.trim().replace(/[^0-9]/g, ''); // Ne garder que les chiffres
      const senegalPattern = /^[0-9]{13}$/;
      if (!senegalPattern.test(trimmedValue)) {
        return 'Format invalide. Format attendu : 13 chiffres (ex: 1123198000001)';
      }
    } else {
      const trimmedValue = value.trim().toUpperCase();
      // Pour les autres pays : format générique alphanumérique (5-20 caractères)
      if (trimmedValue.length < 5) {
        return 'Le numéro doit contenir au moins 5 caractères';
      }
      if (trimmedValue.length > 20) {
        return 'Le numéro ne peut pas dépasser 20 caractères';
      }
      // Alphanumérique uniquement (lettres majuscules et chiffres)
      const genericPattern = /^[A-Z0-9]+$/;
      if (!genericPattern.test(trimmedValue)) {
        return 'Le numéro ne peut contenir que des lettres majuscules et des chiffres';
      }
    }
    
    return null;
  };

  /**
   * Gestion des changements avec validation
   */
  const handlePrenomChange = (value) => {
    setPrenom(value);
    if (touched.prenom) {
      setErrors({ ...errors, prenom: validatePrenom(value) });
    }
  };

  const handleNomChange = (value) => {
    setNom(value);
    if (touched.nom) {
      setErrors({ ...errors, nom: validateNom(value) });
    }
  };

  const handleEmailChange = (value) => {
    setEmail(value);
    if (touched.email) {
      setErrors({ ...errors, email: validateEmail(value) });
    }
  };

  const handleTelephoneChange = (value) => {
    // Auto-format pour Sénégal
    let formatted = value.replace(/\s/g, '');
    
    if (countryCode === '+221' && formatted.length > 0) {
      // Format: 77 123 45 67
      if (formatted.length > 2) {
        formatted = formatted.slice(0, 2) + ' ' + formatted.slice(2);
      }
      if (formatted.length > 6) {
        formatted = formatted.slice(0, 6) + ' ' + formatted.slice(6);
      }
      if (formatted.length > 9) {
        formatted = formatted.slice(0, 9) + ' ' + formatted.slice(9);
      }
      formatted = formatted.slice(0, 12); // Max: 77 123 45 67
    } else if (countryCode === '+33' && formatted.length > 0) {
      // Format: 6 12 34 56 78
      if (formatted.length > 1) {
        formatted = formatted.slice(0, 1) + ' ' + formatted.slice(1);
      }
      if (formatted.length > 4) {
        formatted = formatted.slice(0, 4) + ' ' + formatted.slice(4);
      }
      if (formatted.length > 7) {
        formatted = formatted.slice(0, 7) + ' ' + formatted.slice(7);
      }
      if (formatted.length > 10) {
        formatted = formatted.slice(0, 10) + ' ' + formatted.slice(10);
      }
      formatted = formatted.slice(0, 13); // Max: 6 12 34 56 78
    } else {
      // Pas de format spécial, juste limiter la longueur
      formatted = formatted.slice(0, 15);
    }
    
    setTelephone(formatted);
    if (touched.telephone) {
      setErrors({ ...errors, telephone: validateTelephone(formatted) });
    }
  };

  const handleAdresseChange = (value) => {
    setAdresse(value);
    if (touched.adresse) {
      setErrors({ ...errors, adresse: validateAdresse(value) });
    }
  };

  const handleCniChange = (value) => {
    let processedValue = value;
    
    // Pour le Sénégal, ne garder que les chiffres et limiter à 13
    if (countryCode === '+221') {
      processedValue = value.replace(/[^0-9]/g, '').slice(0, 13);
    } else {
      // Pour les autres pays, uppercase et garder alphanumérique
      processedValue = value.toUpperCase();
    }
    
    setCni(processedValue);
    if (touched.cni) {
      setErrors({ ...errors, cni: validateCni(processedValue) });
    }
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    
    switch (field) {
      case 'prenom':
        setErrors({ ...errors, prenom: validatePrenom(prenom) });
        break;
      case 'nom':
        setErrors({ ...errors, nom: validateNom(nom) });
        break;
      case 'email':
        setErrors({ ...errors, email: validateEmail(email) });
        break;
      case 'telephone':
        setErrors({ ...errors, telephone: validateTelephone(telephone) });
        break;
      case 'adresse':
        setErrors({ ...errors, adresse: validateAdresse(adresse) });
        break;
      case 'cni':
        setErrors({ ...errors, cni: validateCni(cni) });
        break;
    }
  };

  /**
   * Vérifier si le formulaire est valide
   */
  const isFormValid = () => {
    const prenomError = validatePrenom(prenom);
    const nomError = validateNom(nom);
    const emailError = validateEmail(email);
    const telephoneError = validateTelephone(telephone);
    const adresseError = validateAdresse(adresse);
    const cniError = validateCni(cni);
    
    return !prenomError && !nomError && !emailError && !telephoneError && !adresseError && !cniError;
  };

  /**
   * Sélectionner une photo
   */
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission refusée", "Vous devez autoriser l'accès à vos photos !");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8, // Qualité initiale plus élevée, sera compressée si nécessaire
      mediaTypes: ['images'],
      allowsMultipleSelection: false,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageAsset = result.assets[0];
      
      // Vérifier et compresser l'image si nécessaire
      const validatedImage = await validateAndCompressImage(imageAsset, 'identity');
      
      if (validatedImage) {
        setPhoto(validatedImage);
      }
    }
  };

  /**
   * Retirer la photo
   */
  const removePhoto = () => {
    Alert.alert(
      'Retirer la photo',
      'Voulez-vous retirer la photo sélectionnée ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Retirer', style: 'destructive', onPress: () => setPhoto(null) },
      ]
    );
  };

  /**
   * Gestion du DatePicker
   */
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateNaissance(selectedDate);
    }
  };

  /**
   * Formater la date pour l'affichage
   */
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
  };

  /**
   * Formater la date pour l'envoi (YYYY-MM-DD)
   */
  const formatDateForSubmit = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  /**
   * Sélectionner un indicatif
   */
  const selectCountryCode = (code) => {
    setCountryCode(code);
    setTelephone(''); // Réinitialiser le numéro lors du changement de pays
    setShowCountryModal(false);
    // Revalider la CNI si elle est déjà saisie
    if (cni && touched.cni) {
      setErrors({ ...errors, cni: validateCni(cni) });
    }
  };

  /**
   * Sélectionner un rôle
   */
  const selectRole = (selectedRole) => {
    setRole(selectedRole);
    setShowRoleModal(false);
  };

  /**
   * Obtenir le libellé du rôle
   */
  const getRoleLabel = (roleValue) => {
    return roleValue === 'membre' ? 'Membre' : 'Trésorier';
  };

  /**
   * Obtenir le pays sélectionné
   */
  const getSelectedCountry = () => {
    return COUNTRY_CODES.find(c => c.code === countryCode) || COUNTRY_CODES[0];
  };

  /**
   * Soumettre le formulaire
   */
  const handleSubmit = async () => {
    // Marquer tous les champs comme touchés
    setTouched({
      prenom: true,
      nom: true,
      email: true,
      telephone: true,
      adresse: true,
      cni: true,
    });

    // Valider tous les champs
    const allErrors = {
      prenom: validatePrenom(prenom),
      nom: validateNom(nom),
      email: validateEmail(email),
      telephone: validateTelephone(telephone),
      adresse: validateAdresse(adresse),
      cni: validateCni(cni),
    };

    setErrors(allErrors);

    // Vérifier s'il y a des erreurs
    const hasErrors = Object.values(allErrors).some(error => error !== null);
    if (hasErrors) {
      Alert.alert('Erreur', 'Veuillez corriger les erreurs dans le formulaire.');
      return;
    }

    setLoading(true);

    try {
      // Construire le numéro complet
      const fullPhone = countryCode + telephone.replace(/\s/g, '');
      
      const userData = {
        prenom: prenom.trim(),
        nom: nom.trim(),
        email: email.toLowerCase().trim(),
        numeroTelephone: fullPhone,
        adresse: adresse.trim(), // Adresse obligatoire
        carteIdentite: cni.trim(), // CNI obligatoire
        dateNaissance: formatDateForSubmit(dateNaissance),
      };

      let result;

      if (role === 'membre') {
        result = await userService.createMembre(userData, photo);
      } else {
        result = await userService.createTresorier(userData, photo);
      }

      if (result.success) {
        Alert.alert(
          'Succès',
          `${getRoleLabel(role)} ${prenom} ${nom} créé avec succès !\n\nUn email avec les identifiants de connexion a été envoyé à ${email}.`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        // Message d'erreur plus détaillé
        const errorMessage = result.error?.message || 
                            result.error?.details || 
                            result.error?.error?.message ||
                            result.error?.error ||
                            'Impossible de créer l\'utilisateur.';
        console.error('Erreur création utilisateur:', result.error);
        
        let errorTitle = 'Erreur';
        if (result.error?.code === 'TIMEOUT') {
          errorTitle = 'Erreur de timeout';
        } else if (result.error?.code === 'NETWORK_ERROR') {
          errorTitle = 'Erreur de connexion';
        }
        
        Alert.alert(errorTitle, errorMessage, [{ text: 'OK' }]);
      }
    } catch (error) {
      console.error('Erreur création utilisateur:', error);
      console.error('Erreur stack:', error.stack);
      
      // Message d'erreur plus détaillé
      let errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
      let errorTitle = 'Erreur';
      
      if (error.message) {
        if (error.message.includes('Network request failed') || 
            error.message.includes('timeout') ||
            error.message.includes('TIMEOUT')) {
          errorTitle = 'Erreur de timeout';
          errorMessage = 'La requête a pris trop de temps.\n\nSi vous avez ajouté une image, elle est peut-être trop lourde. Réessayez avec une image plus petite.';
        } else if (error.message.includes('Network') || 
                   error.message.includes('Failed to fetch') ||
                   error.message.includes('NETWORK_ERROR')) {
          errorTitle = 'Erreur de connexion';
          errorMessage = 'Impossible de se connecter au serveur.\n\nVérifiez votre connexion internet.';
        } else if (error.message.includes('JSON') || error.message.includes('parsing')) {
          errorTitle = 'Erreur serveur';
          errorMessage = 'Le serveur a renvoyé une réponse invalide. Veuillez réessayer.';
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert(errorTitle, errorMessage, [{ text: 'OK' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: Platform.OS === 'android' ? 50 : 60,
          marginLeft: 20,
          marginBottom: 10,
        }}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={theme.text} />
        <Text style={{ color: theme.text, fontSize: 16, marginLeft: 5 }}>Retour</Text>
      </TouchableOpacity>

      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: theme.text }]}>Créer un utilisateur</Text>

        {/* Photo de profil (optionnelle) */}
        <View style={styles.imagePicker}>
          {photo ? (
            <View>
              <Image source={{ uri: photo.uri }} style={styles.profileImage} />
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  backgroundColor: Colors.danger,
                  borderRadius: 15,
                  width: 30,
                  height: 30,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={removePhoto}
              >
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: theme.inputBackground,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: theme.border,
                borderStyle: 'dashed',
              }}
              onPress={pickImage}
            >
              <Ionicons name="camera-outline" size={40} color={theme.placeholder} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={pickImage}>
            <Text style={[styles.imageText, { color: theme.placeholder, marginTop: 10 }]}>
              {photo ? 'Changer la photo' : 'Ajouter une photo (optionnel)'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Prénom */}
        <Text style={[styles.label, { color: theme.text }]}>
          Prénom <Text style={{ color: Colors.danger }}>*</Text>
        </Text>
        <View style={{ marginBottom: 15 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.inputBackground,
                  color: theme.text,
                  borderColor: errors.prenom && touched.prenom ? Colors.danger : theme.border,
                  borderWidth: errors.prenom && touched.prenom ? 2 : 1,
                  flex: 1,
                },
              ]}
              placeholder="Entrez le prénom"
              placeholderTextColor={theme.placeholder}
              value={prenom}
              onChangeText={handlePrenomChange}
              onBlur={() => handleBlur('prenom')}
            />
            {prenom && !errors.prenom && (
              <Ionicons 
                name="checkmark-circle" 
                size={24} 
                color={Colors.accentGreen} 
                style={{ position: 'absolute', right: 15 }}
              />
            )}
          </View>
          {errors.prenom && touched.prenom && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
              <Ionicons name="alert-circle" size={16} color={Colors.danger} />
              <Text style={{ color: Colors.danger, fontSize: 13, marginLeft: 5 }}>
                {errors.prenom}
              </Text>
            </View>
          )}
        </View>

        {/* Nom */}
        <Text style={[styles.label, { color: theme.text }]}>
          Nom <Text style={{ color: Colors.danger }}>*</Text>
        </Text>
        <View style={{ marginBottom: 15 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.inputBackground,
                  color: theme.text,
                  borderColor: errors.nom && touched.nom ? Colors.danger : theme.border,
                  borderWidth: errors.nom && touched.nom ? 2 : 1,
                  flex: 1,
                },
              ]}
              placeholder="Entrez le nom"
              placeholderTextColor={theme.placeholder}
              value={nom}
              onChangeText={handleNomChange}
              onBlur={() => handleBlur('nom')}
            />
            {nom && !errors.nom && (
              <Ionicons 
                name="checkmark-circle" 
                size={24} 
                color={Colors.accentGreen} 
                style={{ position: 'absolute', right: 15 }}
              />
            )}
          </View>
          {errors.nom && touched.nom && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
              <Ionicons name="alert-circle" size={16} color={Colors.danger} />
              <Text style={{ color: Colors.danger, fontSize: 13, marginLeft: 5 }}>
                {errors.nom}
              </Text>
            </View>
          )}
        </View>

        {/* Email */}
        <Text style={[styles.label, { color: theme.text }]}>
          Email <Text style={{ color: Colors.danger }}>*</Text>
        </Text>
        <View style={{ marginBottom: 15 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.inputBackground,
                  color: theme.text,
                  borderColor: errors.email && touched.email ? Colors.danger : theme.border,
                  borderWidth: errors.email && touched.email ? 2 : 1,
                  flex: 1,
                },
              ]}
              placeholder="exemple@email.com"
              placeholderTextColor={theme.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={handleEmailChange}
              onBlur={() => handleBlur('email')}
            />
            {email && !errors.email && (
              <Ionicons 
                name="checkmark-circle" 
                size={24} 
                color={Colors.accentGreen} 
                style={{ position: 'absolute', right: 15 }}
              />
            )}
          </View>
          {errors.email && touched.email && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
              <Ionicons name="alert-circle" size={16} color={Colors.danger} />
              <Text style={{ color: Colors.danger, fontSize: 13, marginLeft: 5 }}>
                {errors.email}
              </Text>
            </View>
          )}
        </View>

        {/* Téléphone avec sélecteur d'indicatif */}
        <Text style={[styles.label, { color: theme.text }]}>
          Numéro de téléphone <Text style={{ color: Colors.danger }}>*</Text>
        </Text>
        <View style={{ marginBottom: 15 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* Sélecteur d'indicatif */}
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: theme.inputBackground,
                paddingHorizontal: 12,
                paddingVertical: 12,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: theme.border,
                marginRight: 10,
              }}
              onPress={() => setShowCountryModal(true)}
            >
              <Text style={{ fontSize: 20, marginRight: 5 }}>
                {getSelectedCountry().flag}
              </Text>
              <Text style={{ color: theme.text, fontSize: 15, fontWeight: '600' }}>
                {countryCode}
              </Text>
              <Ionicons name="chevron-down" size={16} color={theme.text} style={{ marginLeft: 5 }} />
            </TouchableOpacity>

            {/* Numéro */}
            <View style={{ flex: 1 }}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.inputBackground,
                    color: theme.text,
                    borderColor: errors.telephone && touched.telephone ? Colors.danger : theme.border,
                    borderWidth: errors.telephone && touched.telephone ? 2 : 1,
                    marginBottom: 0,
                  },
                ]}
                placeholder={getSelectedCountry().format}
                placeholderTextColor={theme.placeholder}
                keyboardType="phone-pad"
                value={telephone}
                onChangeText={handleTelephoneChange}
                onBlur={() => handleBlur('telephone')}
              />
              {telephone && !errors.telephone && (
                <Ionicons 
                  name="checkmark-circle" 
                  size={24} 
                  color={Colors.accentGreen} 
                  style={{ position: 'absolute', right: 15, top: 12 }}
                />
              )}
            </View>
          </View>
          {errors.telephone && touched.telephone && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
              <Ionicons name="alert-circle" size={16} color={Colors.danger} />
              <Text style={{ color: Colors.danger, fontSize: 13, marginLeft: 5 }}>
                {errors.telephone}
              </Text>
            </View>
          )}
        </View>

        {/* Date de naissance */}
        <Text style={[styles.label, { color: theme.text }]}>
          Date de naissance <Text style={{ color: Colors.danger }}>*</Text>
        </Text>
        <TouchableOpacity
          style={[
            styles.roleSelector,
            { backgroundColor: theme.inputBackground, marginBottom: 15 },
          ]}
          onPress={() => setShowDatePicker(true)}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="calendar-outline" size={20} color={theme.text} style={{ marginRight: 10 }} />
            <Text style={[styles.roleSelectorText, { color: theme.text }]}>
              {formatDate(dateNaissance)}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={20} color={theme.text} />
        </TouchableOpacity>

        {/* DatePicker */}
        {showDatePicker && (
          <DateTimePicker
            value={dateNaissance}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            maximumDate={new Date()}
            minimumDate={new Date(1900, 0, 1)}
          />
        )}

        {/* Adresse (obligatoire) */}
        <Text style={[styles.label, { color: theme.text }]}>
          Adresse <Text style={{ color: Colors.danger, fontSize: 13 }}>*</Text>
        </Text>
        <View style={{ marginBottom: 15 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.inputBackground,
                  color: theme.text,
                  borderColor: errors.adresse && touched.adresse ? Colors.danger : theme.border,
                  borderWidth: errors.adresse && touched.adresse ? 2 : 1,
                  flex: 1,
                  height: 80,
                  textAlignVertical: 'top',
                  paddingTop: 12,
                },
              ]}
              placeholder="Votre adresse complète"
              placeholderTextColor={theme.placeholder}
              multiline
              numberOfLines={3}
              value={adresse}
              onChangeText={handleAdresseChange}
              onBlur={() => handleBlur('adresse')}
            />
            {adresse && !errors.adresse && (
              <Ionicons 
                name="checkmark-circle" 
                size={24} 
                color={Colors.accentGreen} 
                style={{ position: 'absolute', right: 15, top: 12 }}
              />
            )}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
            {errors.adresse && touched.adresse ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="alert-circle" size={16} color={Colors.danger} />
                <Text style={{ color: Colors.danger, fontSize: 13, marginLeft: 5 }}>
                  {errors.adresse}
                </Text>
              </View>
            ) : (
              <View />
            )}
            <Text style={{ color: theme.placeholder, fontSize: 12 }}>
              {adresse.length}/200
            </Text>
          </View>
        </View>

        {/* CNI (obligatoire) */}
        <Text style={[styles.label, { color: theme.text }]}>
          Numéro CNI <Text style={{ color: Colors.danger }}>*</Text>
        </Text>
        <View style={{ marginBottom: 15 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.inputBackground,
                  color: theme.text,
                  borderColor: errors.cni && touched.cni ? Colors.danger : theme.border,
                  borderWidth: errors.cni && touched.cni ? 2 : 1,
                  flex: 1,
                },
              ]}
              placeholder={countryCode === '+221' ? '1123198000001' : 'Numéro de la carte d\'identité'}
              placeholderTextColor={theme.placeholder}
              keyboardType={countryCode === '+221' ? 'numeric' : 'default'}
              autoCapitalize={countryCode === '+221' ? 'none' : 'characters'}
              value={cni}
              onChangeText={handleCniChange}
              onBlur={() => handleBlur('cni')}
            />
            {cni && !errors.cni && (
              <Ionicons 
                name="checkmark-circle" 
                size={24} 
                color={Colors.accentGreen} 
                style={{ position: 'absolute', right: 15 }}
              />
            )}
          </View>
          {errors.cni && touched.cni && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
              <Ionicons name="alert-circle" size={16} color={Colors.danger} />
              <Text style={{ color: Colors.danger, fontSize: 13, marginLeft: 5 }}>
                {errors.cni}
              </Text>
            </View>
          )}
        </View>

        {/* Sélection de rôle */}
        <Text style={[styles.label, { color: theme.text }]}>
          Rôle <Text style={{ color: Colors.danger }}>*</Text>
        </Text>
        <TouchableOpacity
          style={[styles.roleSelector, { backgroundColor: theme.inputBackground, marginBottom: 20 }]}
          onPress={() => setShowRoleModal(true)}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons 
              name={role === 'membre' ? 'person-outline' : 'shield-checkmark-outline'} 
              size={20} 
              color={theme.text} 
              style={{ marginRight: 10 }}
            />
            <Text style={[styles.roleSelectorText, { color: theme.text }]}>
              {getRoleLabel(role)}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={20} color={theme.text} />
        </TouchableOpacity>

        {/* Bouton de soumission */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!isFormValid() || loading) && { opacity: 0.6, backgroundColor: theme.placeholder },
          ]}
          onPress={handleSubmit}
          disabled={!isFormValid() || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="person-add-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.submitText}>Créer l'utilisateur</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Info champs obligatoires */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 20 }}>
          <Text style={{ color: Colors.danger, fontSize: 16, marginRight: 5 }}>*</Text>
          <Text style={{ color: theme.placeholder, fontSize: 13 }}>
            Champs obligatoires
          </Text>
        </View>
      </ScrollView>

      {/* Modal de sélection d'indicatif */}
      <Modal
        visible={showCountryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCountryModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCountryModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.surface, maxHeight: '70%' }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Sélectionner un pays
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {COUNTRY_CODES.map((country) => (
                <TouchableOpacity
                  key={country.code}
                  style={[
                    styles.modalOption,
                    countryCode === country.code && styles.modalOptionSelected,
                  ]}
                  onPress={() => selectCountryCode(country.code)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Text style={{ fontSize: 24, marginRight: 10 }}>{country.flag}</Text>
                    <View>
                      <Text
                        style={[
                          styles.modalOptionText,
                          { color: theme.text },
                          countryCode === country.code && styles.modalOptionTextSelected,
                        ]}
                      >
                        {country.name}
                      </Text>
                      <Text style={{ color: theme.placeholder, fontSize: 12 }}>
                        {country.code} • {country.format}
                      </Text>
                    </View>
                  </View>
                  {countryCode === country.code && (
                    <Ionicons name="checkmark-circle" size={24} color={Colors.primaryDark} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowCountryModal(false)}
            >
              <Text style={[styles.modalCancelText, { color: theme.text }]}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal de sélection de rôle */}
      <Modal
        visible={showRoleModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRoleModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowRoleModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Sélectionner un rôle
            </Text>

            <TouchableOpacity
              style={[styles.modalOption, role === 'membre' && styles.modalOptionSelected]}
              onPress={() => selectRole('membre')}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Ionicons 
                  name="person-outline" 
                  size={24} 
                  color={role === 'membre' ? Colors.primaryDark : theme.text} 
                  style={{ marginRight: 10 }}
                />
                <View>
                  <Text
                    style={[
                      styles.modalOptionText,
                      { color: theme.text },
                      role === 'membre' && styles.modalOptionTextSelected,
                    ]}
                  >
                    Membre
                  </Text>
                  <Text style={{ color: theme.placeholder, fontSize: 12 }}>
                    Utilisateur standard
                  </Text>
                </View>
              </View>
              {role === 'membre' && (
                <Ionicons name="checkmark-circle" size={24} color={Colors.primaryDark} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalOption, role === 'tresorier' && styles.modalOptionSelected]}
              onPress={() => selectRole('tresorier')}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Ionicons 
                  name="shield-checkmark-outline" 
                  size={24} 
                  color={role === 'tresorier' ? Colors.primaryDark : theme.text} 
                  style={{ marginRight: 10 }}
                />
                <View>
                  <Text
                    style={[
                      styles.modalOptionText,
                      { color: theme.text },
                      role === 'tresorier' && styles.modalOptionTextSelected,
                    ]}
                  >
                    Trésorier
                  </Text>
                  <Text style={{ color: theme.placeholder, fontSize: 12 }}>
                    Privilèges de validation
                  </Text>
                </View>
              </View>
              {role === 'tresorier' && (
                <Ionicons name="checkmark-circle" size={24} color={Colors.primaryDark} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowRoleModal(false)}
            >
              <Text style={[styles.modalCancelText, { color: theme.text }]}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default CreateUsersScreen;