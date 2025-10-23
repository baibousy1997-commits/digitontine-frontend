import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../../styles/AddMembersScreenStyles';

const AddMembersScreen = ({ navigation, route }) => {
  const [searchText, setSearchText] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const requiredMembers = route?.params?.duration || 2;

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handlePhoneInvite = () => {
    // Logique pour inviter via téléphone
    alert('Invitation par téléphone');
  };

  const handleEmailInvite = () => {
    // Logique pour inviter par email
    alert('Invitation par email');
  };

  const handleContinue = () => {
    if (selectedMembers.length < requiredMembers) {
      alert(`Vous devez inviter ${requiredMembers} membres`);
      return;
    }
    // Navigation vers l'écran suivant ou finalisation
    alert('Membres ajoutés avec succès!');
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.backText}>Retour</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Text style={styles.title}>Ajouter des membres</Text>
        <Text style={styles.subtitle}>
          Invitez {requiredMembers} membres à rejoindre votre tontine
        </Text>

        {/* Search and Invite Section */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher"
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          <TouchableOpacity style={styles.inviteButton} onPress={handlePhoneInvite}>
            <Ionicons name="call" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.inviteButton} onPress={handleEmailInvite}>
            <Ionicons name="mail" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Selected Members Avatars */}
        <View style={styles.avatarsContainer}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person-add" size={30} color="#4A9B8E" />
          </View>
          <View style={styles.avatarCircle}>
            <Ionicons name="person-add" size={30} color="#4A9B8E" />
          </View>
        </View>

      </ScrollView>

      {/* Continue Button - Fixed at bottom */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continuer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddMembersScreen;