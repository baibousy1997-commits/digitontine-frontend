// src/screens/Dashboard/DashboardMembreScreen.js
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
import Colors from '../../constants/colors';
import tontineService from '../../services/tontine/tontineService';
import tirageService from '../../services/tirage/tirageService';

const DashboardMembreScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [mesTontines, setMesTontines] = useState([]);
  const [mesGains, setMesGains] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);
const loadDashboard = async () => {
  try {
    setLoading(true);
    
    console.log('========== DEBUT CHARGEMENT DASHBOARD MEMBRE ==========');
    
    // 1. Charger le dashboard principal
    console.log('1. Chargement dashboard principal...');
    const dashResult = await dashboardService.getDashboardMembre();
    
    if (dashResult.success) {
      const data = dashResult.data?.data;
      console.log(' Dashboard data:', data);
      setDashboardData(data);
      
      //  CORRECTION : Utiliser les tontines du dashboard (comme Admin/Trésorier)
      const tontinesList = data?.tontines || [];  // ✅ CHANGÉ : Chemin simplifié
      console.log(' Tontines du membre:', tontinesList.length);
      console.log('Détails tontines:', JSON.stringify(tontinesList, null, 2));
      setMesTontines(tontinesList);
    } else {
      console.log(' Erreur dashboard:', dashResult.error);
      setDashboardData(null);
      setMesTontines([]);
    }
    
    // 2. Charger mes gains (garder tel quel)
    console.log('2. Chargement de mes gains...');
    const gainsResult = await tirageService.mesGains();
    
    if (gainsResult.success) {
      const gainsList = gainsResult.data?.data?.tirages || [];
      console.log(' Gains chargés:', gainsList.length);
      setMesGains(gainsList);
    } else {
      console.log(' Erreur chargement gains:', gainsResult.error);
      setMesGains([]);
    }
    
    console.log('========== FIN CHARGEMENT DASHBOARD MEMBRE ==========');
    
  } catch (error) {
    console.error(' ERREUR CRITIQUE loadDashboard:', error);
  } finally {
    setLoading(false);
  }
};

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  //  Fonction pour obtenir l'ID correct (MongoDB ou standard)
  const getTontineId = (tontine) => {
    return tontine._id || tontine.id;
  };

  //  Fonction pour formater le statut avec badge coloré
  const getStatutBadge = (statut) => {
    let backgroundColor = Colors.placeholder;
    if (statut === 'Active') backgroundColor = Colors.accentGreen;
    if (statut === 'En attente') backgroundColor = Colors.accentYellow;
    if (statut === 'Bloquee') backgroundColor = Colors.danger;
    
    return (
      <View style={[styles.statutBadge, { backgroundColor }]}>
        <Text style={styles.statutText}>{statut}</Text>
      </View>
    );
  };

  if (loading && !dashboardData) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={Colors.primaryDark} />
        <Text style={{ color: theme.text, marginTop: 10 }}>
          Chargement du dashboard...
        </Text>
      </View>
    );
  }

  const resume = dashboardData?.resume || {};
  const prochainesEcheances = dashboardData?.prochainesEcheances || [];

  const retards = resume?.retards || 0;
  const tontinesActives = resume?.tontinesActives || 0;
  const totalCotise = resume?.totalCotise || 0;
  const totalGagne = resume?.totalGagne || 0;
  const penalites = resume?.totalPenalites || 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.isDarkMode ? 'light-content' : 'dark-content'} />
      
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Mon Dashboard</Text>
        <TouchableOpacity onPress={loadDashboard}>
          <Ionicons name="refresh" size={26} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Alerte retards */}
        {retards > 0 && (
          <View style={[styles.alertBox, { backgroundColor: '#f8d7da' }]}>
            <Ionicons name="warning" size={24} color="#721c24" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.alertText, { color: '#721c24' }]}>
                Vous avez {retards} cotisation(s) en retard
              </Text>
              <Text style={[styles.alertSubtext, { color: '#721c24' }]}>
                Régularisez rapidement pour éviter les pénalités
              </Text>
            </View>
          </View>
        )}

        {/* Résumé financier */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Mon résumé</Text>
        <View style={styles.kpiRow}>
          <View style={[styles.kpiCard, { backgroundColor: theme.surface }]}>
            <MaterialCommunityIcons name="hand-coin" size={32} color={Colors.primaryDark} />
            <Text style={[styles.kpiValue, { color: theme.text }]}>
              {tontinesActives}
            </Text>
            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>Tontines actives</Text>
          </View>

          <View style={[styles.kpiCard, { backgroundColor: theme.surface }]}>
            <Ionicons name="trending-up" size={32} color={Colors.accentGreen} />
            <Text style={[styles.kpiValue, { color: theme.text }]}>
              {totalCotise?.toLocaleString() || 0}
            </Text>
            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>Total cotisé (FCFA)</Text>
          </View>
        </View>

        <View style={styles.kpiRow}>
          <View style={[styles.kpiCard, { backgroundColor: theme.surface }]}>
            <MaterialCommunityIcons name="gift" size={32} color={Colors.accentYellow} />
            <Text style={[styles.kpiValue, { color: theme.text }]}>
              {totalGagne?.toLocaleString() || 0}
            </Text>
            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>Total gagné (FCFA)</Text>
          </View>

          <View style={[styles.kpiCard, { backgroundColor: theme.surface }]}>
            <Ionicons name="alert-circle" size={32} color={retards > 0 ? Colors.danger : Colors.accentGreen} />
            <Text style={[styles.kpiValue, { color: theme.text }]}>
              {retards}
            </Text>
            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>Retards</Text>
          </View>
        </View>

        {/* Pénalités */}
        {penalites > 0 && (
          <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Pénalités cumulées</Text>
              <Text style={[styles.infoValue, { color: Colors.danger, fontWeight: 'bold' }]}>
                {penalites?.toLocaleString() || 0} FCFA
              </Text>
            </View>
          </View>
        )}

        {/*  MES TONTINES - VERSION CORRIGÉE */}
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
            
            <FlatList
              data={mesTontines}
              scrollEnabled={false}
              keyExtractor={(item, index) => getTontineId(item) || index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.tontineCard, { backgroundColor: theme.surface }]}
                  onPress={() => {
                    const tontineId = getTontineId(item);
                    console.log('🔍 Navigation vers tontine:', tontineId);
                    navigation.navigate('TontineDetails', { tontineId });
                  }}
                >
                  <View style={styles.tontineHeader}>
                    <View style={styles.tontineLeft}>
                      <Text style={[styles.tontineName, { color: theme.text }]}>
                        {item.nom || 'Tontine'}
                      </Text>
                      {item.description && (
                        <Text 
                          style={[styles.tontineDescription, { color: theme.textSecondary }]}
                          numberOfLines={1}
                        >
                          {item.description}
                        </Text>
                      )}
                    </View>
                    {getStatutBadge(item.statut)}
                  </View>

                  <View style={styles.tontineDetails}>
                    <View style={styles.detailItem}>
                      <Ionicons name="cash-outline" size={16} color={theme.textSecondary} />
                      <Text style={[styles.detailText, { color: theme.text }]}>
                        {item.montantCotisation?.toLocaleString() || 0} FCFA
                      </Text>
                    </View>

                    <View style={styles.detailItem}>
                      <Ionicons name="calendar-outline" size={16} color={theme.textSecondary} />
                      <Text style={[styles.detailText, { color: theme.text }]}>
                        {item.frequence || 'N/A'}
                      </Text>
                    </View>

                    {item.tresorierAssigne && (
                      <View style={styles.detailItem}>
                        <Ionicons name="person-outline" size={16} color={theme.textSecondary} />
                        <Text style={[styles.detailText, { color: theme.text }]}>
                          {item.tresorierAssigne.prenom} {item.tresorierAssigne.nom}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.tontineFooter}>
                    <Text style={[styles.tontineDate, { color: theme.placeholder }]}>
                      Début: {new Date(item.dateDebut).toLocaleDateString('fr-FR')}
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color={theme.placeholder} />
                  </View>
                </TouchableOpacity>
              )}
            />
          </>
        )}

        {/* MES GAINS */}
        {mesGains.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Mes gains ({mesGains.length})
            </Text>
            <FlatList
              data={mesGains}
              scrollEnabled={false}
              keyExtractor={(item, index) => item._id || index.toString()}
              renderItem={({ item }) => (
                <View style={[styles.gainCard, { backgroundColor: theme.surface }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.gainTontine, { color: theme.text }]}>
                      {item.tontine?.nom || 'Tontine'}
                    </Text>
                    <Text style={[styles.gainDate, { color: theme.textSecondary }]}>
                      {item.dateEffective ? new Date(item.dateEffective).toLocaleDateString('fr-FR') : 'Date inconnue'}
                    </Text>
                  </View>
                  <View style={styles.gainAmount}>
                    <Text style={[styles.gainValue, { color: Colors.accentGreen }]}>
                      {item.montant?.toLocaleString() || 0} FCFA
                    </Text>
                  </View>
                </View>
              )}
            />
          </>
        )}

        {/* Prochaines échéances */}
        {prochainesEcheances.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Prochaines échéances
            </Text>
            <FlatList
              data={prochainesEcheances}
              scrollEnabled={false}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={[styles.echeanceCard, { backgroundColor: theme.surface }]}>
                  <View style={styles.echeanceIcon}>
                    <Ionicons name="calendar" size={24} color={Colors.primaryDark} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.echeanceTontine, { color: theme.text }]}>
                      {item.tontine?.nom || 'Tontine'}
                    </Text>
                    <Text style={[styles.echeanceDate, { color: theme.textSecondary }]}>
                      Échéance: {new Date(item.dateLimite).toLocaleDateString('fr-FR')}
                    </Text>
                  </View>
                  <Text style={[styles.echeanceAmount, { color: Colors.danger }]}>
                    {item.montant?.toLocaleString()} FCFA
                  </Text>
                </View>
              )}
            />
          </>
        )}

        {/* Actions rapides */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Actions rapides</Text>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: Colors.accentGreen }]}
          onPress={() => {
            if (mesTontines && mesTontines.length > 0) {
              navigation.navigate('CreateTransaction', {
                tontineId: getTontineId(mesTontines[0]),
                tontineName: mesTontines[0].nom
              });
            } else {
              navigation.navigate('CreateTransaction');
            }
          }}
        >
          <MaterialCommunityIcons name="cash-plus" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Faire une cotisation</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: Colors.primaryDark }]}
          onPress={() => navigation.navigate('MyTontines')}
        >
          <Ionicons name="list" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Voir mes tontines</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: Colors.accentYellow }]}
          onPress={() => navigation.navigate('MyTransactions')}
        >
          <Ionicons name="receipt" size={24} color="#333" />
          <Text style={[styles.actionButtonText, { color: '#333' }]}>Historique des transactions</Text>
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
  alertText: { fontSize: 14, fontWeight: '600' },
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
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tontineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tontineLeft: { flex: 1, marginRight: 10 },
  tontineName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  tontineDescription: { fontSize: 13, marginTop: 2 },
  statutBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statutText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  tontineDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: { fontSize: 13 },
  tontineFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  tontineDate: { fontSize: 12 },
  gainCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  gainTontine: { fontSize: 15, fontWeight: '600' },
  gainDate: { fontSize: 13, marginTop: 4 },
  gainAmount: { alignItems: 'flex-end' },
  gainValue: { fontSize: 18, fontWeight: 'bold' },
  echeanceCard: {
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
  echeanceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8f4fd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  echeanceTontine: { fontSize: 15, fontWeight: '600' },
  echeanceDate: { fontSize: 13, marginTop: 4 },
  echeanceAmount: { fontSize: 16, fontWeight: 'bold' },
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

export default DashboardMembreScreen;