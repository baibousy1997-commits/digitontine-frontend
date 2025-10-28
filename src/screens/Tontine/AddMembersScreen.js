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
  const { tontineId, tontineName, minMembers, maxMembers } = route.params;

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
      console.log(' Début chargement des membres...');
      
      const result = await userService.listUsers({ 
        role: 'Membre', 
        isActive: true,
        limit: 100 
      });

      console.log(' Résultat complet:', JSON.stringify(result, null, 2));
      console.log(' Success:', result.success);
      console.log(' Structure data:', result.data);

      //  CORRECTION : Les membres sont dans result.data.data (pas result.data.data.users)
      if (result.success && result.data?.data) {
        const membresList = Array.isArray(result.data.data) ? result.data.data : [];
        console.log(' Nombre de membres:', membresList.length);
        console.log(' Liste des membres:', membresList);
        setMembres(membresList);
        
        if (membresList.length === 0) {
          Alert.alert(
            'Aucun membre',
            'Aucun membre disponible. Créez d\'abord des comptes membres.',
            [{ text: 'OK' }]
          );
        }
      } else {
        console.log(' Pas de membres trouvés');
        console.log('Structure reçue:', result);
        setMembres([]);
        Alert.alert('Info', 'Aucun membre disponible');
      }
    } catch (error) {
      console.error(' Erreur chargement membres:', error);
      console.error('Stack:', error.stack);
      Alert.alert('Erreur', 'Une erreur est survenue lors du chargement');
      setMembres([]);
    } finally {
      console.log(' Fin chargement - loading = false');
      setLoading(false);
    }
  };

  const toggleMember = (memberId) => {
    setSelectedMembers(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId);
      } else {
        if (prev.length >= maxMembers) {
          Alert.alert(
            'Limite atteinte', 
            `Vous ne pouvez ajouter que ${maxMembers} membres maximum`
          );
          return prev;
        }
        return [...prev, memberId];
      }
    });
  };

  const handleAddMembers = async () => {
    if (selectedMembers.length < minMembers) {
      Alert.alert(
        'Membres insuffisants',
        `Vous devez ajouter au moins ${minMembers} membres. Actuellement: ${selectedMembers.length}`
      );
      return;
    }

    setSubmitting(true);

    try {
      console.log(' Ajout des membres:', selectedMembers);
      const result = await tontineService.addMembers(tontineId, selectedMembers);
      console.log(' Résultat ajout:', result);

      if (result.success) {
        Alert.alert(
          'Succès',
          `${selectedMembers.length} membre(s) ajouté(s) à la tontine`,
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Accueil'),
            },
          ]
        );
      } else {
        const errorMsg = result.error?.message || 'Impossible d\'ajouter les membres';
        console.error(' Erreur ajout:', result.error);
        Alert.alert('Erreur', errorMsg);
      }
    } catch (error) {
      console.error(' Exception ajout membres:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'ajout');
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
          Invitez entre {minMembers} et {maxMembers} membres à rejoindre "{tontineName}"
        </Text>

        <Text style={styles.selectionInfo}>
          {selectedMembers.length} / {minMembers}-{maxMembers} membres sélectionnés
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
              {searchText ? 'Aucun membre trouvé' : 'Aucun membre disponible'}
            </Text>
            {!searchText && membres.length === 0 && (
              <Text style={[styles.emptyStateText, { fontSize: 14, marginTop: 10 }]}>
                Créez d'abord des comptes membres
              </Text>
            )}
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
            (selectedMembers.length < minMembers || submitting) && styles.continueButtonDisabled
          ]}
          onPress={handleAddMembers}
          disabled={selectedMembers.length < minMembers || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.continueButtonText}>
              Ajouter les membres ({selectedMembers.length}/{minMembers}-{maxMembers})
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
      minMembers: PropTypes.number.isRequired,
      maxMembers: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
};

export default AddMembersScreen;