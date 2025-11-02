// src/screens/Validation/MyValidationRequestsScreen.js - 

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import validationService from '../../services/validation/validationService';
import Colors from '../../constants/colors';

const MyValidationRequestsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadMyRequests();
  }, [filter]);

  const loadMyRequests = async () => {
    try {
      setLoading(true);
      
      console.log('\n Chargement demandes avec filtre:', filter);
      
      const params = filter !== 'all' ? { status: filter } : {};
      const result = await validationService.getMyRequests(params);
      
      console.log(' Résultat API:', JSON.stringify(result, null, 2));
      console.log('   Success:', result.success);
      console.log('   Data structure:', typeof result.data, Array.isArray(result.data));
      
      if (result.success) {
        //  CORRECTION : Extraction correcte des données
        let data = [];
        
        if (Array.isArray(result.data)) {
          data = result.data;
          console.log(' Structure: result.data (direct)');
        } else if (Array.isArray(result.data?.data)) {
          data = result.data.data;
          console.log(' Structure: result.data.data');
        } else if (Array.isArray(result.data?.requests)) {
          data = result.data.requests;
          console.log(' Structure: result.data.requests');
        }
        
        console.log(` ${data.length} demande(s) extraite(s)`);
        
        if (data.length > 0) {
          console.log(' Première demande:', JSON.stringify(data[0], null, 2));
        }
        
        setRequests(data);
      } else {
        console.error(' Erreur API:', result.error);
        Alert.alert(' Erreur', 'Impossible de charger vos demandes');
        setRequests([]);
      }
    } catch (error) {
      console.error(' Exception chargement demandes:', error);
      console.error('Stack:', error.stack);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMyRequests();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return Colors.accentGreen;
      case 'rejected': return Colors.dangerRed;
      case 'pending': return Colors.accentYellow;
      case 'expired': return Colors.placeholder;
      default: return Colors.placeholder;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'accepted': return 'Acceptée';
      case 'rejected': return 'Rejetée';
      case 'pending': return 'En attente';
      case 'expired': return 'Expirée';
      default: return status;
    }
  };

  const renderItem = ({ item }) => {
    console.log(' Render item:', JSON.stringify(item, null, 2));
    
    //  CORRECTION : Gestion flexible des IDs
    const requestId = item._id || item.id;
    
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.surface }]}
        onPress={() => {
          console.log(' Navigation vers détails:', requestId);
        }}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.actionType, { color: Colors.primaryDark }]}>
              {validationService.getActionLabel(item.actionType)}
            </Text>
            {/*  CORRECTION : Afficher resourceName correctement */}
            <Text style={[styles.resourceName, { color: theme.text }]}>
              {item.resourceName || 'Ressource non spécifiée'}
            </Text>
          </View>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: getStatusColor(item.status) }
          ]}>
            <Text style={styles.statusText}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="person" size={16} color={theme.textSecondary} />
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            Trésorier : {item.assignedTresorier || 'Non assigné'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="time" size={16} color={theme.textSecondary} />
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            {new Date(item.createdAt).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        {item.status === 'accepted' && (
          <View style={[styles.successBox, { backgroundColor: '#d4edda' }]}>
            <Ionicons name="checkmark-circle" size={20} color="#155724" />
            <Text style={styles.successText}>
              Vous pouvez maintenant exécuter l'action
            </Text>
          </View>
        )}

        {item.status === 'rejected' && item.rejectionReason && (
          <View style={[styles.errorBox, { backgroundColor: '#f8d7da' }]}>
            <Text style={styles.errorLabel}>Raison du refus :</Text>
            <Text style={styles.errorText}>{item.rejectionReason}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading && requests.length === 0) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={Colors.primaryDark} />
        <Text style={{ color: theme.text, marginTop: 10 }}>Chargement...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Mes demandes ({requests.length})
        </Text>
        <TouchableOpacity onPress={loadMyRequests}>
          <Ionicons name="refresh" size={26} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Filtres */}
      <View style={[styles.filterContainer, { backgroundColor: theme.surface }]}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'all' && { backgroundColor: Colors.primaryDark },
          ]}
          onPress={() => setFilter('all')}
        >
          <Text style={[
            styles.filterText,
            { color: filter === 'all' ? '#fff' : theme.text },
          ]}>
            Toutes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'pending' && { backgroundColor: Colors.accentYellow },
          ]}
          onPress={() => setFilter('pending')}
        >
          <Text style={[
            styles.filterText,
            { color: filter === 'pending' ? '#333' : theme.text },
          ]}>
            En attente
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'accepted' && { backgroundColor: Colors.accentGreen },
          ]}
          onPress={() => setFilter('accepted')}
        >
          <Text style={[
            styles.filterText,
            { color: filter === 'accepted' ? '#fff' : theme.text },
          ]}>
            Acceptées
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'rejected' && { backgroundColor: Colors.dangerRed },
          ]}
          onPress={() => setFilter('rejected')}
        >
          <Text style={[
            styles.filterText,
            { color: filter === 'rejected' ? '#fff' : theme.text },
          ]}>
            Rejetées
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={requests}
        keyExtractor={(item) => item._id || item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color={Colors.placeholder} />
            <Text style={[styles.emptyText, { color: theme.text }]}>
              Aucune demande
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
              {filter === 'all' 
                ? 'Créez une demande de validation pour les actions critiques'
                : `Aucune demande ${getStatusLabel(filter).toLowerCase()}`
              }
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterText: { fontSize: 13, fontWeight: '600' },
  listContent: { padding: 20 },
  card: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  actionType: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  resourceName: { fontSize: 16, fontWeight: '600' },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoText: { fontSize: 14 },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  successText: { fontSize: 13, color: '#155724', fontWeight: '600' },
  errorBox: {
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  errorLabel: { fontSize: 12, color: '#721c24', fontWeight: '600', marginBottom: 4 },
  errorText: { fontSize: 13, color: '#721c24' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: { fontSize: 18, fontWeight: '700', marginTop: 15 },
  emptySubtext: { fontSize: 14, marginTop: 8, textAlign: 'center', paddingHorizontal: 40 },
});

export default MyValidationRequestsScreen;