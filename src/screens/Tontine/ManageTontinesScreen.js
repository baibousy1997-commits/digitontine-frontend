// src/screens/Tontine/ManageTontinesScreen.js - VERSION CORRIGEE

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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import tontineService from '../../services/tontine/tontineService';
import validationService from '../../services/validation/validationService';
import Colors from '../../constants/colors';

const ManageTontinesScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tontines, setTontines] = useState([]);
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadTontines();
  }, []);

  const loadTontines = async () => {
    try {
      setLoading(true);
      const result = await tontineService.listTontines({ limit: 100 });
      if (result.success) {
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
        
        console.log('Tontines chargees (Admin):', tontinesList.length);
        setTontines(tontinesList);
      } else {
        console.error('Erreur:', result.error);
        setTontines([]);
      }
    } catch (error) {
      console.error('Erreur chargement tontines:', error);
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
//  BLOQUER TONTINE - VERSION SIMPLIFIÉE
// ========================================
const handleBlockTontine = async (tontine) => {
  Alert.alert(
    ' Bloquer la tontine',
    `Voulez-vous bloquer "${tontine.nom}" ?\n\nCette action nécessite la validation d'un Trésorier.\n\n L'action sera EXÉCUTÉE AUTOMATIQUEMENT après validation.`,
    [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Créer la demande',
        style: 'destructive',
        onPress: () => {
          console.log('Navigation vers CreateValidationRequest - BLOCK_TONTINE:', getTontineId(tontine));
          
          navigation.navigate('CreateValidationRequest', {
            actionType: 'BLOCK_TONTINE',
            resourceType: 'Tontine',
            resourceId: getTontineId(tontine),
            resourceName: tontine.nom,
            reason: '',
            onSuccess: () => {
              Alert.alert(
                ' Demande créée',
                'Un trésorier va valider votre demande. Vous serez notifié.',
                [{ text: 'OK', onPress: () => loadTontines() }]
              );
            },
          });
        }
      }
    ]
  );
};

// ========================================
// DÉBLOQUER TONTINE - VERSION SIMPLIFIÉE
// ========================================
const handleUnblockTontine = async (tontine) => {
  Alert.alert(
    'Debloquer la tontine',
    `Voulez-vous debloquer "${tontine.nom}" ?\n\nCette action necessite la validation d'un Tresorier.\n\nL'action sera EXECUTEE AUTOMATIQUEMENT apres validation.`,
    [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Créer la demande',
        onPress: () => {
          console.log('Navigation vers CreateValidationRequest - UNBLOCK_TONTINE:', getTontineId(tontine));
          
          navigation.navigate('CreateValidationRequest', {
            actionType: 'UNBLOCK_TONTINE',
            resourceType: 'Tontine',
            resourceId: getTontineId(tontine),
            resourceName: tontine.nom,
            reason: '',
            onSuccess: () => {
              Alert.alert(
                ' Demande créée',
                'Un trésorier va valider votre demande. Vous serez notifié.',
                [{ text: 'OK', onPress: () => loadTontines() }]
              );
            },
          });
        }
      }
    ]
  );
};

// ========================================
//  SUPPRIMER TONTINE - VERSION SIMPLIFIÉE
// ========================================
const handleDeleteTontine = async (tontine) => {
  Alert.alert(
    'SUPPRESSION CRITIQUE',
    `ATTENTION !\n\nVous allez supprimer definitivement la tontine "${tontine.nom}".\n\nCette action necessite la validation d'un Tresorier.\n\nL'action sera EXECUTEE AUTOMATIQUEMENT apres validation.`,
    [
      { text: 'Annuler', style: 'cancel' },
      { 
        text: 'Créer la demande', 
        style: 'destructive',
        onPress: () => {
          console.log('Navigation vers CreateValidationRequest - DELETE_TONTINE:', getTontineId(tontine));
          
          navigation.navigate('CreateValidationRequest', {
            actionType: 'DELETE_TONTINE',
            resourceType: 'Tontine',
            resourceId: getTontineId(tontine),
            resourceName: tontine.nom,
            reason: '',
            onSuccess: () => {
              Alert.alert(
                ' Demande créée',
                'Un trésorier va valider votre demande. Vous serez notifié.',
                [{ text: 'OK', onPress: () => loadTontines() }]
              );
            },
          });
        }
      }
    ]
  );
};

// ========================================
//  ACTIVER TONTINE - ACTION DIRECTE (pas de validation)
// ========================================
const handleActivateTontine = (tontine) => {
  Alert.alert(
    ' Activer la tontine',
    `Voulez-vous activer "${tontine.nom}" ?\n\n Le calendrier sera généré et les membres notifiés.\n\n Action immédiate (sans validation).`,
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

// ========================================
//  CLÔTURER TONTINE - ACTION DIRECTE (pas de validation)
// ========================================
const handleCloseTontine = (tontine) => {
  Alert.alert(
    ' Clôturer la tontine',
    ` ATTENTION !\n\nVoulez-vous clôturer définitivement "${tontine.nom}" ?\n\n⚡ Cette action est immédiate et irréversible.`,
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
            Alert.alert('erreur', 'Une erreur est survenue');
          } finally {
            setActionLoading(false);
          }
        }
      }
    ]
  );
};

  const renderTontine = ({ item }) => {
    const canActivate = item.statut === 'En attente';
    const canBlock = item.statut === 'Active';
    const canUnblock = item.statut === 'Bloquee';
    const canClose = item.statut === 'Active';

    return (
      <View style={[styles.tontineCard, { backgroundColor: theme.surface }]}>
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

        <View style={styles.actionsContainer}>
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
              <Text style={styles.actionBtnText}>Debloquer</Text>
            </TouchableOpacity>
          )}

          {canClose && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: Colors.placeholder }]}
              onPress={() => handleCloseTontine(item)}
              disabled={actionLoading}
            >
              <Ionicons name="checkmark-done" size={18} color="#fff" />
              <Text style={styles.actionBtnText}>Cloturer</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Colors.primaryDark }]}
            onPress={() => navigation.navigate('TontineDetails', { tontineId: getTontineId(item) })}
          >
            <Ionicons name="eye" size={18} color="#fff" />
            <Text style={styles.actionBtnText}>Details</Text>
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
        <Text style={[styles.headerTitle, { color: theme.text }]}>Gerer les Tontines</Text>
        <TouchableOpacity onPress={loadTontines}>
          <Ionicons name="refresh" size={26} color={theme.text} />
        </TouchableOpacity>
      </View>

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
});

export default ManageTontinesScreen;