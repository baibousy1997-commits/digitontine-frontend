// src/screens/Transaction/MyTransactionsScreen.js - VERSION CORRIGEE
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
import transactionService from '../../services/transaction/transactionService';
import Colors from '../../constants/colors';

const MyTransactionsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, [filter]);

  const loadTransactions = async (pageNum = 1, append = false) => {
    try {
      if (!append) setLoading(true);
      
      const params = { page: pageNum, limit: 20 };
      if (filter !== 'all') params.statut = filter;

      console.log('Chargement transactions avec params:', params);
      const result = await transactionService.getMyTransactions(params);

      console.log('Resultat complet:', result);
      console.log('Structure data:', result.data);

      if (result.success) {
        // CORRECTION: Gerer differentes structures de reponse
        let newTransactions = [];
        
        if (Array.isArray(result.data?.data?.data)) {
          // Structure avec pagination: { data: { data: { data: [...] } } }
          newTransactions = result.data.data.data;
        } else if (Array.isArray(result.data?.data)) {
          // Structure simple: { data: { data: [...] } }
          newTransactions = result.data.data;
        } else if (Array.isArray(result.data)) {
          // Structure directe: { data: [...] }
          newTransactions = result.data;
        }
        
        console.log('Transactions extraites:', newTransactions.length);
        
        if (append) {
          setTransactions(prev => [...prev, ...newTransactions]);
        } else {
          setTransactions(newTransactions);
        }
        
        setHasMore(newTransactions.length === 20);
        setPage(pageNum);
      } else {
        console.error('Erreur API:', result.error);
        setTransactions([]);
      }
    } catch (error) {
      console.error('Exception chargement transactions:', error);
      console.error('Message:', error.message);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
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

  const getStatutIcon = (statut) => {
    switch (statut) {
      case 'Validee': return 'checkmark-circle';
      case 'En attente': return 'time';
      case 'Rejetee': return 'close-circle';
      default: return 'help-circle';
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
          </View>
          <View style={[styles.statutBadge, { backgroundColor: getStatutColor(item.statut) }]}>
            <Ionicons name={getStatutIcon(item.statut)} size={16} color="#fff" />
            <Text style={styles.statutText}>{item.statut}</Text>
          </View>
        </View>

        <View style={styles.transactionBody}>
          <View style={styles.amountRow}>
            <Text style={[styles.amountLabel, { color: theme.textSecondary }]}>
              Montant total
            </Text>
            <Text style={[styles.amount, { color: Colors.accentGreen }]}>
              {item.montant?.toLocaleString()} FCFA
            </Text>
          </View>

          {item.montantPenalite > 0 && (
            <View style={styles.penaliteRow}>
              <Text style={[styles.penaliteLabel, { color: theme.textSecondary }]}>
                Dont penalites
              </Text>
              <Text style={[styles.penaliteValue, { color: Colors.danger }]}>
                {item.montantPenalite?.toLocaleString()} FCFA
              </Text>
            </View>
          )}
        </View>

        <View style={styles.transactionFooter}>
          <View style={styles.footerRow}>
            <Ionicons name="calendar-outline" size={14} color={theme.placeholder} />
            <Text style={[styles.dateText, { color: theme.placeholder }]}>
              {new Date(item.dateTransaction).toLocaleDateString('fr-FR')}
            </Text>
          </View>

          <View style={styles.footerRow}>
            <MaterialCommunityIcons name="wallet-outline" size={14} color={theme.placeholder} />
            <Text style={[styles.moyenText, { color: theme.placeholder }]}>
              {item.moyenPaiement}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.isDarkMode ? 'light-content' : 'dark-content'} />
      
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Mes Transactions</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Ionicons name="refresh" size={26} color={theme.text} />
        </TouchableOpacity>
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

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primaryDark} />
          <Text style={{ color: theme.text, marginTop: 10 }}>Chargement...</Text>
        </View>
      ) : transactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="receipt-text-outline" size={80} color={theme.placeholder} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            {filter === 'all' 
              ? 'Aucune transaction'
              : `Aucune transaction ${filter.toLowerCase()}`
            }
          </Text>
          {transactions.length === 0 && filter !== 'all' && (
            <TouchableOpacity 
              style={styles.showAllButton}
              onPress={() => setFilter('all')}
            >
              <Text style={styles.showAllButtonText}>Voir toutes les transactions</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item, index) => (item._id || item.id || index.toString())}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            hasMore && !loading ? (
              <ActivityIndicator size="small" color={Colors.primaryDark} style={{ marginVertical: 20 }} />
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterText: { fontSize: 13, fontWeight: '600' },
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
  statutBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 5,
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
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dateText: { fontSize: 12 },
  moyenText: { fontSize: 12 },
});

export default MyTransactionsScreen;