// src/screens/Dashboard/DashboardTresorierScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  StatusBar,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import dashboardService from '../../services/dashboard/dashboardService';
import tontineService from '../../services/tontine/tontineService';
import Colors from '../../constants/colors';

const DashboardTresorierScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [mesTontines, setMesTontines] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

const loadDashboard = async () => {
  try {
    setLoading(true);
    
    console.log('TRESORIER - Chargement dashboard tresorier...');
    
    const result = await dashboardService.getDashboardTresorier();
    
    if (result.success) {
      const data = result.data?.data;
      console.log('Dashboard data:', data);
      setDashboardData(data);
      
      // ✅ Les tontines viennent maintenant du dashboard
      const tontinesList = data?.mesTontines || [];
      console.log('Tontines du trésorier:', tontinesList.length);
      setMesTontines(tontinesList);
    } else {
      console.error('Erreur dashboard:', result.error);
      setDashboardData(null);
      setMesTontines([]);
    }
    
  } catch (error) {
    console.error('Erreur chargement dashboard tresorier:', error);
  } finally {
    setLoading(false);
  }
};

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

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

  if (loading && !dashboardData) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={Colors.primaryDark} />
        <Text style={{ color: theme.text, marginTop: 10 }}>Chargement...</Text>
      </View>
    );
  }

  const kpis = dashboardData?.kpis || {};
  const transactionsEnAttente = dashboardData?.transactionsEnAttente || [];
  const topMembres = dashboardData?.topMembres || [];

  const montantTotalCollecte = kpis?.montantTotalCollecte || 0;
  const montantTotalDistribue = kpis?.montantTotalDistribue || 0;
  const soldeDisponible = kpis?.soldeDisponible || 0;
  const tauxRecouvrement = kpis?.tauxRecouvrement || '0%';
  const transactionsEnAttenteCount = kpis?.transactionsEnAttente || 0;
  const totalPenalites = kpis?.totalPenalites || 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.isDarkMode ? 'light-content' : 'dark-content'} />
      
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Dashboard Tresorier</Text>
        <TouchableOpacity onPress={loadDashboard}>
          <Ionicons name="refresh" size={26} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Alerte transactions en attente */}
        {transactionsEnAttenteCount > 0 && (
          <TouchableOpacity
            style={[styles.alertBox, { backgroundColor: '#fff3cd' }]}
            onPress={() => navigation.navigate('TransactionsValidation')}
          >
            <Ionicons name="alert-circle" size={24} color="#856404" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.alertText}>
                {transactionsEnAttenteCount} transaction(s) en attente de validation
              </Text>
              <Text style={[styles.alertSubtext, { color: '#856404' }]}>
                Touchez pour valider
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* KPIs Financiers */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Financier</Text>
        <View style={styles.kpiRow}>
          <View style={[styles.kpiCard, { backgroundColor: theme.surface }]}>
            <Ionicons name="trending-up" size={32} color={Colors.accentGreen} />
            <Text style={[styles.kpiValue, { color: theme.text }]}>
              {montantTotalCollecte?.toLocaleString() || 0}
            </Text>
            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>Collecte (FCFA)</Text>
          </View>

          <View style={[styles.kpiCard, { backgroundColor: theme.surface }]}>
            <Ionicons name="trending-down" size={32} color={Colors.danger} />
            <Text style={[styles.kpiValue, { color: theme.text }]}>
              {montantTotalDistribue?.toLocaleString() || 0}
            </Text>
            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>Distribue (FCFA)</Text>
          </View>
        </View>

        <View style={styles.kpiRow}>
          <View style={[styles.kpiCard, { backgroundColor: theme.surface }]}>
            <MaterialCommunityIcons name="wallet" size={32} color={Colors.primaryDark} />
            <Text style={[styles.kpiValue, { color: theme.text }]}>
              {soldeDisponible?.toLocaleString() || 0}
            </Text>
            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>Solde (FCFA)</Text>
          </View>

          <View style={[styles.kpiCard, { backgroundColor: theme.surface }]}>
            <Ionicons name="speedometer" size={32} color={Colors.accentYellow} />
            <Text style={[styles.kpiValue, { color: theme.text }]}>
              {tauxRecouvrement || '0%'}
            </Text>
            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>Taux recouvrement</Text>
          </View>
        </View>

        {/* Penalites */}
        <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Total penalites</Text>
            <Text style={[styles.infoValue, { color: Colors.danger, fontWeight: 'bold' }]}>
              {totalPenalites?.toLocaleString() || 0} FCFA
            </Text>
          </View>
        </View>

        {/* Mes tontines (Tresorier) */}
        {mesTontines.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>
                Mes tontines ({mesTontines.length})
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('MyTontines')}>
                <Text style={[styles.seeAllText, { color: Colors.primaryDark }]}>
                  Voir tout
                </Text>
              </TouchableOpacity>
            </View>
            
            {mesTontines.slice(0, 3).map((tontine, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.tontineCard, { backgroundColor: theme.surface }]}
                onPress={() => navigation.navigate('TontineDetails', { 
                  tontineId: getTontineId(tontine)
                })}
              >
                <View style={styles.tontineHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.tontineName, { color: theme.text }]}>
                      {tontine.nom}
                    </Text>
                    <Text style={[styles.tontineInfo, { color: theme.textSecondary }]}>
                      {tontine.nombreMembres || 0} membres • {tontine.montantCotisation?.toLocaleString()} FCFA
                    </Text>
                  </View>
                  <View style={[
                    styles.statutBadge, 
                    { backgroundColor: getStatutColor(tontine.statut) }
                  ]}>
                    <Text style={styles.statutText}>{tontine.statut}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Transactions en attente */}
        {transactionsEnAttente.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Transactions en attente ({transactionsEnAttente.length})
            </Text>
            <FlatList
              data={transactionsEnAttente.slice(0, 5)}
              scrollEnabled={false}
              keyExtractor={(item, index) => item._id || index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.transactionCard, { backgroundColor: theme.surface }]}
                  onPress={() => navigation.navigate('TransactionDetails', { transactionId: item._id })}
                >
                  <View style={styles.transactionLeft}>
                    <Text style={[styles.transactionUser, { color: theme.text }]}>
                      {item.userId?.prenom || 'N/A'} {item.userId?.nom || 'N/A'}
                    </Text>
                    <Text style={[styles.transactionTontine, { color: theme.textSecondary }]}>
                      {item.tontineId?.nom || 'Tontine inconnue'}
                    </Text>
                  </View>
                  <View style={styles.transactionRight}>
                    <Text style={[styles.transactionAmount, { color: Colors.accentGreen }]}>
                      {item.montant?.toLocaleString() || 0} FCFA
                    </Text>
                    <Text style={[styles.transactionDate, { color: theme.textSecondary }]}>
                      {item.dateTransaction ? new Date(item.dateTransaction).toLocaleDateString('fr-FR') : 'N/A'}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
            {transactionsEnAttente.length > 5 && (
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => navigation.navigate('TransactionsValidation')}
              >
                <Text style={styles.viewAllText}>Voir toutes les transactions</Text>
                <Ionicons name="chevron-forward" size={20} color={Colors.primaryDark} />
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Top 5 membres ponctuels */}
        {topMembres.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Membres ponctuels</Text>
            <FlatList
              data={topMembres}
              scrollEnabled={false}
              keyExtractor={(item, index) => item._id || index.toString()}
              renderItem={({ item, index }) => (
                <View style={[styles.topMemberCard, { backgroundColor: theme.surface }]}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>{index + 1}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.memberName, { color: theme.text }]}>
                      {item.prenom || 'N/A'} {item.nom || 'N/A'}
                    </Text>
                    <Text style={[styles.memberStats, { color: theme.textSecondary }]}>
                      {item.nombrePaiements || 0} paiements - {item.montantTotal?.toLocaleString() || 0} FCFA
                    </Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={24} color={Colors.accentGreen} />
                </View>
              )}
            />
          </>
        )}

        {/* Actions rapides */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Actions rapides</Text>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: Colors.accentYellow }]}
          onPress={() => navigation.navigate('TransactionsValidation')}
        >
          <Ionicons name="checkmark-done" size={24} color="#333" />
          <Text style={[styles.actionButtonText, { color: '#333' }]}>Valider les transactions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: Colors.primaryDark }]}
          onPress={() => navigation.navigate('TransactionsList')}
        >
          <MaterialCommunityIcons name="finance" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Historique des transactions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: Colors.accentGreen }]}
          onPress={() => navigation.navigate('MyTontines')}
        >
          <MaterialCommunityIcons name="hand-coin" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Voir mes tontines</Text>
        </TouchableOpacity>
      </ScrollView>
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
  scrollContent: { padding: 20 },
  alertBox: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  alertText: { fontSize: 14, color: '#856404', fontWeight: '600' },
  alertSubtext: { fontSize: 12, marginTop: 4 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 20, marginBottom: 15 },
  seeAllText: { fontSize: 14, fontWeight: '600' },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  kpiCard: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  kpiValue: { fontSize: 20, fontWeight: 'bold', marginTop: 8 },
  kpiLabel: { fontSize: 11, marginTop: 4, textAlign: 'center' },
  infoCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: { fontSize: 14 },
  infoValue: { fontSize: 14, fontWeight: '600' },
  tontineCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tontineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tontineName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  tontineInfo: { fontSize: 13 },
  statutBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statutText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  transactionLeft: { flex: 1 },
  transactionUser: { fontSize: 15, fontWeight: '600' },
  transactionTontine: { fontSize: 13, marginTop: 4 },
  transactionRight: { alignItems: 'flex-end' },
  transactionAmount: { fontSize: 16, fontWeight: 'bold' },
  transactionDate: { fontSize: 12, marginTop: 4 },
  viewAllButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  viewAllText: { color: Colors.primaryDark, fontSize: 14, fontWeight: '600' },
  topMemberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.accentYellow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  memberName: { fontSize: 15, fontWeight: '600' },
  memberStats: { fontSize: 13, marginTop: 4 },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionButtonText: { fontSize: 16, fontWeight: '600', color: '#fff', marginLeft: 10 },
});

export default DashboardTresorierScreen;