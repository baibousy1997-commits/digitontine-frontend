// src/screens/Notifications/NotificationsScreen.js
import React, { useState, useEffect, useCallback } from 'react';
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
      const result = await notificationService.getMyNotifications();
      
      if (result.success) {
        setNotifications(result.data?.notifications || []);
      } else {
        console.error(' Erreur chargement notifications:', result.error);
      }
    } catch (error) {
      console.error(' Erreur:', error);
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
      // Mettre à jour localement
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, lu: true } : n)
      );
    } catch (error) {
      console.error(' Erreur marquage lu:', error);
    }
  };

  const handleAction = async (notification, action) => {
    try {
      setActionLoading(prev => ({ ...prev, [notification._id]: true }));

      const result = await notificationService.takeAction(notification._id, action);

      if (result.success) {
        Alert.alert(
          'Confirmation',
          action === 'accepted' 
            ? ' Vous participez au tirage' 
            : ' Vous ne participez pas au tirage'
        );

        // Mettre à jour la notification localement
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
    } catch (error) {
      console.error(' Erreur action:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setActionLoading(prev => ({ ...prev, [notification._id]: false }));
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const result = await notificationService.deleteNotification(notificationId);
      
      if (result.success) {
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
      }
    } catch (error) {
      console.error(' Erreur suppression:', error);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      TIRAGE_NOTIFICATION: { name: 'dice', color: Colors.accentGreen, library: 'MaterialCommunityIcons' },
      TIRAGE_RESULTAT: { name: 'bullhorn', color: Colors.primaryDark, library: 'MaterialCommunityIcons' },
      TIRAGE_GAGNANT: { name: 'trophy', color: '#FFD700', library: 'Ionicons' },
      COTISATION_RAPPEL: { name: 'time-outline', color: Colors.warning, library: 'Ionicons' },
      COTISATION_VALIDEE: { name: 'checkmark-circle', color: Colors.success, library: 'Ionicons' },
      TONTINE_INVITATION: { name: 'mail', color: Colors.info, library: 'Ionicons' },
      SYSTEM: { name: 'information-circle', color: Colors.textSecondary, library: 'Ionicons' },
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
          { backgroundColor: item.lu ? theme.surface : theme.surfaceHighlight },
        ]}
        onPress={() => !item.lu && markAsRead(item._id)}
        activeOpacity={0.7}
      >
        {/* Icône */}
        <View style={[styles.iconContainer, { backgroundColor: icon.color + '20' }]}>
          <IconComponent name={icon.name} size={28} color={icon.color} />
        </View>

        {/* Contenu */}
        <View style={styles.notificationContent}>
          <Text style={[styles.notificationTitle, { color: theme.text }]}>
            {item.titre}
          </Text>
          <Text style={[styles.notificationMessage, { color: theme.textSecondary }]}>
            {item.message}
          </Text>

          {/* Informations supplémentaires */}
          {item.data?.montant && (
            <Text style={styles.montantText}>
               Montant : {item.data.montant.toLocaleString()} FCFA
            </Text>
          )}

          {item.data?.dateExpiration && !isExpired && (
            <Text style={styles.expirationText}>
               Expire le : {new Date(item.data.dateExpiration).toLocaleString('fr-FR')}
            </Text>
          )}

          {isExpired && (
            <Text style={styles.expiredText}> Expiré</Text>
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
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
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
                    <Ionicons name="close-circle" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Refuser</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {item.actionTaken && (
            <View style={styles.actionTakenContainer}>
              <Text style={[
                styles.actionTakenText,
                { color: item.actionTaken === 'accepted' ? Colors.success : Colors.danger }
              ]}>
                {item.actionTaken === 'accepted' ? ' Accepté' : ' Refusé'}
              </Text>
            </View>
          )}

          {/* Date */}
          <Text style={styles.dateText}>
            {new Date(item.createdAt).toLocaleString('fr-FR')}
          </Text>
        </View>

        {/* Badge non lu */}
        {!item.lu && <View style={styles.unreadBadge} />}

        {/* Bouton supprimer */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteNotification(item._id)}
        >
          <Ionicons name="trash-outline" size={20} color={Colors.danger} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primaryDark} />
          <Text style={{ color: theme.text, marginTop: 10 }}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors.primaryDark }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={loadNotifications}>
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Liste des notifications */}
      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={80} color={theme.placeholder} />
          <Text style={[styles.emptyText, { color: theme.placeholder }]}>
            Aucune notification
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  montantText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.accentGreen,
    marginTop: 4,
  },
  expirationText: {
    fontSize: 12,
    color: Colors.warning,
    marginTop: 4,
  },
  expiredText: {
    fontSize: 12,
    color: Colors.danger,
    fontWeight: '600',
    marginTop: 4,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    gap: 6,
  },
  acceptButton: {
    backgroundColor: Colors.success,
  },
  refuseButton: {
    backgroundColor: Colors.danger,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  actionTakenContainer: {
    marginTop: 8,
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  actionTakenText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  unreadBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.danger,
  },
  deleteButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 16,
    textAlign: 'center',
  },
});

export default NotificationsScreen;