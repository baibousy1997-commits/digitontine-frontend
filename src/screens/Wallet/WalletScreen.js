// src/screens/Wallet/WalletScreen.js - VERSION MISE À JOUR
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
import transactionService from '../../services/transaction/transactionService';
import Colors from '../../constants/colors';

const WalletScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { user } = useAuthContext();
  const { tontineId, tontineName } = route.params || {};
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [stats, setStats] = useState({
    totalValidees: 0,
    totalEnAttente: 0,
    totalRejetees: 0,
    montantTotal: 0,
    montantEnAttente: 0,
  });

  useEffect(() => {
    loadTransactions(1, false);
  }, [filter, tontineId]);

  const loadTransactions = async (pageNum = 1, append = false) => {
    try {
      if (!append) setLoading(true);
      
      // Construire les paramètres
      const params = {
        page: pageNum,
        limit: 20,
      };
      
      // Si on a un tontineId spécifique, filtrer par cette tontine
      if (tontineId) {
        params.tontineId = tontineId;
      }
      
      if (filter !== 'all') {
        params.statut = filter;
      }

      console.log('Chargement transactions avec params:', params);
      console.log('Role utilisateur:', user?.role);
      
      // NOUVEAU : Utiliser getMyTontinesTransactions pour TOUS les utilisateurs
      const result = await transactionService.getMyTontinesTransactions(params);

      console.log('Resultat API wallet:', result);

      if (result.success) {
        // Gérer différentes structures de réponse
        let newTransactions = [];
        let newStats = null;
        
        if (Array.isArray(result.data?.data?.data)) {
          newTransactions = result.data.data.data;
          newStats = result.data.data.stats;
        } else if (Array.isArray(result.data?.data)) {
          newTransactions = result.data.data;
          newStats = result.data.stats;
        } else if (Array.isArray(result.data)) {
          newTransactions = result.data;
        }
        
        console.log(`${newTransactions.length} transaction(s) extraites`);
        
        if (append) {
          setTransactions(prev => [...prev, ...newTransactions]);
        } else {
          setTransactions(newTransactions);
        }
        
        setHasMore(newTransactions.length === 20);
        setPage(pageNum);
        
        // Utiliser les stats du backend si disponibles
        if (newStats && !append) {
          setStats(newStats);
        } else {
          calculateStats(newTransactions, !append);
        }
      } else {
        console.error('Erreur API:', result.error);
        setTransactions([]);
        resetStats();
      }
    } catch (error) {
      console.error('Exception chargement transactions:', error);
      console.error('Message:', error.message);
      setTransactions([]);
      resetStats();
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (transactionsList, isNew = true) => {
    let validees = transactionsList.filter(t => t.statut === 'Validee');
    let enAttente = transactionsList.filter(t => t.statut === 'En attente');
    let rejetees = transactionsList.filter(t => t.statut === 'Rejetee');
    
    let montantTotal = validees.reduce((sum, t) => sum + (t.montant || 0), 0);
    let montantEnAttente = enAttente.reduce((sum, t) => sum + (t.montant || 0), 0);
    
    // Si append, ajouter aux stats existantes
    if (!isNew) {
      setStats(prev => ({
        totalValidees: prev.totalValidees + validees.length,
        totalEnAttente: prev.totalEnAttente + enAttente.length,
        totalRejetees: prev.totalRejetees + rejetees.length,
        montantTotal: prev.montantTotal + montantTotal,
        montantEnAttente: prev.montantEnAttente + montantEnAttente,
      }));
    } else {
      setStats({
        totalValidees: validees.length,
        totalEnAttente: enAttente.length,
        totalRejetees: rejetees.length,
        montantTotal: montantTotal,
        montantEnAttente: montantEnAttente,
      });
    }
  };

  const resetStats = () => {
    setStats({
      totalValidees: 0,
      totalEnAttente: 0,
      totalRejetees: 0,
      montantTotal: 0,
      montantEnAttente: 0,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions(1, false);
    setRefreshing(false);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadTransactions(page + 1, true);
    }
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'Validee': return Colors.accentGreen;
      case 'En attente': return Colors.accentYellow;
      case 'Rejetee': return Colors.danger;
      default: return Colors.placeholder;
    }
  };

  const renderTransaction = ({ item }) => {
    const transactionId = item._id || item.id;
    
    return (
      <TouchableOpacity
        style={[styles.transactionCard, { backgroundColor: theme.surface }]}
        onPress={() => navigation.navigate('TransactionDetails', { transactionId })}
      >
        <View style={styles.transactionHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.transactionReference, { color: theme.text }]}>
              {item.reference}
            </Text>
            <Text style={[styles.transactionTontine, { color: theme.textSecondary }]}>
              {item.tontine || 'Tontine'}
            </Text>
            {item.user && (
              <Text style={[styles.userName, { color: theme.placeholder }]}>
                {item.user}
              </Text>
            )}
          </View>
          <View style={[styles.statutBadge, { backgroundColor: getStatutColor(item.statut) }]}>
            <Text style={styles.statutText}>{item.statut}</Text>
          </View>
        </View>

        <View style={styles.transactionBody}>
          <View style={styles.amountRow}>
            <Text style={[styles.amountLabel, { color: theme.textSecondary }]}>
              Montant
            </Text>
            <Text style={[styles.amount, { color: Colors.accentGreen }]}>
              {item.montant?.toLocaleString()} FCFA
            </Text>
          </View>

          {item.montantPenalite > 0 && (
            <View style={styles.penaliteRow}>
              <Text style={[styles.penaliteLabel, { color: theme.textSecondary }]}>
                Penalites
              </Text>
              <Text style={[styles.penaliteValue, { color: Colors.danger }]}>
                {item.montantPenalite?.toLocaleString()} FCFA
              </Text>
            </View>
          )}
        </View>

        <View style={styles.transactionFooter}>
          <Text style={[styles.dateText, { color: theme.placeholder }]}>
            {new Date(item.dateTransaction).toLocaleDateString('fr-FR')}
          </Text>
          <Text style={[styles.moyenText, { color: theme.placeholder }]}>
            {item.moyenPaiement}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View>
      <View style={[styles.statsCard, { backgroundColor: theme.surface }]}>
        <Text style={[styles.statsTitle, { color: theme.text }]}>
          {tontineName ? `Statistiques - ${tontineName}` : 'Statistiques Globales'}
        </Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.accentGreen }]}>
              {stats.totalValidees}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Validees
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.accentYellow }]}>
              {stats.totalEnAttente}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              En attente
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.danger }]}>
              {stats.totalRejetees}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Rejetees
            </Text>
          </View>
        </View>

        <View style={[styles.totalMontant, { borderTopColor: theme.border }]}>
          <View>
            <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>
              Total collecte
            </Text>
            <Text style={[styles.totalValue, { color: Colors.accentGreen }]}>
              {stats.montantTotal.toLocaleString()} FCFA
            </Text>
          </View>
          {stats.montantEnAttente > 0 && (
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>
                En attente
              </Text>
              <Text style={[styles.totalValue, { color: Colors.accentYellow }]}>
                {stats.montantEnAttente.toLocaleString()} FCFA
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.filterContainer}>
        {[
          { key: 'all', label: 'Toutes' },
          { key: 'En attente', label: 'En attente' },
          { key: 'Validee', label: 'Validees' },
          { key: 'Rejetee', label: 'Rejetees' }
        ].map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.filterButton,
              { backgroundColor: theme.surface },
              filter === item.key && { backgroundColor: Colors.primaryDark }
            ]}
            onPress={() => setFilter(item.key)}
          >
            <Text
              style={[
                styles.filterText,
                { color: theme.text },
                filter === item.key && { color: '#fff' }
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Historique des Transactions
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.isDarkMode ? 'light-content' : 'dark-content'} />
      
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Portefeuille
        </Text>
        <TouchableOpacity onPress={onRefresh}>
          <Ionicons name="refresh" size={26} color={theme.text} />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primaryDark} />
          <Text style={{ color: theme.text, marginTop: 10 }}>Chargement...</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item, index) => (item._id || item.id || `tx-${index}`)}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons 
                name="receipt-text-outline" 
                size={80} 
                color={theme.placeholder} 
              />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                {filter === 'all' 
                  ? 'Aucune transaction'
                  : `Aucune transaction ${filter.toLowerCase()}`
                }
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            hasMore && !loading ? (
              <ActivityIndicator 
                size="small" 
                color={Colors.primaryDark} 
                style={{ marginVertical: 20 }} 
              />
            ) : null
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: { padding: 20 },
  statsCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 5,
  },
  totalMontant: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 15,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterText: { fontSize: 13, fontWeight: '600' },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 15,
  },
  transactionCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  transactionReference: { fontSize: 15, fontWeight: '600' },
  transactionTontine: { fontSize: 13, marginTop: 4 },
  userName: { fontSize: 12, marginTop: 2 },
  statutBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statutText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  transactionBody: { marginBottom: 12 },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  amountLabel: { fontSize: 14 },
  amount: { fontSize: 18, fontWeight: 'bold' },
  penaliteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  penaliteLabel: { fontSize: 12 },
  penaliteValue: { fontSize: 12, fontWeight: '600' },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  dateText: { fontSize: 12 },
  moyenText: { fontSize: 12 },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default WalletScreen;