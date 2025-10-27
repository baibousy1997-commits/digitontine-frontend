// src/screens/Tontine/AddMembersScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  ActivityIndicator,
  FlatList 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import styles from '../../styles/AddMembersScreenStyles';
import userService from '../../services/user/userService';
import tontineService from '../../services/tontine/tontineService';

const AddMembersScreen = ({ navigation, route }) => {
  const { tontineId, tontineName, requiredMembers } = route.params;

  const [searchText, setSearchText] = useState('');
  const [membres, setMembres] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadMembres();
  }, []);

  const loadMembres = async () => {
    try {
      const result = await userService.listUsers({ 
        role: 'Membre', 
        isActive: true,
        limit: 100 
      });

      if (result.success && result.data?.data?.users) {
        setMembres(result.data.data.users);
      } else {
        Alert.alert('Erreur', 'Impossible de charger les membres');
      }
    } catch (error) {
      console.error('Erreur chargement membres:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (memberId) => {
    setSelectedMembers(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId);
      } else {
        if (prev.length >= requiredMembers) {
          Alert.alert(
            'Limite atteinte', 
            `Vous ne pouvez ajouter que ${requiredMembers} membres maximum`
          );
          return prev;
        }
        return [...prev, memberId];
      }
    });
  };

  const handleAddMembers = async () => {
    if (selectedMembers.length < requiredMembers) {
      Alert.alert(
        'Membres insuffisants',
        `Vous devez ajouter ${requiredMembers} membres. Actuellement: ${selectedMembers.length}`
      );
      return;
    }

    setSubmitting(true);

    try {
      const result = await tontineService.addMembers(tontineId, selectedMembers);

      if (result.success) {
        Alert.alert(
          'Succes',
          `${selectedMembers.length} membre(s) ajoute(s) a la tontine`,
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Accueil'),
            },
          ]
        );
      } else {
        Alert.alert('Erreur', result.error?.message || 'Impossible d\'ajouter les membres');
      }
    } catch (error) {
      console.error('Erreur ajout membres:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMembres = membres.filter(membre => {
    const fullName = `${membre.prenom} ${membre.nom}`.toLowerCase();
    const email = membre.email.toLowerCase();
    const search = searchText.toLowerCase();
    return fullName.includes(search) || email.includes(search);
  });

  const renderMember = ({ item }) => {
    const isSelected = selectedMembers.includes(item.id);

    return (
      <TouchableOpacity
        style={[
          styles.memberCard,
          isSelected && styles.memberCardSelected
        ]}
        onPress={() => toggleMember(item.id)}
      >
        <View style={styles.memberAvatar}>
          <Text style={styles.memberInitials}>
            {item.prenom[0]}{item.nom[0]}
          </Text>
        </View>

        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{item.prenom} {item.nom}</Text>
          <Text style={styles.memberEmail}>{item.email}</Text>
          <Text style={styles.memberPhone}>{item.numeroTelephone}</Text>
        </View>

        <View style={[
          styles.checkbox,
          isSelected && styles.checkboxSelected
        ]}>
          {isSelected && <Ionicons name="checkmark" size={20} color="#fff" />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.backText}>Retour</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Ajouter des membres</Text>
        <Text style={styles.subtitle}>
          Invitez {requiredMembers} membres a rejoindre "{tontineName}"
        </Text>

        <Text style={styles.selectionInfo}>
          {selectedMembers.length} / {requiredMembers} membres selectionnes
        </Text>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher par nom ou email"
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A9B8E" />
            <Text style={styles.loadingText}>Chargement des membres...</Text>
          </View>
        ) : filteredMembres.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="people-outline" size={80} color="#ccc" />
            <Text style={styles.emptyStateText}>
              {searchText ? 'Aucun membre trouve' : 'Aucun membre disponible'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredMembres}
            renderItem={renderMember}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        )}
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={[
            styles.continueButton,
            (selectedMembers.length < requiredMembers || submitting) && styles.continueButtonDisabled
          ]}
          onPress={handleAddMembers}
          disabled={selectedMembers.length < requiredMembers || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.continueButtonText}>
              Ajouter les membres ({selectedMembers.length}/{requiredMembers})
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

AddMembersScreen.propTypes = {
  navigation: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
    navigate: PropTypes.func.isRequired,
  }).isRequired,
  route: PropTypes.shape({
    params: PropTypes.shape({
      tontineId: PropTypes.string.isRequired,
      tontineName: PropTypes.string.isRequired,
      requiredMembers: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
};

export default AddMembersScreen;