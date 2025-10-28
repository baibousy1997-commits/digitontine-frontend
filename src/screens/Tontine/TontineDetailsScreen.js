// src/screens/Tontine/TontineDetailsScreen.js
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuthContext } from '../../context/AuthContext';
import tontineService from '../../services/tontine/tontineService';
import tirageService from '../../services/tirage/tirageService';
import Colors from '../../constants/colors';
 

const TontineDetailsScreen = ({ navigation, route }) => {
  const { tontineId } = route.params;
  const { theme } = useTheme();
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tontine, setTontine] = useState(null);
  const [tirages, setTirages] = useState([]);
  const [optInLoading, setOptInLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
  try {
    setLoading(true);
    
    //  1. Vérifier le rôle de l'utilisateur connecté
    const currentUser = user; // Depuis useAuthContext()
    
    // . Choisir la bonne méthode selon le rôle
    let tontineResult;
    
    if (currentUser.role === 'Administrateur') {
      // Admin : Accès complet via /tontines/:tontineId
      console.log(' Chargement en tant qu\'Admin');
      tontineResult = await tontineService.getTontineDetails(tontineId);
    } else {
      // Membre/Trésorier : Accès limité via /tontines/:tontineId/details
      console.log('👤 Chargement en tant que Membre');
      tontineResult = await tontineService.getTontineDetailsForMember(tontineId);
    }
    
    //  Charger les tirages (accessible à tous)
    const tiragesResult = await tirageService.listeTiragesTontine(tontineId);

    if (tontineResult.success) {
      setTontine(tontineResult.data?.data?.tontine);
    }
    
    if (tiragesResult.success) {
      setTirages(tiragesResult.data?.data || []);
    }
  } catch (error) {
    console.error('Erreur chargement details:', error);
  } finally {
    setLoading(false);
  }
};

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleOptIn = async (participe) => {
    setOptInLoading(true);
    try {
      const result = await tontineService.optInForTirage(tontineId, participe);
      
      if (result.success) {
        Alert.alert(
          'Succes',
          participe 
            ? 'Vous participerez au prochain tirage' 
            : 'Vous ne participerez pas au prochain tirage'
        );
        await loadData();
      } else {
        Alert.alert('Erreur', result.error?.message || 'Operation echouee');
      }
    } catch (error) {
      console.error('Erreur opt-in:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setOptInLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={Colors.primaryDark} />
      </View>
    );
  }

  if (!tontine) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Tontine introuvable</Text>
      </View>
    );
  }

  const isMembre = tontine.membres?.some(m => m.userId === user?.id);
  const monMembre = tontine.membres?.find(m => m.userId === user?.id);
  const aiDejaGagne = monMembre?.aGagne || false;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.isDarkMode ? 'light-content' : 'dark-content'} />
      
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Details</Text>
        <TouchableOpacity onPress={loadData}>
          <Ionicons name="refresh" size={26} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={[styles.tontineName, { color: theme.text }]}>
            {tontine.nom}
          </Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            {tontine.description || 'Aucune description'}
          </Text>
          
          <View style={[styles.statutBadge, { backgroundColor: Colors.accentGreen }]}>
            <Text style={styles.statutText}>{tontine.statut}</Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Informations
          </Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
              Montant cotisation
            </Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {tontine.montantCotisation?.toLocaleString()} FCFA
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
              Frequence
            </Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {tontine.frequence}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
              Membres
            </Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {tontine.nombreMembres} / {tontine.nombreMembresMax}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
              Date debut
            </Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {new Date(tontine.dateDebut).toLocaleDateString('fr-FR')}
            </Text>
          </View>
        </View>

        {isMembre && !aiDejaGagne && tontine.statut === 'Active' && (
          <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Participation au tirage
            </Text>
            <Text style={[styles.optInDescription, { color: theme.textSecondary }]}>
              Souhaitez-vous participer au prochain tirage ?
            </Text>
            
            <View style={styles.optInButtons}>
              <TouchableOpacity
                style={[
                  styles.optInButton,
                  { backgroundColor: Colors.accentGreen },
                  optInLoading && { opacity: 0.5 }
                ]}
                onPress={() => handleOptIn(true)}
                disabled={optInLoading}
              >
                <Text style={styles.optInButtonText}>Oui, je participe</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optInButton,
                  { backgroundColor: Colors.danger },
                  optInLoading && { opacity: 0.5 }
                ]}
                onPress={() => handleOptIn(false)}
                disabled={optInLoading}
              >
                <Text style={styles.optInButtonText}>Non, pas maintenant</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Membres ({tontine.membres?.length || 0})
          </Text>
          {tontine.membres?.map((membre, index) => (
            <View key={index} style={styles.membreRow}>
              <View style={styles.membreAvatar}>
                <Text style={styles.membreInitials}>
                  {membre.nom?.[0] || 'M'}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.membreName, { color: theme.text }]}>
                  {membre.nom}
                </Text>
                <Text style={[styles.membreEmail, { color: theme.textSecondary }]}>
                  {membre.email}
                </Text>
              </View>
              {membre.aGagne && (
                <Ionicons name="trophy" size={20} color={Colors.accentYellow} />
              )}
            </View>
          ))}
        </View>

        {tirages.length > 0 && (
          <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Historique tirages ({tirages.length})
            </Text>
            {tirages.map((tirage, index) => (
              <View key={index} style={styles.tirageRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.tirageBeneficiaire, { color: theme.text }]}>
                    Gagnant: {tirage.beneficiaire?.nom || 'N/A'}
                  </Text>
                  <Text style={[styles.tirageDate, { color: theme.textSecondary }]}>
                    {new Date(tirage.dateEffective).toLocaleDateString('fr-FR')}
                  </Text>
                </View>
                <Text style={[styles.tirageMontant, { color: Colors.accentGreen }]}>
                  {tirage.montant?.toLocaleString()} FCFA
                </Text>
              </View>
            ))}
          </View>
        )}
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
  tontineName: { fontSize: 24, fontWeight: '700', marginBottom: 10 },
  description: { fontSize: 14, marginBottom: 15 },
  statutBadge: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  statutText: { fontSize: 12, color: '#fff', fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 15 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: { fontSize: 14 },
  infoValue: { fontSize: 14, fontWeight: '600' },
  optInDescription: { fontSize: 14, marginBottom: 20 },
  optInButtons: { gap: 10 },
  optInButton: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  optInButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  membreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  membreAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  membreInitials: { fontSize: 16, fontWeight: '600', color: '#fff' },
  membreName: { fontSize: 15, fontWeight: '600' },
  membreEmail: { fontSize: 13, marginTop: 2 },
  tirageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tirageBeneficiaire: { fontSize: 15, fontWeight: '600' },
  tirageDate: { fontSize: 12, marginTop: 4 },
  tirageMontant: { fontSize: 16, fontWeight: 'bold' },
});

export default TontineDetailsScreen;