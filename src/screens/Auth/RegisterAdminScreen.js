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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import API_CONFIG from '../../config/api.config';
import Colors from '../../constants/colors';
import { validateAndCompressImage } from '../../utils/imageUtils';

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
  const [photoIdentite, setPhotoIdentite] = useState(null);

  const [selectedCountryCode, setSelectedCountryCode] = useState(COUNTRY_CODES[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // États pour validation visuelle
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // === OUVRIR LE CALENDRIER ===
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dateNaissance;
    setShowDatePicker(Platform.OS === 'ios');
    setDateNaissance(currentDate);
    // La validation sera faite dans handleBlur ou validateForm
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
    // Revalider la carte d'identité si elle est déjà saisie
    // Note: on utilise la fonction directement car elle utilise selectedCountryCode qui sera mis à jour
    setErrors(prevErrors => {
      if (carteIdentite && touched.carteIdentite) {
        // On valide avec le nouveau pays (country.code)
        const tempValue = carteIdentite;
        const trimmedValue = tempValue.trim().toUpperCase();
        let error = null;
        
        if (country.code === '+221') {
          // Format sénégalais : NIN (Numéro d'Identification Nationale) - 13 chiffres uniquement
          const cleanValue = tempValue.trim().replace(/[^0-9]/g, ''); // Ne garder que les chiffres
          const senegalPattern = /^[0-9]{13}$/;
          if (!senegalPattern.test(cleanValue)) {
            error = 'Format invalide. Format attendu : 13 chiffres (ex: 1123198000001)';
          }
        } else {
          const trimmedValue = tempValue.trim().toUpperCase();
          if (trimmedValue.length < 5) {
            error = 'Le numéro doit contenir au moins 5 caractères';
          } else if (trimmedValue.length > 20) {
            error = 'Le numéro ne peut pas dépasser 20 caractères';
          } else {
            const genericPattern = /^[A-Z0-9]+$/;
            if (!genericPattern.test(trimmedValue)) {
              error = 'Le numéro ne peut contenir que des lettres majuscules et des chiffres';
            }
          }
        }
        
        return { ...prevErrors, carteIdentite: error };
      }
      return prevErrors;
    });
  }, [carteIdentite, touched.carteIdentite]);

  // === SÉLECTION PHOTO D'IDENTITÉ ===
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission refusée", "Vous devez autoriser l'accès à vos photos !");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 5], // Ratio portrait pour photo d'identité
      quality: 0.8, // Qualité initiale plus élevée, sera compressée si nécessaire
      mediaTypes: ['images'],
      allowsMultipleSelection: false,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageAsset = result.assets[0];
      
      // Vérifier et compresser l'image si nécessaire
      const validatedImage = await validateAndCompressImage(imageAsset, 'identity');
      
      if (validatedImage) {
        setPhotoIdentite(validatedImage);
      }
    }
  };

  const removePhoto = () => {
    Alert.alert(
      'Retirer la photo',
      'Voulez-vous retirer la photo sélectionnée ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Retirer', style: 'destructive', onPress: () => setPhotoIdentite(null) },
      ]
    );
  };

  // === VALIDATION ===
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
    const cleanPhone = value.replace(/\s/g, '');
    if (cleanPhone.length !== selectedCountryCode.length) {
      return `Le numéro doit contenir ${selectedCountryCode.length} chiffres`;
    }
    if (!/^[0-9]+$/.test(cleanPhone)) {
      return 'Le numéro ne doit contenir que des chiffres';
    }
    return null;
  };

  const validateDateNaissance = (value) => {
    if (!value) {
      return 'La date de naissance est obligatoire';
    }
    const today = new Date();
    const age = Math.floor((today - value) / (365.25 * 24 * 60 * 60 * 1000));
    if (age < 18) {
      return 'Vous devez avoir au moins 18 ans';
    }
    return null;
  };

  const validateCarteIdentite = (value) => {
    if (!value || value.trim() === '') {
      return 'La carte d\'identité est obligatoire';
    }
    
    // Validation selon le pays
    if (selectedCountryCode.code === '+221') {
      // Format sénégalais : NIN (Numéro d'Identification Nationale) - 13 chiffres uniquement
      // Structure : 1 chiffre (sexe) + 3 chiffres (centre) + 4 chiffres (année) + 5 chiffres (séquence)
      const trimmedValue = value.trim().replace(/[^0-9]/g, ''); // Ne garder que les chiffres
      const senegalPattern = /^[0-9]{13}$/;
      if (!senegalPattern.test(trimmedValue)) {
        return 'Format invalide. Format attendu : 13 chiffres (ex: 1123198000001)';
      }
    } else {
      // Pour les autres pays : format générique alphanumérique (5-20 caractères)
      const trimmedValue = value.trim().toUpperCase();
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

  const validateMotDePasse = (value) => {
    if (!value || value.trim() === '') {
      return 'Le mot de passe est obligatoire';
    }
    if (value.length < 8) {
      return 'Le mot de passe doit contenir au moins 8 caractères';
    }
    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!pwdRegex.test(value)) {
      return 'Requis : majuscule, minuscule, chiffre, caractère spécial (@$!%*?&)';
    }
    return null;
  };

  const validateConfirmPassword = (value) => {
    if (!value || value.trim() === '') {
      return 'La confirmation est obligatoire';
    }
    if (value !== motDePasse) {
      return 'Les mots de passe ne correspondent pas';
    }
    return null;
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
        setErrors({ ...errors, telephone: validateTelephone(numeroTelephone) });
        break;
      case 'dateNaissance':
        setErrors({ ...errors, dateNaissance: validateDateNaissance(dateNaissance) });
        break;
      case 'carteIdentite':
        setErrors({ ...errors, carteIdentite: validateCarteIdentite(carteIdentite) });
        break;
      case 'motDePasse':
        setErrors({ ...errors, motDePasse: validateMotDePasse(motDePasse) });
        break;
      case 'confirmPassword':
        setErrors({ ...errors, confirmPassword: validateConfirmPassword(confirmPassword) });
        break;
    }
  };

  const validateForm = () => {
    // Marquer tous les champs comme touchés
    setTouched({
      prenom: true,
      nom: true,
      email: true,
      telephone: true,
      dateNaissance: true,
      carteIdentite: true,
      motDePasse: true,
      confirmPassword: true,
    });

    // Valider tous les champs
    const allErrors = {
      prenom: validatePrenom(prenom),
      nom: validateNom(nom),
      email: validateEmail(email),
      telephone: validateTelephone(numeroTelephone),
      dateNaissance: validateDateNaissance(dateNaissance),
      carteIdentite: validateCarteIdentite(carteIdentite),
      motDePasse: validateMotDePasse(motDePasse),
      confirmPassword: validateConfirmPassword(confirmPassword),
    };

    setErrors(allErrors);

    // Vérifier s'il y a des erreurs
    const hasErrors = Object.values(allErrors).some(error => error !== null);
    if (hasErrors) {
      Alert.alert('Erreur', 'Veuillez corriger les erreurs dans le formulaire.');
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

      // Créer FormData pour multipart/form-data
      const formData = new FormData();
      
      // Ajouter les champs texte
      formData.append('prenom', prenom.trim());
      formData.append('nom', nom.trim());
      formData.append('email', email.toLowerCase().trim());
      formData.append('numeroTelephone', fullPhone);
      formData.append('motDePasse', motDePasse);
      formData.append('dateNaissance', formattedDate);
      formData.append('adresse', adresse.trim() || 'Non spécifiée');
      formData.append('carteIdentite', carteIdentite.trim());

      // Ajouter la photo d'identité si sélectionnée
      if (photoIdentite) {
        // Extraire le type MIME depuis l'URI ou utiliser le type par défaut
        let fileType = 'image/jpeg'; // Par défaut
        if (photoIdentite.mimeType) {
          fileType = photoIdentite.mimeType;
        } else if (photoIdentite.type) {
          // Si type est "image", convertir en MIME type selon l'extension
          if (photoIdentite.type === 'image') {
            const uri = photoIdentite.uri.toLowerCase();
            if (uri.includes('.png')) {
              fileType = 'image/png';
            } else if (uri.includes('.jpg') || uri.includes('.jpeg')) {
              fileType = 'image/jpeg';
            } else {
              fileType = 'image/jpeg'; // Par défaut
            }
          } else {
            fileType = photoIdentite.type;
          }
        }
        
        // Extraire le nom de fichier depuis l'URI ou utiliser un nom par défaut
        let fileName = `photo_identite_${Date.now()}.jpg`;
        if (photoIdentite.fileName) {
          fileName = photoIdentite.fileName;
        } else if (photoIdentite.name) {
          fileName = photoIdentite.name;
          // S'assurer que le nom a une extension
          if (!fileName.includes('.')) {
            fileName += '.jpg';
          }
        } else if (photoIdentite.uri) {
          // Extraire le nom depuis l'URI
          const uriParts = photoIdentite.uri.split('/');
          const lastPart = uriParts[uriParts.length - 1];
          if (lastPart && lastPart.includes('.')) {
            fileName = lastPart;
          }
        }
        
        // Format correct pour React Native FormData
        formData.append('photoIdentite', {
          uri: photoIdentite.uri,
          type: fileType,
          name: fileName,
        });
        
        console.log('Image preparee:', {
          uri: photoIdentite.uri.substring(0, 50) + '...',
          type: fileType,
          name: fileName,
          originalType: photoIdentite.type,
          originalMimeType: photoIdentite.mimeType,
        });
      }

      console.log('Envoi creation admin a:', API_CONFIG.ENDPOINTS.AUTH.CREATE_ADMIN_PUBLIC);
      
      // Utiliser fetch au lieu d'axios pour FormData (comme pour createMembre/createTresorier)
      // Note: Cette route est publique donc pas de token nécessaire
      const fullUrl = API_CONFIG.ENDPOINTS.AUTH.CREATE_ADMIN_PUBLIC;
      
      console.log('URL complete:', fullUrl);
      
      // Utiliser fetch pour FormData (plus fiable avec React Native)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 secondes
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          // Ne pas mettre Content-Type, fetch le gère automatiquement pour FormData
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // Gérer les erreurs de parsing JSON
      let data;
      try {
        const text = await response.text();
        if (!text) {
          throw new Error('Réponse vide du serveur');
        }
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('Erreur parsing JSON:', parseError);
        throw new Error('Réponse invalide du serveur. Veuillez réessayer.');
      }
      
      const apiResult = {
        success: response.ok && response.status >= 200 && response.status < 300,
        data: data,
      };

      console.log('Resultat creation admin:', apiResult);

      if (apiResult.success && apiResult.data) {
        const responseData = apiResult.data;
        console.log('Donnees recues:', JSON.stringify(responseData, null, 2));

        if (responseData.success) {
          Alert.alert('Succès', 'Compte admin créé !', [
            { text: 'OK', onPress: () => navigation.replace('Login') },
          ]);
        } else {
          // Afficher le message d'erreur du serveur
          const errorMessage = responseData.message || responseData.error?.message || responseData.error || 'Échec de création.';
          console.error('Erreur serveur:', errorMessage);
          Alert.alert('Erreur', errorMessage);
        }
      } else {
        // Gérer les erreurs de l'API
        const errorMessage = apiResult.data?.message || apiResult.data?.error?.message || apiResult.data?.error || 'Impossible de créer l\'admin.';
        console.error('Erreur API:', apiResult.data);
        Alert.alert('Erreur', errorMessage);
      }
    } catch (fetchError) {
      // Si c'est une erreur d'abort (timeout)
      if (fetchError.name === 'AbortError') {
        Alert.alert(
          'Erreur de timeout',
          'La requête a pris trop de temps. L\'image est peut-être trop lourde. Réessayez avec une image plus petite.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Autres erreurs fetch
      console.error('Erreur creation admin:', fetchError);
      console.error('Erreur stack:', fetchError.stack);
      
      let errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
      let errorTitle = 'Erreur';
      
      if (fetchError.message) {
        if (fetchError.message.includes('Network request failed') || 
            fetchError.message.includes('Network') ||
            fetchError.message.includes('Failed to fetch')) {
          errorTitle = 'Erreur de connexion';
          errorMessage = 'Impossible de se connecter au serveur.\n\nVérifiez votre connexion internet. Si vous avez ajouté une image, elle est peut-être trop lourde.';
        } else if (fetchError.message.includes('JSON') || fetchError.message.includes('parsing')) {
          errorTitle = 'Erreur serveur';
          errorMessage = 'Le serveur a renvoyé une réponse invalide. Veuillez réessayer.';
        } else {
          errorMessage = fetchError.message;
        }
      }
      
      Alert.alert(errorTitle, errorMessage, [{ text: 'OK' }]);
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
            <TextInput 
              style={[
                styles.input,
                errors.prenom && touched.prenom && styles.inputError
              ]} 
              value={prenom} 
              onChangeText={setPrenom} 
              onBlur={() => handleBlur('prenom')}
              placeholder="Prénom" 
            />
            {errors.prenom && touched.prenom && (
              <Text style={styles.errorText}>{errors.prenom}</Text>
            )}

            {/* Nom */}
            <Text style={styles.label}>Nom *</Text>
            <TextInput 
              style={[
                styles.input,
                errors.nom && touched.nom && styles.inputError
              ]} 
              value={nom} 
              onChangeText={setNom} 
              onBlur={() => handleBlur('nom')}
              placeholder="Nom" 
            />
            {errors.nom && touched.nom && (
              <Text style={styles.errorText}>{errors.nom}</Text>
            )}

            {/* Email */}
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={[
                styles.input,
                errors.email && touched.email && styles.inputError
              ]}
              value={email}
              onChangeText={setEmail}
              onBlur={() => handleBlur('email')}
              placeholder="admin@digitontine.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && touched.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}

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
                style={[
                  styles.phoneInput,
                  errors.telephone && touched.telephone && styles.inputError
                ]}
                value={numeroTelephone}
                onChangeText={handlePhoneChange}
                onBlur={() => handleBlur('telephone')}
                placeholder={'7'.repeat(selectedCountryCode.length)}
                keyboardType="phone-pad"
                maxLength={selectedCountryCode.length}
              />
            </View>
            {errors.telephone && touched.telephone && (
              <Text style={styles.errorText}>{errors.telephone}</Text>
            )}

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
            <TouchableOpacity 
              style={[
                styles.dateButton,
                errors.dateNaissance && touched.dateNaissance && styles.inputError
              ]} 
              onPress={openDatePicker}
            >
              <Text style={styles.dateText}>{formatDate(dateNaissance)}</Text>
              <Ionicons name="calendar-outline" size={20} color={Colors.textDark} />
            </TouchableOpacity>
            {errors.dateNaissance && touched.dateNaissance && (
              <Text style={styles.errorText}>{errors.dateNaissance}</Text>
            )}
            

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
              style={[
                styles.input,
                errors.carteIdentite && touched.carteIdentite && styles.inputError
              ]}
              value={carteIdentite}
              onChangeText={(value) => {
                let processedValue;
                
                // Pour le Sénégal, ne garder que les chiffres et limiter à 13
                if (selectedCountryCode.code === '+221') {
                  processedValue = value.replace(/[^0-9]/g, '').slice(0, 13);
                } else {
                  // Pour les autres pays, uppercase
                  processedValue = value.toUpperCase();
                }
                
                setCarteIdentite(processedValue);
                if (touched.carteIdentite) {
                  setErrors({ ...errors, carteIdentite: validateCarteIdentite(processedValue) });
                }
              }}
              onBlur={() => handleBlur('carteIdentite')}
              placeholder={selectedCountryCode.code === '+221' ? '1123198000001' : 'Numéro de carte d\'identité'}
              keyboardType={selectedCountryCode.code === '+221' ? 'numeric' : 'default'}
              autoCapitalize={selectedCountryCode.code === '+221' ? 'none' : 'characters'}
            />
            {errors.carteIdentite && touched.carteIdentite && (
              <Text style={styles.errorText}>{errors.carteIdentite}</Text>
            )}

            {/* Photo d'identité */}
            <Text style={styles.label}>Photo d'identité (optionnel)</Text>
            {photoIdentite ? (
              <View style={styles.photoContainer}>
                <Image source={{ uri: photoIdentite.uri }} style={styles.photoPreview} />
                <TouchableOpacity style={styles.removePhotoBtn} onPress={removePhoto}>
                  <Ionicons name="close-circle" size={24} color={Colors.error || '#dc3545'} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                <Ionicons name="camera-outline" size={24} color={Colors.primaryDark} />
                <Text style={styles.photoButtonText}>Sélectionner une photo</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.helper}>JPG/PNG, max 5MB (optionnel)</Text>

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
            <View style={[
              styles.passwordRow,
              errors.motDePasse && touched.motDePasse && styles.inputError
            ]}>
              <TextInput
                style={styles.passwordInput}
                value={motDePasse}
                onChangeText={(value) => {
                  setMotDePasse(value);
                  if (touched.motDePasse) {
                    setErrors({ ...errors, motDePasse: validateMotDePasse(value) });
                  }
                  // Valider aussi la confirmation si elle est remplie
                  if (touched.confirmPassword && confirmPassword) {
                    setErrors({ ...errors, confirmPassword: validateConfirmPassword(confirmPassword) });
                  }
                }}
                onBlur={() => handleBlur('motDePasse')}
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
            {errors.motDePasse && touched.motDePasse && (
              <Text style={styles.errorText}>{errors.motDePasse}</Text>
            )}

            {/* Confirmation */}
            <Text style={styles.label}>Confirmer *</Text>
            <TextInput
              style={[
                styles.input,
                errors.confirmPassword && touched.confirmPassword && styles.inputError
              ]}
              value={confirmPassword}
              onChangeText={(value) => {
                setConfirmPassword(value);
                if (touched.confirmPassword) {
                  setErrors({ ...errors, confirmPassword: validateConfirmPassword(value) });
                }
              }}
              onBlur={() => handleBlur('confirmPassword')}
              placeholder="Répétez le mot de passe"
              secureTextEntry={!showPassword}
            />
            {errors.confirmPassword && touched.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}

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
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#dc3545',
    borderWidth: 2,
    backgroundColor: '#fff5f5',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 13,
    marginTop: -12,
    marginBottom: 12,
    marginLeft: 4,
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

  // Photo d'identité
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingVertical: 15,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  photoButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: Colors.primaryDark,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  photoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  removePhotoBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 5,
  },
});