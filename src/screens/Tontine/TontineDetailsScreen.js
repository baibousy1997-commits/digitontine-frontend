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
import notificationService from '../../services/notification/notificationService';
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
  const [invitations, setInvitations] = useState([]);
  const [loadingInvitations, setLoadingInvitations] = useState(true);

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

    //  CHARGER LES INVITATIONS
    await loadInvitations();
  };

  //  NOUVELLE FONCTION : Charger les invitations
//  REMPLACER la fonction loadInvitations (ligne ~56)

const loadInvitations = async () => {
  //  VÉRIFIER LE RÔLE AVANT D'APPELER L'API
  const currentUser = user;
  const isAdmin = currentUser?.role?.toLowerCase() === 'admin' || 
                  currentUser?.role?.toLowerCase() === 'administrateur';
  
  if (!isAdmin) {
    console.log(' Invitations réservées aux admins - Skip');
    setInvitations([]);
    setLoadingInvitations(false);
    return; //  SORTIR ICI POUR LES NON-ADMINS
  }

  //   (seulement pour les admins)
  try {
    setLoadingInvitations(true);
    console.log('🔍 [ADMIN] Chargement des invitations pour tontineId:', tontineId);

    const invitationsResult = await tontineService.getTontineInvitations(tontineId);

    if (invitationsResult.success && invitationsResult.data?.data?.invitations) {
      const invitationsData = invitationsResult.data.data.invitations;
      console.log(` ${invitationsData.length} invitation(s) trouvée(s)`);
      
      invitationsData.forEach(inv => {
        console.log(`  - ${inv.memberName} (${inv.memberEmail}) : ${inv.statut}`);
      });
      
      setInvitations(invitationsData);
    } else {
      console.log('ℹ Aucune invitation trouvée');
      setInvitations([]);
    }
  } catch (error) {
    console.error(' Erreur chargement invitations:', error);
    setInvitations([]);
  } finally {
    setLoadingInvitations(false);
  }
};
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  //  Helper pour extraire les infos du membre
  const getMemberInfo = (membre) => {
    if (membre.nom && membre.email) {
      return {
        nom: membre.nom || 'Utilisateur',
        email: membre.email || 'N/A',
        initial: (membre.nom?.[0] || 'U').toUpperCase(),
      };
    }

    if (membre.userId && typeof membre.userId === 'object') {
      const userObj = membre.userId;
      return {
        nom: userObj.nom || userObj.nomComplet || 'Utilisateur',
        email: userObj.email || 'N/A',
        initial: (userObj.nom?.[0] || userObj.prenom?.[0] || 'U').toUpperCase(),
      };
    }

    return {
      nom: 'Membre',
      email: 'N/A',
      initial: 'M',
    };
  };

  //  Helper pour obtenir la couleur du statut d'invitation
  const getInvitationStatusColor = (actionTaken) => {
    switch (actionTaken) {
      case 'accepted':
        return Colors.accentGreen;
      case 'refused':
        return Colors.danger || '#E74C3C';
      default: // null (en attente)
        return Colors.accentYellow || '#F39C12';
    }
  };

  //  Helper pour obtenir l'icône du statut
  const getInvitationStatusIcon = (actionTaken) => {
    switch (actionTaken) {
      case 'accepted':
        return 'checkmark-circle';
      case 'refused':
        return 'close-circle';
      default:
        return 'time';
    }
  };

  //  Helper pour obtenir le texte du statut
  const getInvitationStatusText = (actionTaken) => {
    switch (actionTaken) {
      case 'accepted':
        return 'Acceptée';
      case 'refused':
        return 'Refusée';
      default:
        return 'En attente';
    }
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

  const nombreMembresReel = tontine.membres?.length || 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.isDarkMode ? 'light-content' : 'dark-content'} />
      
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Détails</Text>
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
              Fréquence
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
              Date début
            </Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {new Date(tontine.dateDebut).toLocaleDateString('fr-FR')}
            </Text>
          </View>
        </View>

       

{/* SECTION INVITATIONS EN ATTENTE - ADMIN ONLY */}
{(user?.role === 'admin' || user?.role === 'administrateur') && (
  <View style={[styles.card, { backgroundColor: theme.surface }]}>
    <View style={styles.sectionHeaderWithBadge}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Invitations
      </Text>
   {!loadingInvitations && (
  <View style={[styles.badge, { backgroundColor: Colors.primaryDark }]}>
    <Text style={styles.badgeText}>{invitations.length}</Text>
  </View>
)}
    </View>

    {loadingInvitations ? (
      <ActivityIndicator size="small" color={Colors.primaryDark} />
    ) : invitations.length > 0 ? (
      invitations.map((invitation, index) => {
        const statusColor = getInvitationStatusColor(invitation.statut);
        const statusIcon = getInvitationStatusIcon(invitation.statut);
        const statusText = getInvitationStatusText(invitation.statut);

        return (
          <View 
            key={invitation.notificationId || index} 
            style={[
              styles.invitationRow,
              { borderLeftColor: statusColor }
            ]}
          >
            {/* Avatar + Infos */}
            <View style={{ flex: 1 }}>
              <Text style={[styles.invitationMemberName, { color: theme.text }]}>
                {invitation.memberName}
              </Text>
              <Text style={[styles.invitationMemberEmail, { color: theme.textSecondary }]}>
                {invitation.memberEmail}
              </Text>
              <Text style={[styles.invitationDate, { color: theme.placeholder }]}>
                Envoyée le {new Date(invitation.dateEnvoyee).toLocaleDateString('fr-FR')}
              </Text>
              {invitation.dateResponse && (
                <Text style={[styles.invitationDate, { color: theme.placeholder }]}>
                  Répondu le {new Date(invitation.dateResponse).toLocaleDateString('fr-FR')}
                </Text>
              )}
            </View>

            {/* Statut */}
            <View style={{ alignItems: 'center', gap: 5 }}>
              <Ionicons 
                name={statusIcon} 
                size={24} 
                color={statusColor} 
              />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {statusText}
              </Text>
            </View>
          </View>
        );
      })
    ) : (
      <View style={styles.emptyState}>
        <Ionicons name="mail-open-outline" size={48} color={theme.textSecondary} />
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          Aucune invitation pour le moment
        </Text>
      </View>
    )}
  </View>
)}
        {/* LISTE MEMBRES ACCEPTÉS */}
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

        {/* Historique tirages */}
        {tirages.length > 0 && (
          <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
               Historique tirages ({tirages.length})
            </Text>
            {tirages.map((tirage, index) => {
              const getBeneficiaireName = () => {
                if (tirage.beneficiaireId) {
                  if (typeof tirage.beneficiaireId === 'object') {
                    return tirage.beneficiaireId.nomComplet || 
                           `${tirage.beneficiaireId.prenom || ''} ${tirage.beneficiaireId.nom || ''}`.trim() ||
                           'Bénéficiaire';
                  }
                }
                if (tirage.beneficiaire) {
                  if (typeof tirage.beneficiaire === 'object') {
                    return tirage.beneficiaire.nomComplet || 
                           `${tirage.beneficiaire.prenom || ''} ${tirage.beneficiaire.nom || ''}`.trim() ||
                           'Bénéficiaire';
                  }
                }
                return 'Bénéficiaire inconnu';
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
  
  //  Styles pour les invitations
  sectionHeaderWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 30,
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  invitationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderRadius: 10,
    borderLeftWidth: 4,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  invitationMemberName: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  invitationMemberEmail: { fontSize: 12, marginBottom: 3 },
  invitationDate: { fontSize: 11 },
  statusText: { fontSize: 11, fontWeight: '600', textAlign: 'center' },

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