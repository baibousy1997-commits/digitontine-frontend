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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const currentUser = user;
      let tontineResult;
      
      if (currentUser.role === 'admin' || currentUser.role === 'tresorier') {
        console.log('Chargement en tant qu\'Admin/Tresorier');
        tontineResult = await tontineService.getTontineDetails(tontineId);
      } else {
        console.log('Chargement en tant que Membre');
        tontineResult = await tontineService.getTontineDetailsForMember(tontineId);
      }
      
      const tiragesResult = await tirageService.listeTiragesTontine(tontineId);

      if (tontineResult.success) {
        const tontineData = tontineResult.data?.data?.tontine;
        
        // CORRECTION : Calculer le nombre de membres reel
        if (tontineData && tontineData.membres) {
          tontineData.nombreMembres = tontineData.membres.length;
          console.log('Nombre de membres calcule:', tontineData.nombreMembres);
        }
        
        setTontine(tontineData);
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

  // FONCTION HELPER : Extraire les infos du membre de facon robuste
  const getMemberInfo = (membre) => {
    // Cas 1: Backend a envoye directement nom/email dans membre
    if (membre.nom && membre.email) {
      return {
        nom: membre.nom || 'Utilisateur',
        email: membre.email || 'N/A',
        initial: (membre.nom?.[0] || 'U').toUpperCase(),
      };
    }

    // Cas 2: userId est un objet (populated)
    if (membre.userId && typeof membre.userId === 'object') {
      const userObj = membre.userId;
      return {
        nom: userObj.nom || userObj.nomComplet || 'Utilisateur',
        email: userObj.email || 'N/A',
        initial: (userObj.nom?.[0] || userObj.prenom?.[0] || 'U').toUpperCase(),
      };
    }

    // Cas 3: Fallback
    return {
      nom: 'Membre',
      email: 'N/A',
      initial: 'M',
    };
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primaryDark} />
      </View>
    );
  }

  if (!tontine) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.text }}>Tontine introuvable</Text>
      </View>
    );
  }

  const isMembre = tontine.membres?.some(m => {
    const membreUserId = m.userId?._id || m.userId;
    return membreUserId?.toString() === user?.id?.toString();
  });
  
  const monMembre = tontine.membres?.find(m => {
    const membreUserId = m.userId?._id || m.userId;
    return membreUserId?.toString() === user?.id?.toString();
  });
  
  const aiDejaGagne = monMembre?.aGagne || false;

  // CORRECTION : Calculer le nombre reel de membres
  const nombreMembresReel = tontine.membres?.length || 0;

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
        {/* Card principale */}
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

        {/* Informations */}
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
              {nombreMembresReel}
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

        {/* CORRECTION LISTE MEMBRES */}
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Membres ({nombreMembresReel})
          </Text>
          {tontine.membres && tontine.membres.length > 0 ? (
            tontine.membres.map((membre, index) => {
              const membreInfo = getMemberInfo(membre);
              
              return (
                <View key={index} style={styles.membreRow}>
                  <View style={styles.membreAvatar}>
                    <Text style={styles.membreInitials}>
                      {membreInfo.initial}
                    </Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.membreName, { color: theme.text }]}>
                      {membreInfo.nom}
                    </Text>
                    <Text style={[styles.membreEmail, { color: theme.textSecondary }]}>
                      {membreInfo.email}
                    </Text>
                  </View>
                  {membre.aGagne && (
                    <Ionicons name="trophy" size={20} color={Colors.accentYellow} />
                  )}
                </View>
              );
            })
          ) : (
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Aucun membre pour le moment
            </Text>
          )}
        </View>

        {/* CORRECTION Historique tirages */}
        {tirages.length > 0 && (
          <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Historique tirages ({tirages.length})
            </Text>
            {tirages.map((tirage, index) => {
              // Extraire le nom du beneficiaire de facon robuste
              const getBeneficiaireName = () => {
                if (tirage.beneficiaireId) {
                  if (typeof tirage.beneficiaireId === 'object') {
                    return tirage.beneficiaireId.nomComplet || 
                           `${tirage.beneficiaireId.prenom || ''} ${tirage.beneficiaireId.nom || ''}`.trim() ||
                           'Beneficiaire';
                  }
                }
                if (tirage.beneficiaire) {
                  if (typeof tirage.beneficiaire === 'object') {
                    return tirage.beneficiaire.nomComplet || 
                           `${tirage.beneficiaire.prenom || ''} ${tirage.beneficiaire.nom || ''}`.trim() ||
                           'Beneficiaire';
                  }
                }
                return 'Beneficiaire inconnu';
              };

              return (
                <View key={index} style={styles.tirageRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.tirageBeneficiaire, { color: theme.text }]}>
                      Gagnant: {getBeneficiaireName()}
                    </Text>
                    <Text style={[styles.tirageDate, { color: theme.textSecondary }]}>
                      {new Date(tirage.dateTirage || tirage.dateEffective).toLocaleDateString('fr-FR')}
                    </Text>
                  </View>
                  <Text style={[styles.tirageMontant, { color: Colors.accentGreen }]}>
                    {(tirage.montantDistribue || tirage.montant || 0).toLocaleString()} FCFA
                  </Text>
                </View>
              );
            })}
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
  emptyText: { fontSize: 14, textAlign: 'center', marginVertical: 20 },
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