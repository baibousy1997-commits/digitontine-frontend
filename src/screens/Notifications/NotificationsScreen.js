// src/screens/Notifications/NotificationsScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import validationService from '../../services/validation/validationService';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import notificationService from '../../services/notification/notificationService';
import { useTheme } from '../../context/ThemeContext';
import Colors from '../../constants/colors';

const NotificationsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    loadNotifications();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [])
  );

  const loadNotifications = async () => {
    try {
      setLoading(true);
      console.log('[NotificationsScreen] Debut chargement...');
      
      const result = await notificationService.getMyNotifications();
      
      console.log('[NotificationsScreen] Result complet:', JSON.stringify(result, null, 2));
      
      if (result.success) {
        const notifs = result.data?.data?.notifications || result.data?.notifications || [];
        
        console.log('[NotificationsScreen] Notifications extraites:', notifs.length);
        setNotifications(notifs);
      } else {
        console.error('Erreur chargement notifications:', result.error);
        setNotifications([]);
      }
    } catch (error) {
      console.error('Exception:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, lu: true } : n)
      );
    } catch (error) {
      console.error('Erreur marquage lu:', error);
    }
  };



const handleAction = async (notification, action) => {
  try {
    setActionLoading(prev => ({ ...prev, [notification._id]: true }));

    // CAS 1 : Invitation tontine
    if (notification.type === 'TONTINE_INVITATION') {
      const accepter = action === 'accepted';

      if (accepter) {
        Alert.alert(
          'Reglement de la tontine',
          notification.message || 'Aucun reglement disponible',
          [
            { text: 'Annuler', style: 'cancel' },
            {
              text: 'Accepter le reglement',
              onPress: async () => {
                const result = await notificationService.acceptInvitation(notification._id);

                if (result.success) {
                  Alert.alert(
                    'Bienvenue !',
                    `Vous avez rejoint "${notification.data?.tontineId?.nom || 'la tontine'}" avec succes.\n\nVous recevrez les notifications de tirage.`,
                    [{ text: 'OK' }]
                  );
                  setNotifications(prev => prev.filter(n => n._id !== notification._id));
                } else {
                  Alert.alert('Erreur', result.error || 'Impossible d\'accepter l\'invitation');
                }
              }
            }
          ],
          { cancelable: true }
        );
      } else {
        Alert.alert(
          'Refuser l\'invitation',
          'Etes-vous sur de vouloir refuser cette invitation ?',
          [
            { text: 'Annuler', style: 'cancel' },
            {
              text: 'Confirmer le refus',
              style: 'destructive',
              onPress: async () => {
                const result = await notificationService.refuseInvitation(notification._id);

                if (result.success) {
                  Alert.alert('Invitation refusee', 'Invitation declinee.', [{ text: 'OK' }]);
                  setNotifications(prev => prev.filter(n => n._id !== notification._id));
                } else {
                  Alert.alert('Erreur', result.error || 'Impossible de refuser l\'invitation');
                }
              }
            }
          ]
        );
      }
    } 
    // CAS 2 : Notification tirage (opt-in)
    else if (notification.type === 'TIRAGE_NOTIFICATION') {
      const result = await notificationService.takeAction(notification._id, action);

      if (result.success) {
        Alert.alert(
          action === 'accepted' ? 'Confirmation' : 'Refus enregistre',
          action === 'accepted' 
            ? 'Vous participez au prochain tirage' 
            : 'Vous ne participerez pas au tirage',
          [{ text: 'OK' }]
        );

        setNotifications(prev =>
          prev.map(n =>
            n._id === notification._id
              ? { ...n, actionTaken: action, lu: true }
              : n
          )
        );
      } else {
        Alert.alert('Erreur', result.error || 'Impossible d\'enregistrer votre choix');
      }
    }
    // CAS 3 : VALIDATION DE DEMANDE (TRESORIER)
    else if (notification.type === 'VALIDATION_REQUEST') {
      // EXTRACTION DIRECTE depuis notification.data
      const validationRequestId = notification.data?.validationRequestId;
      
      if (!validationRequestId) {
        Alert.alert('Erreur', 'ID de validation introuvable dans la notification');
        return;
      }
      
      const actionTypeRaw = notification.titre || notification.data?.actionType || '';
      const actionTypeLabel = actionTypeRaw.replace('Validation requise - ', '').trim();
      
      const messageMatch = notification.message?.match(/pour : (.+?)\. Raison/);
      const resourceName = messageMatch ? messageMatch[1] : 'Ressource inconnue';
      
      const reason = notification.message?.split('Raison : ')[1] || 'Pas de raison fournie';

      if (action === 'accepted') {
        Alert.alert(
          'Accepter cette demande ?',
          `Action : ${actionTypeLabel}\n\nRessource : ${resourceName}\n\nRaison : ${reason}\n\nL'action sera EXECUTEE IMMEDIATEMENT apres acceptation.`,
          [
            { text: 'Annuler', style: 'cancel' },
            {
              text: 'Accepter et Executer',
              style: 'default',
              onPress: async () => {
                const result = await validationService.acceptValidation(validationRequestId);

                if (result.success) {
                  const actionExecuted = result.data?.data?.actionExecuted || result.data?.actionExecuted;
                  const actionResult = result.data?.data?.actionResult || result.data?.actionResult;
                  
                  if (actionExecuted) {
                    Alert.alert(
                      'Action executee !', 
                      `${actionResult}\n\nL'Admin a ete notifie.`,
                      [{ text: 'OK' }]
                    );
                  } else {
                    Alert.alert(
                      'Demande acceptee', 
                      'L\'action n\'a pas pu etre executee automatiquement. L\'Admin doit l\'executer manuellement.',
                      [{ text: 'OK' }]
                    );
                  }
                  
                  await notificationService.markAsRead(notification._id);
                  setNotifications(prev => prev.filter(n => n._id !== notification._id));
                } else {
                  Alert.alert('Erreur', result.error || 'Impossible d\'accepter');
                }
              }
            }
          ]
        );
      } else {
        Alert.prompt(
          'Refuser cette demande ?',
          `Ressource : ${resourceName}\n\nIndiquez la raison du refus (min 2 caracteres) :`,
          [
            { text: 'Annuler', style: 'cancel' },
            {
              text: 'Refuser',
              style: 'destructive',
              onPress: async (rejectReason) => {
                if (!rejectReason || rejectReason.trim().length < 2) {
                  Alert.alert('Erreur', 'La raison doit contenir au moins 2 caracteres');
                  return;
                }

                const result = await validationService.rejectValidationRequest(
                  validationRequestId,
                  rejectReason.trim()
                );

                if (result.success) {
                  Alert.alert('Demande refusee', 'L\'Admin a ete notifie du refus.', [{ text: 'OK' }]);
                  
                  await notificationService.markAsRead(notification._id);
                  setNotifications(prev => prev.filter(n => n._id !== notification._id));
                } else {
                  Alert.alert('Erreur', result.error || 'Impossible de refuser');
                }
              }
            }
          ],
          'plain-text'
        );
      }
    }
    // CAS 4 : Autres types
    else {
      Alert.alert('Info', 'Type de notification non gere');
    }
  } catch (error) {
    console.error('Erreur action:', error);
    Alert.alert('Erreur', 'Une erreur est survenue');
  } finally {
    setActionLoading(prev => ({ ...prev, [notification._id]: false }));
  }
};
  const deleteNotification = async (notificationId) => {
    Alert.alert(
      'Confirmer la suppression',
      'Voulez-vous vraiment supprimer cette notification ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await notificationService.deleteNotification(notificationId);
              if (result.success) {
                setNotifications(prev => prev.filter(n => n._id !== notificationId));
              }
            } catch (error) {
              console.error('Erreur suppression:', error);
            }
          },
        },
      ]
    );
  };

  const getNotificationIcon = (type) => {
    const icons = {
      TIRAGE_NOTIFICATION: { name: 'dice-multiple', color: '#6366F1', library: 'MaterialCommunityIcons' },
      TIRAGE_RESULTAT: { name: 'bullhorn', color: '#8B5CF6', library: 'MaterialCommunityIcons' },
      TIRAGE_GAGNANT: { name: 'trophy', color: '#F59E0B', library: 'Ionicons' },
      COTISATION_RAPPEL: { name: 'time-outline', color: '#EF4444', library: 'Ionicons' },
      COTISATION_VALIDEE: { name: 'checkmark-circle', color: '#10B981', library: 'Ionicons' },
      TONTINE_INVITATION: { name: 'mail', color: '#3B82F6', library: 'Ionicons' },
      SYSTEM: { name: 'information-circle', color: '#6B7280', library: 'Ionicons' },
    };
    return icons[type] || icons.SYSTEM;
  };

  const renderNotification = ({ item }) => {
    const icon = getNotificationIcon(item.type);
    const isExpired = item.data?.dateExpiration && new Date(item.data.dateExpiration) < new Date();
    const needsAction = item.requiresAction && !item.actionTaken && !isExpired;
    const isLoading = actionLoading[item._id];

    const IconComponent = icon.library === 'MaterialCommunityIcons' ? MaterialCommunityIcons : Ionicons;

    return (
      <TouchableOpacity
        style={[
          styles.notificationCard,
          !item.lu && styles.unreadCard,
        ]}
        onPress={() => !item.lu && markAsRead(item._id)}
        activeOpacity={0.8}
      >
        {/* Badge non lu */}
        {!item.lu && (
          <View style={styles.unreadIndicator}>
            <View style={styles.unreadDot} />
          </View>
        )}

        {/* Icone avec gradient */}
        <LinearGradient
          colors={[icon.color, icon.color + 'CC']}
          style={styles.iconGradient}
        >
          <IconComponent name={icon.name} size={24} color="#fff" />
        </LinearGradient>

        {/* Contenu */}
        <View style={styles.notificationContent}>
          <View style={styles.headerRow}>
            <Text style={styles.notificationTitle} numberOfLines={2}>
              {item.titre}
            </Text>
            <TouchableOpacity
              style={styles.deleteIconButton}
              onPress={() => deleteNotification(item._id)}
            >
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.notificationMessage} numberOfLines={3}>
            {item.message}
          </Text>

          {/* Montant */}
          {item.data?.montant && (
            <View style={styles.montantBadge}>
              <MaterialCommunityIcons name="cash" size={16} color="#059669" />
              <Text style={styles.montantText}>
                {item.data.montant.toLocaleString()} FCFA
              </Text>
            </View>
          )}

          {/* Date expiration */}
          {item.data?.dateExpiration && !isExpired && (
            <View style={styles.expirationBadge}>
              <Ionicons name="time-outline" size={14} color="#DC2626" />
              <Text style={styles.expirationText}>
                Expire le {new Date(item.data.dateExpiration).toLocaleDateString('fr-FR')}
              </Text>
            </View>
          )}

          {isExpired && (
            <View style={styles.expiredBadge}>
              <Text style={styles.expiredText}>Expire</Text>
            </View>
          )}

          {/* Boutons d'action */}
          {needsAction && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => handleAction(item, 'accepted')}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                    <Text style={styles.actionButtonText}>Accepter</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.refuseButton]}
                onPress={() => handleAction(item, 'refused')}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="close-circle-outline" size={18} color="#fff" />
                    <Text style={styles.actionButtonText}>Refuser</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Statut action prise */}
          {item.actionTaken && (
            <View style={[
              styles.actionTakenBadge,
              item.actionTaken === 'accepted' ? styles.acceptedBadge : styles.refusedBadge
            ]}>
              <Ionicons 
                name={item.actionTaken === 'accepted' ? 'checkmark-circle' : 'close-circle'} 
                size={14} 
                color={item.actionTaken === 'accepted' ? '#059669' : '#DC2626'} 
              />
              <Text style={[
                styles.actionTakenText,
                item.actionTaken === 'accepted' ? styles.acceptedText : styles.refusedText
              ]}>
                {item.actionTaken === 'accepted' ? 'Accepte' : 'Refuse'}
              </Text>
            </View>
          )}

          {/* Date */}
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={12} color="#9CA3AF" />
            <Text style={styles.dateText}>
              {new Date(item.createdAt).toLocaleString('fr-FR', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[Colors.primaryDark, '#1E40AF']}
          style={styles.header}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primaryDark} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header avec gradient */}
      <LinearGradient
        colors={[Colors.primaryDark, '#1E40AF']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {notifications.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{notifications.length}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={loadNotifications} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Liste des notifications */}
      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="notifications-off-outline" size={64} color="#D1D5DB" />
          </View>
          <Text style={styles.emptyTitle}>Aucune notification</Text>
          <Text style={styles.emptySubtitle}>
            Vous serez notifie des tirages et evenements importants
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor={Colors.primaryDark}
              colors={[Colors.primaryDark]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  countBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  countText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  refreshButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.primaryDark,
    shadowOpacity: 0.1,
    elevation: 3,
  },
  unreadIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
  },
  iconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  notificationTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 20,
    marginRight: 8,
  },
  deleteIconButton: {
    padding: 2,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  montantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
    gap: 4,
  },
  montantText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
  },
  expirationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
    gap: 4,
  },
  expirationText: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '500',
  },
  expiredBadge: {
    backgroundColor: '#FEE2E2',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  expiredText: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 12,
    marginBottom: 8,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  acceptButton: {
    backgroundColor: '#10B981',
  },
  refuseButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  actionTakenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
    gap: 4,
  },
  acceptedBadge: {
    backgroundColor: '#D1FAE5',
  },
  refusedBadge: {
    backgroundColor: '#FEE2E2',
  },
  actionTakenText: {
    fontSize: 12,
    fontWeight: '600',
  },
  acceptedText: {
    color: '#059669',
  },
  refusedText: {
    color: '#DC2626',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  dateText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default NotificationsScreen;