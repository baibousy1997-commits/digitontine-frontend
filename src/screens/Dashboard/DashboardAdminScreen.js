// src/screens/Dashboard/DashboardAdminScreen.js
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import dashboardService from '../../services/dashboard/dashboardService';
import tontineService from '../../services/tontine/tontineService';
import Colors from '../../constants/colors';

const DashboardAdminScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [tontines, setTontines] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

 const loadDashboard = async () => {
    try {
      setLoading(true);
      
      console.log('ADMIN - Chargement dashboard admin...');
      
      // 1. Dashboard Admin
      const result = await dashboardService.getDashboardAdmin();
      if (result.success) {
        console.log('Dashboard data:', result.data?.data);
        setDashboardData(result.data?.data);
      } else {
        console.error('Erreur dashboard:', result.error);
      }

      // 2. ADMIN charge TOUTES les tontines via /tontines
      console.log('ADMIN - Chargement de TOUTES les tontines...');
      const tontinesResult = await tontineService.listTontines({ limit: 100 });
      
      if (tontinesResult.success) {
        let tontinesList = [];
        
        if (Array.isArray(tontinesResult.data?.data?.data)) {
          tontinesList = tontinesResult.data.data.data;
        } else if (Array.isArray(tontinesResult.data?.data)) {
          tontinesList = tontinesResult.data.data;
        } else if (Array.isArray(tontinesResult.data)) {
          tontinesList = tontinesResult.data;
        }
        
        console.log('Tontines chargees (Admin):', tontinesList.length);
        console.log('Structure:', tontinesList[0]);
        setTontines(tontinesList);
      } else {
        console.error('Erreur tontines:', tontinesResult.error);
        setTontines([]);
      }
    } catch (error) {
      console.error('Erreur chargement dashboard admin:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  if (loading && !dashboardData) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={Colors.primaryDark} />
        <Text style={{ color: theme.text, marginTop: 10 }}>Chargement...</Text>
      </View>
    );
  }

  const utilisateurs = dashboardData?.utilisateurs || {};
  const tontinesStats = dashboardData?.tontines || {};
  
  // ✅ Structure financière
  const financierData = dashboardData?.financier || [];
  const financier = {
    totalCollecte: Array.isArray(financierData) 
      ? financierData.find(f => f._id === 'Validee')?.montantTotal || 0 
      : financierData.totalCollecte || 0,
    totalDistribue: 0,
    soldeDisponible: Array.isArray(financierData) 
      ? financierData.find(f => f._id === 'Validee')?.montantTotal || 0 
      : financierData.soldeDisponible || 0
  };
  
  const alertes = dashboardData?.alertes || {};

  // ✅ Répartition des rôles
  const repartition = {};
  if (utilisateurs.repartitionRoles && Array.isArray(utilisateurs.repartitionRoles)) {
    utilisateurs.repartitionRoles.forEach(r => {
      repartition[r._id] = r.count;
    });
  } else if (utilisateurs.repartition) {
    Object.assign(repartition, utilisateurs.repartition);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.isDarkMode ? 'light-content' : 'dark-content'} />
      
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Dashboard Admin</Text>
        <TouchableOpacity onPress={loadDashboard}>
          <Ionicons name="refresh" size={26} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Alertes */}
        {(alertes.membresEnRetard > 0 || alertes.tontinesBloquees > 0) && (
          <View style={[styles.alertBox, { backgroundColor: '#fff3cd' }]}>
            <Ionicons name="warning" size={24} color="#856404" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              {alertes.membresEnRetard > 0 && (
                <Text style={styles.alertText}>
                  ⚠️ {alertes.membresEnRetard} membre(s) en retard
                </Text>
              )}
              {alertes.tontinesBloquees > 0 && (
                <Text style={styles.alertText}>
                  🔒 {alertes.tontinesBloquees} tontine(s) bloquée(s)
                </Text>
              )}
            </View>
          </View>
        )}

        {/* KPIs Utilisateurs */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>👥 Utilisateurs</Text>
        <View style={styles.kpiRow}>
          <View style={[styles.kpiCard, { backgroundColor: theme.surface }]}>
            <MaterialCommunityIcons name="account-group" size={32} color={Colors.primaryDark} />
            <Text style={[styles.kpiValue, { color: theme.text }]}>{utilisateurs.total || 0}</Text>
            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>Total</Text>
          </View>

          <View style={[styles.kpiCard, { backgroundColor: theme.surface }]}>
            <Ionicons name="checkmark-circle" size={32} color={Colors.accentGreen} />
            <Text style={[styles.kpiValue, { color: theme.text }]}>{utilisateurs.actifs || 0}</Text>
            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>Actifs</Text>
          </View>

          <View style={[styles.kpiCard, { backgroundColor: theme.surface }]}>
            <Ionicons name="person-add" size={32} color={Colors.accentYellow} />
            <Text style={[styles.kpiValue, { color: theme.text }]}>{utilisateurs.nouveauxCeMois || 0}</Text>
            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>Nouveaux</Text>
          </View>
        </View>

        {/* Répartition par rôle */}
        <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
          <Text style={[styles.infoTitle, { color: theme.text }]}>Répartition par rôle</Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Administrateurs</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {repartition.Administrateur || 0}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Trésoriers</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {repartition.Tresorier || 0}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Membres</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {repartition.Membre || 0}
            </Text>
          </View>
        </View>

        {/* KPIs Tontines */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>💰 Tontines</Text>
        <View style={styles.kpiRow}>
          <View style={[styles.kpiCard, { backgroundColor: theme.surface }]}>
            <MaterialCommunityIcons name="hand-coin" size={32} color={Colors.primaryDark} />
            <Text style={[styles.kpiValue, { color: theme.text }]}>{tontinesStats.total || 0}</Text>
            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>Total</Text>
          </View>

          <View style={[styles.kpiCard, { backgroundColor: theme.surface }]}>
            <Ionicons name="play-circle" size={32} color={Colors.accentGreen} />
            <Text style={[styles.kpiValue, { color: theme.text }]}>{tontinesStats.actives || 0}</Text>
            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>Actives</Text>
          </View>

          <View style={[styles.kpiCard, { backgroundColor: theme.surface }]}>
            <Ionicons name="checkmark-done" size={32} color={Colors.placeholder} />
            <Text style={[styles.kpiValue, { color: theme.text }]}>{tontinesStats.terminees || 0}</Text>
            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>Terminées</Text>
          </View>
        </View>

        {/* ✅ LISTE DES TONTINES RÉCENTES */}
        {tontines.length > 0 ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>
                Tontines récentes ({tontines.length})
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('ManageTontines')}>
                <Text style={[styles.seeAllText, { color: Colors.primaryDark }]}>
                  Voir tout
                </Text>
              </TouchableOpacity>
            </View>
            
            {tontines.slice(0, 3).map((tontine, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.tontineCard, { backgroundColor: theme.surface }]}
                onPress={() => navigation.navigate('TontineDetails', { 
                  tontineId: tontine.id || tontine._id 
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
                    { backgroundColor: tontine.statut === 'Active' ? Colors.accentGreen : Colors.accentYellow }
                  ]}>
                    <Text style={styles.statutText}>{tontine.statut}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.infoTitle, { color: theme.text }]}>
              Aucune tontine créée
            </Text>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
              Créez votre première tontine pour commencer
            </Text>
          </View>
        )}

        {/* Statistiques Financières */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>💵 Financier</Text>
        <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Total collecté</Text>
            <Text style={[styles.infoValue, { color: Colors.accentGreen, fontWeight: 'bold' }]}>
              {financier.totalCollecte?.toLocaleString() || 0} FCFA
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Solde disponible</Text>
            <Text style={[styles.infoValue, { color: Colors.primaryDark, fontWeight: 'bold' }]}>
              {financier.soldeDisponible?.toLocaleString() || 0} FCFA
            </Text>
          </View>
        </View>

        {/* Actions rapides */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>⚡ Actions rapides</Text>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: Colors.primaryDark }]}
          onPress={() => navigation.navigate('CreateUser')}
        >
          <Ionicons name="person-add" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Créer un utilisateur</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: Colors.accentGreen }]}
          onPress={() => navigation.navigate('CreateTontine')}
        >
          <MaterialCommunityIcons name="hand-coin" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Créer une tontine</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#6C63FF' }]}
          onPress={() => navigation.navigate('ManageTontines')}
        >
          <MaterialCommunityIcons name="cog" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Gérer les tontines</Text>
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
  alertText: { fontSize: 14, color: '#856404', marginBottom: 4 },
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
    marginBottom: 20,
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
  kpiValue: { fontSize: 24, fontWeight: 'bold', marginTop: 8 },
  kpiLabel: { fontSize: 12, marginTop: 4 },
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
  infoTitle: { fontSize: 16, fontWeight: '700', marginBottom: 15 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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

export default DashboardAdminScreen;