// src/screens/Tontine/ManageTontinesScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  StatusBar,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import tontineService from '../../services/tontine/tontineService';
import Colors from '../../constants/colors';

const ManageTontinesScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tontines, setTontines] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedTontine, setSelectedTontine] = useState(null);
  const [blockMotif, setBlockMotif] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadTontines();
  }, []);

  const loadTontines = async () => {
    try {
      setLoading(true);
      const result = await tontineService.listTontines({ limit: 100 });
if (result.success) {
  // Gérer toutes les structures possibles de réponse API
  let tontinesList = [];
  
  if (Array.isArray(result.data?.data?.data)) {
    tontinesList = result.data.data.data;
  } else if (Array.isArray(result.data?.data?.tontines)) {
    tontinesList = result.data.data.tontines;
  } else if (Array.isArray(result.data?.data)) {
    tontinesList = result.data.data;
  } else if (Array.isArray(result.data)) {
    tontinesList = result.data;
  }
  
  console.log('Tontines chargées (Admin):', tontinesList.length);
  console.log('Structure:', tontinesList[0]);
  setTontines(tontinesList);
}
       else {
        console.error(' Erreur:', result.error);
        setTontines([]);
      }
    } catch (error) {
      console.error(' Erreur chargement tontines:', error);
      setTontines([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTontines();
    setRefreshing(false);
  };

  // Filtrer les tontines selon le statut
  const filteredTontines = filter === 'all' 
    ? tontines 
    : tontines.filter(t => t.statut === filter);

  const getTontineId = (tontine) => {
    return tontine._id || tontine.id;
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'Active': return Colors.accentGreen;
      case 'En attente': return Colors.accentYellow;
      case 'Terminee': return Colors.placeholder;
      case 'Bloquee': return Colors.danger;
      default: return Colors.placeholder;
    }
  };

  // ========================================
  // ACTIONS SUR LES TONTINES
  // ========================================

  const handleActivateTontine = (tontine) => {
    Alert.alert(
      'Activer la tontine',
      `Voulez-vous activer "${tontine.nom}" ?\n\nLe calendrier des cotisations sera généré et les membres seront notifiés.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Activer', 
          style: 'default',
          onPress: async () => {
            setActionLoading(true);
            try {
              const result = await tontineService.activateTontine(getTontineId(tontine));
              
              if (result.success) {
                Alert.alert(' Succès', 'Tontine activée avec succès');
                await loadTontines();
              } else {
                Alert.alert(' Erreur', result.error?.message || 'Impossible d\'activer la tontine');
              }
            } catch (error) {
              console.error('Erreur activation:', error);
              Alert.alert(' Erreur', 'Une erreur est survenue');
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

const handleBlockTontine = (tontine) => {
  Alert.alert(
    ' Blocage avec validation',
    `Le blocage de "${tontine.nom}" nécessite la validation d'un Trésorier.\n\nVoulez-vous créer une demande de validation ?`,
    [
      { text: 'Annuler', style: 'cancel' },
      { 
        text: 'Créer la demande',
        onPress: () => {
          // Demander le motif
          Alert.prompt(
            'Motif du blocage',
            'Indiquez la raison du blocage :',
            [
              { text: 'Annuler', style: 'cancel' },
              {
                text: 'Valider',
                onPress: (motif) => {
                  if (!motif || motif.trim().length < 10) {
                    Alert.alert(' Erreur', 'Le motif doit contenir au moins 10 caractères');
                    return;
                  }
                  
                  navigation.navigate('CreateValidationRequest', {
                    actionType: 'BLOCK_TONTINE',
                    resourceType: 'Tontine',
                    resourceId: getTontineId(tontine),
                    resourceName: tontine.nom,
                    reason: motif.trim(),
                    onSuccess: () => loadTontines(),
                  });
                }
              }
            ],
            'plain-text'
          );
        }
      }
    ]
  );
};

  const confirmBlockTontine = async () => {
    if (!blockMotif.trim()) {
      Alert.alert(' Attention', 'Veuillez indiquer le motif du blocage');
      return;
    }

    setActionLoading(true);
    try {
      const result = await tontineService.blockTontine(
        getTontineId(selectedTontine), 
        blockMotif.trim()
      );
      
      if (result.success) {
        setShowBlockModal(false);
        setBlockMotif('');
        Alert.alert(' Succès', 'Tontine bloquée avec succès');
        await loadTontines();
      } else {
        Alert.alert(' Erreur', result.error?.message || 'Impossible de bloquer la tontine');
      }
    } catch (error) {
      console.error('Erreur blocage:', error);
      Alert.alert(' Erreur', 'Une erreur est survenue');
    } finally {
      setActionLoading(false);
    }
  };

const handleUnblockTontine = (tontine) => {
  Alert.alert(
    ' Déblocage avec validation',
    `Le déblocage de "${tontine.nom}" nécessite la validation d'un Trésorier.\n\nVoulez-vous créer une demande de validation ?`,
    [
      { text: 'Annuler', style: 'cancel' },
      { 
        text: 'Créer la demande',
        onPress: () => {
          Alert.prompt(
            'Raison du déblocage',
            'Indiquez pourquoi vous souhaitez débloquer :',
            [
              { text: 'Annuler', style: 'cancel' },
              {
                text: 'Valider',
                onPress: (raison) => {
                  if (!raison || raison.trim().length < 10) {
                    Alert.alert(' Erreur', 'La raison doit contenir au moins 10 caractères');
                    return;
                  }
                  
                  navigation.navigate('CreateValidationRequest', {
                    actionType: 'UNBLOCK_TONTINE',
                    resourceType: 'Tontine',
                    resourceId: getTontineId(tontine),
                    resourceName: tontine.nom,
                    reason: raison.trim(),
                    onSuccess: () => loadTontines(),
                  });
                }
              }
            ],
            'plain-text'
          );
        }
      }
    ]
  );
};

  const handleCloseTontine = (tontine) => {
    Alert.alert(
      'Clôturer la tontine',
      ` ATTENTION !\n\nVoulez-vous clôturer définitivement "${tontine.nom}" ?\n\nCette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Clôturer', 
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              const result = await tontineService.closeTontine(getTontineId(tontine));
              
              if (result.success) {
                Alert.alert(' Succès', 'Tontine clôturée avec succès');
                await loadTontines();
              } else {
                Alert.alert(' Erreur', result.error?.message || 'Impossible de clôturer la tontine');
              }
            } catch (error) {
              console.error('Erreur clôture:', error);
              Alert.alert(' Erreur', 'Une erreur est survenue');
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };
// AJOUTER CETTE FONCTION AVANT renderTontine
const handleDeleteTontine = (tontine) => {
  Alert.alert(
    ' SUPPRESSION CRITIQUE',
    `ATTENTION !\n\nVous allez supprimer définitivement la tontine "${tontine.nom}".\n\nCette action nécessite la validation d'un Trésorier.\n\nÊtes-vous sûr de vouloir créer cette demande ?`,
    [
      { text: 'Annuler', style: 'cancel' },
      { 
        text: 'Créer la demande', 
        style: 'destructive',
        onPress: () => navigation.navigate('CreateValidationRequest', {
          actionType: 'DELETE_TONTINE',
          resourceType: 'Tontine',
          resourceId: getTontineId(tontine),
          resourceName: tontine.nom,
          onSuccess: () => loadTontines(),
        })
      }
    ]
  );
};
  // ========================================
  // RENDER ITEM
  // ========================================

  const renderTontine = ({ item }) => {
    const canActivate = item.statut === 'En attente';
    const canBlock = item.statut === 'Active';
    const canUnblock = item.statut === 'Bloquee';
    const canClose = item.statut === 'Active';

    return (
      <View style={[styles.tontineCard, { backgroundColor: theme.surface }]}>
        {/* Header */}
        <TouchableOpacity
          onPress={() => navigation.navigate('TontineDetails', { tontineId: getTontineId(item) })}
        >
          <View style={styles.tontineHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.tontineName, { color: theme.text }]}>
                {item.nom}
              </Text>
              <Text style={[styles.tontineDescription, { color: theme.textSecondary }]} numberOfLines={1}>
                {item.description || 'Aucune description'}
              </Text>
            </View>
            <View style={[styles.statutBadge, { backgroundColor: getStatutColor(item.statut) }]}>
              <Text style={styles.statutText}>{item.statut}</Text>
            </View>
          </View>

          {/* Détails */}
          <View style={styles.tontineDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="cash-outline" size={16} color={theme.textSecondary} />
              <Text style={[styles.detailText, { color: theme.text }]}>
                {item.montantCotisation?.toLocaleString()} FCFA
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="people-outline" size={16} color={theme.textSecondary} />
              <Text style={[styles.detailText, { color: theme.text }]}>
                {item.nombreMembres || 0} membres
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color={theme.textSecondary} />
              <Text style={[styles.detailText, { color: theme.text }]}>
                {new Date(item.dateDebut).toLocaleDateString('fr-FR')}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Actions */}
        <View style={styles.actionsContainer}>
            {/* AJOUTER CE BOUTON dans la section des actions existantes */}
{(item.statut === 'En attente' || item.statut === 'Terminee') && (
  <TouchableOpacity
    style={[styles.actionBtn, { backgroundColor: '#DC3545' }]}
    onPress={() => handleDeleteTontine(item)}
    disabled={actionLoading}
  >
    <Ionicons name="trash" size={18} color="#fff" />
    <Text style={styles.actionBtnText}>Supprimer</Text>
  </TouchableOpacity>
)}
          {canActivate && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: Colors.accentGreen }]}
              onPress={() => handleActivateTontine(item)}
              disabled={actionLoading}
            >
              <Ionicons name="play-circle" size={18} color="#fff" />
              <Text style={styles.actionBtnText}>Activer</Text>
            </TouchableOpacity>
          )}

          {canBlock && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: Colors.danger }]}
              onPress={() => handleBlockTontine(item)}
              disabled={actionLoading}
            >
              <Ionicons name="lock-closed" size={18} color="#fff" />
              <Text style={styles.actionBtnText}>Bloquer</Text>
            </TouchableOpacity>
          )}

          {canUnblock && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: Colors.accentGreen }]}
              onPress={() => handleUnblockTontine(item)}
              disabled={actionLoading}
            >
              <Ionicons name="lock-open" size={18} color="#fff" />
              <Text style={styles.actionBtnText}>Débloquer</Text>
            </TouchableOpacity>
          )}

          {canClose && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: Colors.placeholder }]}
              onPress={() => handleCloseTontine(item)}
              disabled={actionLoading}
            >
              <Ionicons name="checkmark-done" size={18} color="#fff" />
              <Text style={styles.actionBtnText}>Clôturer</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Colors.primaryDark }]}
            onPress={() => navigation.navigate('TontineDetails', { tontineId: getTontineId(item) })}
          >
            <Ionicons name="eye" size={18} color="#fff" />
            <Text style={styles.actionBtnText}>Détails</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.isDarkMode ? 'light-content' : 'dark-content'} />
      
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Gérer les Tontines</Text>
        <TouchableOpacity onPress={loadTontines}>
          <Ionicons name="refresh" size={26} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Filtres */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            { backgroundColor: theme.surface },
            filter === 'all' && { backgroundColor: Colors.primaryDark }
          ]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterText,
              { color: theme.text },
              filter === 'all' && { color: '#fff' }
            ]}
          >
            Toutes
          </Text>
        </TouchableOpacity>

        {['En attente', 'Active', 'Bloquee', 'Terminee'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              { backgroundColor: theme.surface },
              filter === status && { backgroundColor: Colors.primaryDark }
            ]}
            onPress={() => setFilter(status)}
          >
            <Text
              style={[
                styles.filterText,
                { color: theme.text },
                filter === status && { color: '#fff' }
              ]}
            >
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primaryDark} />
          <Text style={{ color: theme.text, marginTop: 10 }}>Chargement...</Text>
        </View>
      ) : filteredTontines.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="hand-coin-outline" size={80} color={theme.placeholder} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            {filter === 'all' 
              ? 'Aucune tontine disponible'
              : `Aucune tontine ${filter.toLowerCase()}`
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTontines}
          renderItem={renderTontine}
          keyExtractor={(item, index) => getTontineId(item) || index.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Modal de blocage */}
      <Modal
        visible={showBlockModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBlockModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowBlockModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Bloquer la tontine
            </Text>
            <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
              Indiquez le motif du blocage :
            </Text>

            <TextInput
              style={[styles.motifInput, { 
                backgroundColor: theme.background, 
                color: theme.text,
                borderColor: theme.isDarkMode ? '#444' : '#E0E0E0'
              }]}
              placeholder="Ex: Non-respect des règles..."
              placeholderTextColor={theme.placeholder}
              value={blockMotif}
              onChangeText={setBlockMotif}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#ccc' }]}
                onPress={() => {
                  setShowBlockModal(false);
                  setBlockMotif('');
                }}
              >
                <Text style={styles.modalBtnText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: Colors.danger }]}
                onPress={confirmBlockTontine}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalBtnText}>Bloquer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  filterText: { fontSize: 14, fontWeight: '600' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  listContent: { padding: 20 },
  tontineCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tontineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  tontineName: { fontSize: 18, fontWeight: '700', marginBottom: 5 },
  tontineDescription: { fontSize: 14 },
  statutBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statutText: { fontSize: 12, color: '#fff', fontWeight: '600' },
  tontineDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
    gap: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  detailText: { fontSize: 13 },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  motifInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    fontSize: 14,
    minHeight: 100,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ManageTontinesScreen;