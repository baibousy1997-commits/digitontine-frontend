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
  const { 
    tontineId, 
    tontineName, 
    minMembers, 
    maxMembers,
    montantCotisation,
    frequence,
    dateDebut,
    tauxPenalite,
    delaiGrace,
    reglementAuto, // Règlement généré par backend
  } = route.params;

  const [searchText, setSearchText] = useState('');
  const [membres, setMembres] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [showReglement, setShowReglement] = useState(false);
  
  //  SÉPARATION : Règlement auto (non modifiable) + Description (modifiable)
  const [reglementAutoText] = useState(reglementAuto || ''); // Immuable
  const [descriptionCustom, setDescriptionCustom] = useState(''); // Modifiable

  useEffect(() => {
    loadMembres();
  }, []);

  const loadMembres = async () => {
    try {
      const result = await userService.listUsers({ 
        role: 'membre', 
        isActive: true,
        limit: 100 
      });

      if (result.success && result.data?.data) {
        const membresList = Array.isArray(result.data.data?.data) 
          ? result.data.data.data 
          : (Array.isArray(result.data.data) ? result.data.data : []);
        setMembres(membresList);
        
        if (membresList.length === 0) {
          Alert.alert('Aucun membre', 'Créez d\'abord des comptes membres.');
        }
      } else {
        setMembres([]);
      }
    } catch (error) {
      console.error('Erreur chargement membres:', error);
      setMembres([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (memberId) => {
    setSelectedMembers(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  const handleShowReglement = () => {
    if (selectedMembers.length === 0) {
      Alert.alert('Aucun membre sélectionné', 'Sélectionnez au moins 1 membre');
      return;
    }
    setShowReglement(true);
  };

  const handleSendInvitations = async () => {
    //  Combiner règlement auto + description custom
    const reglementComplet = descriptionCustom.trim() 
      ? `${reglementAutoText}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n RÈGLES COMPLÉMENTAIRES\n\n${descriptionCustom.trim()}`
      : reglementAutoText;

    Alert.alert(
      ' Confirmer l\'envoi',
      `Envoyer ${selectedMembers.length} invitation(s) avec ce règlement ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Envoyer', 
          onPress: async () => {
            setSubmitting(true);
            try {
              const result = await tontineService.inviterMembres(
                tontineId, 
                selectedMembers,
                reglementComplet //  Envoyer le règlement complet
              );

              if (result.success) {
                const invitationsEnvoyees = result.data?.data?.invitationsEnvoyees || [];
                Alert.alert(
                  ' Invitations envoyées',
                  `${invitationsEnvoyees.length} invitation(s) envoyée(s)`,
                  [{ text: 'OK', onPress: () => navigation.navigate('Accueil') }]
                );
              } else {
                Alert.alert(' Erreur', result.error?.message || 'Erreur envoi');
              }
            } catch (error) {
              console.error('Exception invitations:', error);
              Alert.alert(' Erreur', 'Une erreur est survenue');
            } finally {
              setSubmitting(false);
            }
          }
        }
      ]
    );
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
        style={[styles.memberCard, isSelected && styles.memberCardSelected]}
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

        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
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

      {!showReglement ? (
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        //  ÉTAPE 1 : SÉLECTION DES MEMBRES
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        <>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Ajouter des membres</Text>
            <Text style={styles.subtitle}>
              Sélectionnez les membres à ajouter à "{tontineName}"
            </Text>

            <Text style={styles.selectionInfo}>
              {selectedMembers.length} membre(s) sélectionné(s)
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
                <Text style={styles.loadingText}>Chargement...</Text>
              </View>
            ) : filteredMembres.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Ionicons name="people-outline" size={80} color="#ccc" />
                <Text style={styles.emptyStateText}>
                  {searchText ? 'Aucun membre trouvé' : 'Aucun membre disponible'}
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
              style={[styles.continueButton, selectedMembers.length === 0 && styles.continueButtonDisabled]}
              onPress={handleShowReglement}
              disabled={selectedMembers.length === 0}
            >
              <Text style={styles.continueButtonText}>
                 Voir le règlement ({selectedMembers.length})
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        //  ÉTAPE 2 : AFFICHAGE RÈGLEMENT + MODIFICATION
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}> Règlement de la tontine</Text>
          <Text style={styles.subtitle}>
            Le règlement automatique est généré. Vous pouvez ajouter des règles complémentaires.
          </Text>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {/*  SECTION 1 : RÈGLEMENT AUTO (LECTURE SEULE) */}
          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="lock-closed" size={20} color="#6B7280" />
              <Text style={styles.sectionTitle}>
                Règlement automatique (non modifiable)
              </Text>
            </View>
            
            <ScrollView 
              style={styles.reglementReadOnly}
              nestedScrollEnabled={true}
            >
              <Text style={styles.reglementReadOnlyText}>
                {reglementAutoText || 'Aucun règlement généré'}
              </Text>
            </ScrollView>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color="#3B82F6" />
              <Text style={styles.infoText}>
                Ce règlement contient les paramètres techniques : cotisation ({montantCotisation} FCFA), 
                fréquence ({frequence}), pénalités ({tauxPenalite}%, délai {delaiGrace}j).
              </Text>
            </View>
          </View>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {/*  SECTION 2 : DESCRIPTION CUSTOM (MODIFIABLE) */}
          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="create" size={20} color="#10B981" />
              <Text style={styles.sectionTitle}>
                Règles complémentaires (optionnel)
              </Text>
            </View>

            <TextInput
              style={styles.descriptionInput}
              value={descriptionCustom}
              onChangeText={setDescriptionCustom}
              multiline
              numberOfLines={10}
              textAlignVertical="top"
              placeholder="Exemple :
• Présence obligatoire aux réunions mensuelles
• Pas de prêt d'argent entre membres pendant la tontine
• Les décisions se prennent à la majorité
• Tout retard doit être signalé 24h à l'avance"
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.helperText}>
               Ces règles seront ajoutées à la fin du règlement automatique
            </Text>
          </View>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {/*  BOUTONS D'ACTION */}
          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <View style={styles.bottomContainer}>
            <TouchableOpacity 
              style={[styles.continueButton, { backgroundColor: '#6B7280', marginBottom: 10 }]}
              onPress={() => setShowReglement(false)}
            >
              <Ionicons name="arrow-back" size={20} color="#fff" />
              <Text style={styles.continueButtonText}>Retour sélection</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.continueButton}
              onPress={handleSendInvitations}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#000" />
              ) : (
                <>
                  <Ionicons name="send" size={20} color="#000" />
                  <Text style={styles.continueButtonText}>
                    Envoyer {selectedMembers.length} invitation(s)
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
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
      montantCotisation: PropTypes.number,
      frequence: PropTypes.string,
      dateDebut: PropTypes.string,
      tauxPenalite: PropTypes.number,
      delaiGrace: PropTypes.number,
      reglementAuto: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

export default AddMembersScreen;