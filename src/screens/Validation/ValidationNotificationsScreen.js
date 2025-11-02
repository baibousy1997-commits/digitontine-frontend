// src/screens/Validation/ValidationNotificationsScreen.js
// ✅ NOUVEL ÉCRAN - Affiche les notifications de validation pour le Trésorier

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import notificationService from '../../services/notification/notificationService';
import validationService from '../../services/validation/validationService';
import Colors from '../../constants/colors';

const ValidationNotificationsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      
      // Charger les notifications de type VALIDATION_REQUEST
      const result = await notificationService.getMyNotifications();
      
      if (result.success) {
        const allNotifications = result.data?.data || result.data || [];
        
        // Filtrer uniquement les notifications de validation
        const validationNotifs = allNotifications.filter(
          n => n.type === 'VALIDATION_REQUEST' && n.requiresAction
        );
        
        console.log('✅ Notifications de validation:', validationNotifs.length);
        setNotifications(validationNotifs);
      } else {
        console.error('❌ Erreur chargement notifications:', result.error);
        setNotifications([]);
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
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

  const handleAccept = (notification) => {
    const validationRequestId = notification.data?.validationRequestId;
    const resourceName = notification.data?.resourceName;
    const actionType = notification.data?.actionType;
    
    Alert.alert(
      '✅ Accepter cette demande ?',
      `Action : ${validationService.getActionLabel(actionType)}\nRessource : ${resourceName}`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Accepter',
          style: 'default',
          onPress: () => confirmAccept(validationRequestId, notification._id),
        },
      ]
    );
  };

  const confirmAccept = async (validationRequestId, notificationId) => {
    try {
      setProcessing(true);
      
      const result = await validationService.acceptValidation(validationRequestId);

      if (result.success) {
        // Marquer la notification comme lue
        await notificationService.markAsRead(notificationId);
        
        Alert.alert(
          '✅ Demande acceptée',
          'L\'Admin peut maintenant exécuter l\'action.',
          [{ text: 'OK', onPress: () => loadNotifications() }]
        );
      } else {
        Alert.alert('❌ Erreur', result.error?.message || 'Impossible d\'accepter');
      }
    } catch (error) {
      console.error('❌ Erreur acceptation:', error);
      Alert.alert('❌ Erreur', 'Une erreur est survenue');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = (notification) => {
    const validationRequestId = notification.data?.validationRequestId;
    const resourceName = notification.data?.resourceName;
    
    Alert.prompt(
      '❌ Refuser cette demande ?',
      `Ressource : ${resourceName}\n\nIndiquez la raison du refus :`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Refuser',
          style: 'destructive',
          onPress: (reason) => {
            if (!reason || reason.trim().length < 10) {
              Alert.alert('❌ Erreur', 'La raison doit contenir au moins 10 caractères');
              return;
            }
            confirmReject(validationRequestId, notification._id, reason.trim());
          }
        }
      ],
      'plain-text'
    );
  };

  const confirmReject = async (validationRequestId, notificationId, reason) => {
    try {
      setProcessing(true);
      
      const result = await validationService.rejectValidationRequest(validationRequestId, reason);

      if (result.success) {
        await notificationService.markAsRead(notificationId);
        
        Alert.alert(
          '✅ Demande rejetée',
          'L\'Admin a été notifié du refus.',
          [{ text: 'OK', onPress: () => loadNotifications() }]
        );
      } else {
        Alert.alert('❌ Erreur', result.error?.message || 'Impossible de rejeter');
      }
    } catch (error) {
      console.error('❌ Erreur rejet:', error);
      Alert.alert('❌ Erreur', 'Une erreur est survenue');
    } finally {
      setProcessing(false);
    }
  };

  const renderNotification = ({ item }) => {
    const actionType = item.data?.actionType || '';
    const resourceName = item.data?.resourceName || 'N/A';
    const adminName = item.data?.adminName || 'Admin';

    return (
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="alert-circle" size={32} color={Colors.accentYellow} />
          <View style={{ flex: 1, marginLeft: 15 }}>
            <Text style={[styles.titre, { color: theme.text }]}>
              {item.titre}
            </Text>
            <Text style={[styles.adminName, { color: theme.textSecondary }]}>
              Demandé par {adminName}
            </Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Action :</Text>
          <Text style={[styles.value, { color: Colors.primaryDark }]}>
            {validationService.getActionLabel(actionType)}
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Ressource :</Text>
          <Text style={[styles.value, { color: theme.text }]}>
            {resourceName}
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Date :</Text>
          <Text style={[styles.value, { color: theme.text }]}>
            {new Date(item.createdAt).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.rejectButton, { backgroundColor: Colors.dangerRed }]}
            onPress={() => handleReject(item)}
            disabled={processing}
          >
            <Ionicons name="close-circle" size={20} color="#fff" />
            <Text style={styles.buttonText}>Refuser</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.acceptButton, { backgroundColor: Colors.accentGreen }]}
            onPress={() => handleAccept(item)}
            disabled={processing}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.buttonText}>Accepter</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={Colors.primaryDark} />
        <Text style={{ color: theme.text, marginTop: 10 }}>Chargement...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Validations en attente ({notifications.length})
        </Text>
        <TouchableOpacity onPress={loadNotifications}>
          <Ionicons name="refresh" size={26} color={theme.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id || item.id}
        renderItem={renderNotification}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-done-circle" size={64} color={Colors.accentGreen} />
            <Text style={[styles.emptyText, { color: theme.text }]}>
              Aucune validation en attente
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
              Les demandes des Admins apparaîtront ici
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  listContent: { padding: 20 },
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  titre: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  adminName: { fontSize: 14 },
  infoBox: {
    marginBottom: 10,
  },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  value: { fontSize: 15, fontWeight: '500' },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    gap: 8,
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: { fontSize: 18, fontWeight: '700', marginTop: 15 },
  emptySubtext: { fontSize: 14, marginTop: 8, textAlign: 'center' },
});

export default ValidationNotificationsScreen;