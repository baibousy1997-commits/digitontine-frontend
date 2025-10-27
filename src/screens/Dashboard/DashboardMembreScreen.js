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

const DashboardMembreScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const result = await dashboardService.getDashboardMembre();
      if (result.success) {
        setDashboardData(result.data?.data);
      }
    } catch (error) {
      console.error('Erreur chargement dashboard membre:', error);
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
        <ActivityIndicator size="large" color={theme.primaryDark} />
      </View>
    );
  }

  // Valeurs par défaut pour éviter null errors
  const resume = dashboardData?.resume || {};
  const mesTontines = dashboardData?.tontines || [];  // Corrigé
  const mesGains = dashboardData?.gains || [];        // Corrigé
  const prochainesEcheances = dashboardData?.prochainesEcheances || [];

  const retards = resume?.retards || 0;
  const tontinesActives = resume?.tontinesActives || 0;
  const totalCotise = resume?.totalCotise || 0;
  const totalGagne = resume?.totalGagne || 0;
  const penalites = resume?.totalPenalites || 0;  // Corrigé

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
                Regularisez rapidement pour eviter les penalites
              </Text>
            </View>
          </View>
        )}

        {/* Resume financier */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Mon resume</Text>
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
            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>Total cotise (FCFA)</Text>
          </View>
        </View>

        <View style={styles.kpiRow}>
          <View style={[styles.kpiCard, { backgroundColor: theme.surface }]}>
            <MaterialCommunityIcons name="gift" size={32} color={Colors.accentYellow} />
            <Text style={[styles.kpiValue, { color: theme.text }]}>
              {totalGagne?.toLocaleString() || 0}
            </Text>
            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>Total gagne (FCFA)</Text>
          </View>

          <View style={[styles.kpiCard, { backgroundColor: theme.surface }]}>
            <Ionicons name="alert-circle" size={32} color={retards > 0 ? Colors.danger : Colors.accentGreen} />
            <Text style={[styles.kpiValue, { color: theme.text }]}>
              {retards}
            </Text>
            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>Retards</Text>
          </View>
        </View>

        {/* Penalites */}
        {penalites > 0 && (
          <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Penalites cumulees</Text>
              <Text style={[styles.infoValue, { color: Colors.danger, fontWeight: 'bold' }]}>
                {penalites?.toLocaleString() || 0} FCFA
              </Text>
            </View>
          </View>
        )}

        {/* Mes tontines actives */}
        {mesTontines.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Mes tontines ({mesTontines.length})
            </Text>
            <FlatList
              data={mesTontines}
              scrollEnabled={false}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.tontineCard, { backgroundColor: theme.surface }]}
                  onPress={() => navigation.navigate('TontineDetails', { tontineId: item._id })}
                >
                  <View style={styles.tontineLeft}>
                    <Text style={[styles.tontineName, { color: theme.text }]}>
                      {item.nom}
                    </Text>
                    <Text style={[styles.tontineInfo, { color: theme.textSecondary }]}>
                      {item.frequence} - {item.montantCotisation?.toLocaleString()} FCFA
                    </Text>
                    <Text style={[styles.tontineDate, { color: theme.textSecondary }]}>
                      Début: {item.dateDebut ? new Date(item.dateDebut).toLocaleDateString('fr-FR') : 'N/A'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color={theme.placeholder} />
                </TouchableOpacity>
              )}
            />
          </>
        )}

        {/* Mes gains */}
        {mesGains.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Mes gains ({mesGains.length})
            </Text>
            <FlatList
              data={mesGains}
              scrollEnabled={false}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <View style={[styles.gainCard, { backgroundColor: theme.surface }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.gainTontine, { color: theme.text }]}>
                      Tontine (ID: {item.tontine})
                    </Text>
                    <Text style={[styles.gainDate, { color: theme.textSecondary }]}>
                      {new Date(item.dateEffective).toLocaleDateString('fr-FR')}
                    </Text>
                  </View>
                  <View style={styles.gainAmount}>
                    <Text style={[styles.gainValue, { color: Colors.accentGreen }]}>
                      +{item.montant?.toLocaleString()} FCFA
                    </Text>
                  </View>
                </View>
              )}
            />
          </>
        )}

        {/* Prochaines echeances */}
        {prochainesEcheances.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Prochaines echeances
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
                      Echeance: {new Date(item.dateLimite).toLocaleDateString('fr-FR')}
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
          onPress={() => navigation.navigate('CreateTransaction')}
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
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 20, marginBottom: 15 },
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
  tontineLeft: { flex: 1 },
  tontineName: { fontSize: 16, fontWeight: '600' },
  tontineInfo: { fontSize: 13, marginTop: 4 },
  tontineDate: { fontSize: 12, marginTop: 2 },
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