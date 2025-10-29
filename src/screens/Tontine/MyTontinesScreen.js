// src/screens/Tontine/MyTontinesScreen.js
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuthContext } from '../../context/AuthContext';
import tontineService from '../../services/tontine/tontineService';
import Colors from '../../constants/colors';

const MyTontinesScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tontines, setTontines] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'Active', 'En attente', 'Terminee'

  useEffect(() => {
    loadTontines();
  }, []);

  const loadTontines = async () => {
    try {
      setLoading(true);
      console.log(' Chargement des tontines...');

      let result;

      // CORRECTION : Utiliser la bonne route selon le rôle
      if (user?.role === 'admin') {
        // Admin : Liste complète via /tontines
        result = await tontineService.listTontines({ limit: 100 });
      } else {
        // Membre/Trésorier : Mes tontines via /tontines/me/tontines
        result = await tontineService.mesTontines();
      }

      if (result.success) {
        const tontinesList = result.data?.data?.tontines || result.data?.data || [];
        console.log(' Tontines chargées:', tontinesList.length);
        setTontines(tontinesList);
      } else {
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

  //  Filtrer les tontines selon le statut sélectionné
  const filteredTontines = filter === 'all' 
    ? tontines 
    : tontines.filter(t => t.statut === filter);

  //  Fonction pour obtenir l'ID correct (MongoDB ou standard)
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

  const renderTontine = ({ item }) => (
    <TouchableOpacity
      style={[styles.tontineCard, { backgroundColor: theme.surface }]}
      onPress={() => {
        const tontineId = getTontineId(item);
        console.log(' Navigation vers tontine:', tontineId);
        navigation.navigate('TontineDetails', { tontineId });
      }}
    >
      <View style={styles.tontineHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.tontineName, { color: theme.text }]}>
            {item.nom}
          </Text>
          <Text style={[styles.tontineDescription, { color: theme.textSecondary }]} numberOfLines={2}>
            {item.description || 'Aucune description'}
          </Text>
        </View>
        <View style={[styles.statutBadge, { backgroundColor: getStatutColor(item.statut) }]}>
          <Text style={styles.statutText}>{item.statut}</Text>
        </View>
      </View>

      <View style={styles.tontineDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="cash-outline" size={18} color={theme.textSecondary} />
          <Text style={[styles.detailText, { color: theme.text }]}>
            {item.montantCotisation?.toLocaleString()} FCFA
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={18} color={theme.textSecondary} />
          <Text style={[styles.detailText, { color: theme.text }]}>
            {item.frequence}
          </Text>
        </View>

        {item.tresorierAssigne && (
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={18} color={theme.textSecondary} />
            <Text style={[styles.detailText, { color: theme.text }]}>
              {item.tresorierAssigne.prenom} {item.tresorierAssigne.nom}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.tontineFooter}>
        <Text style={[styles.dateText, { color: theme.placeholder }]}>
          Début: {new Date(item.dateDebut).toLocaleDateString('fr-FR')}
        </Text>
        <Ionicons name="chevron-forward" size={20} color={theme.placeholder} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.isDarkMode ? 'light-content' : 'dark-content'} />
      
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Mes Tontines</Text>
        <TouchableOpacity onPress={loadTontines}>
          <Ionicons name="refresh" size={26} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/*  Filtres - Ajout de "Toutes" */}
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

        {['Active', 'En attente', 'Terminee'].map((status) => (
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
          {tontines.length > 0 && filter !== 'all' && (
            <TouchableOpacity 
              style={styles.showAllButton}
              onPress={() => setFilter('all')}
            >
              <Text style={styles.showAllButtonText}>Voir toutes les tontines</Text>
            </TouchableOpacity>
          )}
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
  showAllButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.primaryDark,
    borderRadius: 20,
  },
  showAllButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
  tontineFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  dateText: { fontSize: 12 },
});

export default MyTontinesScreen;