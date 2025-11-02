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
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import dashboardService from '../../services/dashboard/dashboardService';
import tontineService from '../../services/tontine/tontineService';
import tirageService from '../../services/tirage/tirageService';
import Colors from '../../constants/colors';

const DashboardAdminScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [tontines, setTontines] = useState([]);
  const [showTontineModal, setShowTontineModal] = useState(false);
  const [tirageType, setTirageType] = useState(null);
  const [processingTirage, setProcessingTirage] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      
      console.log('ADMIN - Chargement dashboard admin...');
      
      const result = await dashboardService.getDashboardAdmin();
      if (result.success) {
        console.log('Dashboard data:', result.data?.data);
        setDashboardData(result.data?.data);
        
        const tontinesList = result.data?.data?.tontines?.mesTontines || [];
        console.log('Tontines chargees:', tontinesList.length);
        setTontines(tontinesList);
      } else {
        console.error('Erreur dashboard:', result.error);
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

  const handleTirageNormal = () => {
    setTirageType('normal');
    setShowTontineModal(true);
  };

  const handleTirageTest = () => {
    Alert.alert(
      'MODE TEST',
      'Ce tirage sera effectue SANS verification des cotisations ni des opt-in. Continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Continuer',
          onPress: () => {
            setTirageType('test');
            setShowTontineModal(true);
          },
        },
      ]
    );
  };

  const effectuerTirage = async (tontineId) => {
    try {
      setProcessingTirage(true);
      setShowTontineModal(false);

      const tontine = tontines.find(t => (t.id || t._id) === tontineId);
      if (!tontine) {
        Alert.alert('Erreur', 'Tontine introuvable');
        return;
      }

      let result;
      if (tirageType === 'test') {
        result = await tirageService.effectuerTirageAutomatiqueTest(tontineId);
      } else {
        result = await tirageService.effectuerTirageAutomatique(tontineId);
      }

      if (result.success) {
        const beneficiaire = result.data?.data?.tirage?.beneficiaire || result.data?.tirage?.beneficiaire;
        const montant = result.data?.data?.tirage?.montant || result.data?.tirage?.montant;

        Alert.alert(
          'Tirage Effectue',
          `Gagnant : ${beneficiaire?.nom || 'N/A'}\n` +
          `Montant : ${montant?.toLocaleString() || 0} FCFA\n` +
          `Tontine : ${tontine.nom}`,
          [{ text: 'OK', onPress: () => loadDashboard() }]
        );
      } else {
        Alert.alert(
          'Erreur',
          result.error?.message || 'Impossible d\'effectuer le tirage'
        );
      }
    } catch (error) {
      console.error('Erreur tirage:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors du tirage');
    } finally {
      setProcessingTirage(false);
    }
  };

  const renderTontineItem = ({ item }) => {
    const tontineId = item.id || item._id;
    const isActive = item.statut === 'Active';

    return (
      <TouchableOpacity
        style={[
          styles.modalTontineItem,
          { backgroundColor: isActive ? theme.surface : '#f5f5f5' },
        ]}
        onPress={() => effectuerTirage(tontineId)}
        disabled={!isActive || processingTirage}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.modalTontineName, { color: isActive ? theme.text : '#999' }]}>
            {item.nom}
          </Text>
          <Text style={[styles.modalTontineInfo, { color: theme.textSecondary }]}>
            {item.nombreMembres || 0} membres - {item.montantCotisation?.toLocaleString()} FCFA
          </Text>
        </View>
        <View
          style={[
            styles.modalStatutBadge,
            { backgroundColor: isActive ? Colors.accentGreen : Colors.placeholder },
          ]}
        >
          <Text style={styles.modalStatutText}>{item.statut}</Text>
        </View>
      </TouchableOpacity>
    );
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
        {(alertes.membresEnRetard > 0 || alertes.tontinesBloquees > 0) && (
          <View style={[styles.alertBox, { backgroundColor: '#fff3cd' }]}>
            <Ionicons name="warning" size={24} color="#856404" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              {alertes.membresEnRetard > 0 && (
                <Text style={styles.alertText}>
                  {alertes.membresEnRetard} membre(s) en retard
                </Text>
              )}
              {alertes.tontinesBloquees > 0 && (
                <Text style={styles.alertText}>
                  {alertes.tontinesBloquees} tontine(s) bloquee(s)
                </Text>
              )}
            </View>
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Utilisateurs</Text>
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

        <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
          <Text style={[styles.infoTitle, { color: theme.text }]}>Repartition par role</Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Administrateurs</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {repartition.Administrateur || 0}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Tresoriers</Text>
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

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Tontines</Text>
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
            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>Terminees</Text>
          </View>
        </View>

        {tontines.length > 0 ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>
                Tontines recentes ({tontines.length})
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
                      {tontine.nombreMembres || 0} membres - {tontine.montantCotisation?.toLocaleString()} FCFA
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
              Aucune tontine creee
            </Text>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
              Creez votre premiere tontine pour commencer
            </Text>
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Financier</Text>
        <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Total collecte</Text>
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

        {/*  CORRECTION : Renommé "Gestion Utilisateurs" */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Gestion Utilisateurs</Text>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#FF6B6B' }]}
          onPress={() => navigation.navigate('ManageUsers', { criticalActions: true })}
        >
          <MaterialCommunityIcons name="shield-account" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Gerer les utilisateurs</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#9C27B0' }]}
          onPress={() => navigation.navigate('MyValidationRequests')}
        >
          <MaterialCommunityIcons name="clipboard-check" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Mes demandes de validation</Text>
        </TouchableOpacity>

       

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: Colors.primaryDark }]}
          onPress={() => navigation.navigate('CreateUser')}
        >
          <Ionicons name="person-add" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Creer un utilisateur</Text>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Gestion Tontines</Text>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: Colors.accentGreen }]}
          onPress={() => navigation.navigate('CreateTontine')}
        >
          <MaterialCommunityIcons name="hand-coin" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Creer une tontine</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#6C63FF' }]}
          onPress={() => navigation.navigate('ManageTontines')}
        >
          <MaterialCommunityIcons name="cog" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Gerer les tontines</Text>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Tirages</Text>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#FF6B6B' }]}
          onPress={handleTirageNormal}
          disabled={tontines.length === 0}
        >
          <MaterialCommunityIcons name="dice-multiple" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Tirage Normal (avec validations)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#FFA500' }]}
          onPress={handleTirageTest}
          disabled={tontines.length === 0}
        >
          <MaterialCommunityIcons name="flask" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Tirage TEST (sans validations)</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showTontineModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTontineModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {tirageType === 'test' ? 'Tirage TEST' : 'Tirage Normal'}
              </Text>
              <TouchableOpacity onPress={() => setShowTontineModal(false)}>
                <Ionicons name="close" size={28} color={theme.text} />
              </TouchableOpacity>
            </View>

            {tirageType === 'test' && (
              <View style={[styles.warningBox, { backgroundColor: '#fff3cd' }]}>
                <Ionicons name="warning" size={20} color="#856404" />
                <Text style={styles.warningText}>
                  Mode TEST : Aucune verification des cotisations ni opt-in
                </Text>
              </View>
            )}

            <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
              Selectionnez une tontine active :
            </Text>

            {processingTirage ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primaryDark} />
                <Text style={{ color: theme.text, marginTop: 10 }}>
                  Tirage en cours...
                </Text>
              </View>
            ) : (
              <FlatList
                data={tontines.filter(t => t.statut === 'Active')}
                keyExtractor={(item) => item.id || item._id}
                renderItem={renderTontineItem}
                ListEmptyComponent={
                  <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                    Aucune tontine active disponible
                  </Text>
                }
              />
            )}
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 15,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  warningText: {
    fontSize: 13,
    color: '#856404',
    marginLeft: 10,
    flex: 1,
  },
  modalTontineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  modalTontineName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  modalTontineInfo: {
    fontSize: 13,
  },
  modalStatutBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  modalStatutText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 30,
  },
});

export default DashboardAdminScreen;