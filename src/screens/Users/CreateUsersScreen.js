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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import styles from '../../styles/CreateUsersScreenStyles';

const CreateUsersScreen = ({ navigation }) => {
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [adresse, setAdresse] = useState('');
  const [cni, setCni] = useState('');
  const [role, setRole] = useState('membre');
  const [photo, setPhoto] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Vous devez autoriser l'accès à vos photos !");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    if (!prenom || !nom || !email || !telephone || !adresse || !cni) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    alert(`✅ Utilisateur ${prenom} ${nom} créé avec le rôle ${role} !`);
    navigation.goBack();
  };

  const selectRole = (selectedRole) => {
    setRole(selectedRole);
    setShowRoleModal(false);
  };

  const getRoleLabel = (roleValue) => {
    return roleValue === 'membre' ? 'Membre' : 'Trésorier';
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.backgroundLight }}>
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: Platform.OS === 'android' ? 50 : 60,
          marginLeft: 20,
        }}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={Colors.primaryDark} />
        <Text style={{ color: Colors.primaryDark, fontSize: 16, marginLeft: 5 }}>Retour</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Créer un utilisateur</Text>

        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.profileImage} />
          ) : (
            <Ionicons name="camera-outline" size={40} color={Colors.primaryDark} />
          )}
          <Text style={styles.imageText}>Choisir une photo de profil</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Prénom</Text>
        <TextInput
          style={styles.input}
          placeholder="Entrez le prénom"
          value={prenom}
          onChangeText={setPrenom}
        />

        <Text style={styles.label}>Nom</Text>
        <TextInput
          style={styles.input}
          placeholder="Entrez le nom"
          value={nom}
          onChangeText={setNom}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="exemple@mail.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Numéro de téléphone</Text>
        <TextInput
          style={styles.input}
          placeholder="77 123 45 67"
          keyboardType="phone-pad"
          value={telephone}
          onChangeText={setTelephone}
        />

        <Text style={styles.label}>Adresse</Text>
        <TextInput
          style={styles.input}
          placeholder="Votre adresse complète"
          value={adresse}
          onChangeText={setAdresse}
        />

        <Text style={styles.label}>Numéro CNI</Text>
        <TextInput
          style={styles.input}
          placeholder="Numéro de la carte d'identité"
          value={cni}
          onChangeText={setCni}
        />

        {/* --- Sélection de rôle améliorée --- */}
        <Text style={styles.label}>Rôle</Text>
        <TouchableOpacity
          style={styles.roleSelector}
          onPress={() => setShowRoleModal(true)}
        >
          <Text style={styles.roleSelectorText}>{getRoleLabel(role)}</Text>
          <Ionicons name="chevron-down" size={20} color={Colors.primaryDark} />
        </TouchableOpacity>

        <TouchableOpacity 
  style={styles.submitButton} 
  onPress={handleSubmit}
  activeOpacity={0.8}
>
  <Ionicons name="" size={20} color="#0b29ecff" style={{ marginRight: 8 }} />
  <Text style={styles.submitText}>Créer l'utilisateur</Text>
</TouchableOpacity>
      </ScrollView>

      {/* --- Modal de sélection de rôle --- */}
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
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sélectionner un rôle</Text>
            
            <TouchableOpacity
              style={[styles.modalOption, role === 'membre' && styles.modalOptionSelected]}
              onPress={() => selectRole('membre')}
            >
              <Text style={[styles.modalOptionText, role === 'membre' && styles.modalOptionTextSelected]}>
                Membre
              </Text>
              {role === 'membre' && (
                <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalOption, role === 'tresorier' && styles.modalOptionSelected]}
              onPress={() => selectRole('tresorier')}
            >
              <Text style={[styles.modalOptionText, role === 'tresorier' && styles.modalOptionTextSelected]}>
                Trésorier
              </Text>
              {role === 'tresorier' && (
                <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowRoleModal(false)}
            >
              <Text style={styles.modalCancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default CreateUsersScreen;