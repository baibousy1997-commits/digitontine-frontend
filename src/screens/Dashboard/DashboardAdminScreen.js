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
import Colors from '../../constants/colors';

const DashboardAdminScreen = ({ navigation }) => {
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
      const result = await dashboardService.getDashboardAdmin();
      if (result.success) {
        setDashboardData(result.data?.data);
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
        <ActivityIndicator size="large" color={theme.primaryDark} />
      </View>
    );
  }

  const utilisateurs = dashboardData?.utilisateurs || {};
  const tontines = dashboardData?.tontines || {};
  const financier = dashboardData?.financier || {};
  const alertes = dashboardData?.alertes || {};

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
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
              {utilisateurs.repartition?.Administrateur || 0}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Trésoriers</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {utilisateurs.repartition?.Tresorier || 0}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Membres</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {utilisateurs.repartition?.Membre || 0}
            </Text>
          </View>
        </View>

        {/* KPIs Tontines */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>💰 Tontines</Text>
        <View style={styles.kpiRow}>
          <View style={[styles.kpiCard, { backgroundColor: theme.surface }]}>
            <MaterialCommunityIcons name="hand-coin" size={32} color={Colors.primaryDark} />
            <Text style={[styles.kpiValue, { color: theme.text }]}>{tontines.total || 0}</Text>
            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>Total</Text>
          </View>

          <View style={[styles.kpiCard, { backgroundColor: theme.surface }]}>
            <Ionicons name="play-circle" size={32} color={Colors.accentGreen} />
            <Text style={[styles.kpiValue, { color: theme.text }]}>{tontines.actives || 0}</Text>
            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>Actives</Text>
          </View>

          <View style={[styles.kpiCard, { backgroundColor: theme.surface }]}>
            <Ionicons name="checkmark-done" size={32} color={Colors.placeholder} />
            <Text style={[styles.kpiValue, { color: theme.text }]}>{tontines.terminees || 0}</Text>
            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>Terminées</Text>
          </View>
        </View>

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
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Total distribué</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {financier.totalDistribue?.toLocaleString() || 0} FCFA
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
          style={[styles.actionButton, { backgroundColor: Colors.accentYellow }]}
          onPress={() => navigation.navigate('Statistics')}
        >
          <Ionicons name="stats-chart" size={24} color="#333" />
          <Text style={[styles.actionButtonText, { color: '#333' }]}>Voir les statistiques</Text>
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
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 20, marginBottom: 15 },
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