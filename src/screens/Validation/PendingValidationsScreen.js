// src/screens/Validation/PendingValidationsScreen.js
//  ÉCRAN TRÉSORIER - Valider ou refuser les demandes Admin

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
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import validationService from '../../services/validation/validationService';
import Colors from '../../constants/colors';

const PendingValidationsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadPendingRequests();
  }, []);

  const loadPendingRequests = async () => {
    try {
      setLoading(true);
      const result = await validationService.getPendingRequests();
      
      if (result.success) {
        const data = result.data?.data?.requests || [];
        setRequests(data);
      } else {
        Alert.alert('Erreur', 'Impossible de charger les demandes');
      }
    } catch (error) {
      console.error('Erreur chargement demandes:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPendingRequests();
    setRefreshing(false);
  };

  const handleAccept = (request) => {
    Alert.alert(
      ' Accepter cette demande ?',
      `Action : ${validationService.getActionLabel(request.actionType)}\n` +
      `Ressource : ${request.resourceName}\n` +
      `Demandé par : ${request.initiatedBy.prenom} ${request.initiatedBy.nom}`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Accepter',
          style: 'default',
          onPress: () => confirmAccept(request.id),
        },
      ]
    );
  };

  const confirmAccept = async (requestId) => {
    try {
      setProcessing(true);
      const result = await validationService.acceptValidation(requestId);

      if (result.success) {
        Alert.alert(
          ' Demande acceptée',
          'L\'Admin peut maintenant exécuter l\'action.',
          [{ text: 'OK', onPress: () => loadPendingRequests() }]
        );
      } else {
        Alert.alert(' Erreur', result.error?.message || 'Impossible d\'accepter');
      }
    } catch (error) {
      console.error('Erreur acceptation:', error);
      Alert.alert(' Erreur', 'Une erreur est survenue');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!rejectReason.trim() || rejectReason.trim().length < 10) {
      Alert.alert(' Erreur', 'La raison doit contenir au moins 10 caractères');
      return;
    }

    try {
      setProcessing(true);
      const result = await validationService.rejectValidationRequest(
        selectedRequest.id,
        rejectReason.trim()
      );

      if (result.success) {
        setShowRejectModal(false);
        Alert.alert(
          ' Demande rejetée',
          'L\'Admin a été notifié du refus.',
          [{ text: 'OK', onPress: () => loadPendingRequests() }]
        );
      } else {
        Alert.alert(' Erreur', result.error?.message || 'Impossible de rejeter');
      }
    } catch (error) {
      console.error('Erreur rejet:', error);
      Alert.alert(' Erreur', 'Une erreur est survenue');
    } finally {
      setProcessing(false);
    }
  };

  const renderItem = ({ item }) => {
    const isExpired = new Date(item.expiresAt) < new Date();

    return (
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.actionType, { color: Colors.primaryDark }]}>
              {validationService.getActionLabel(item.actionType)}
            </Text>
            <Text style={[styles.resourceName, { color: theme.text }]}>
              {item.resourceName}
            </Text>
          </View>
          {isExpired && (
            <View style={[styles.badge, { backgroundColor: Colors.dangerRed }]}>
              <Text style={styles.badgeText}>Expirée</Text>
            </View>
          )}
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="person" size={16} color={theme.textSecondary} />
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            {item.initiatedBy.prenom} {item.initiatedBy.nom}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="time" size={16} color={theme.textSecondary} />
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            {new Date(item.createdAt).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        {item.reason && (
          <View style={[styles.reasonBox, { backgroundColor: theme.background }]}>
            <Text style={[styles.reasonLabel, { color: theme.textSecondary }]}>
              Raison :
            </Text>
            <Text style={[styles.reasonText, { color: theme.text }]}>
              {item.reason}
            </Text>
          </View>
        )}

        {!isExpired && (
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
        )}
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
          Demandes de validation ({requests.length})
        </Text>
        <View style={{ width: 26 }} />
      </View>

      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-done-circle" size={64} color={Colors.accentGreen} />
            <Text style={[styles.emptyText, { color: theme.text }]}>
              Aucune demande en attente
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
              Les demandes des Admins apparaîtront ici
            </Text>
          </View>
        }
      />

      {/* Modal de rejet */}
      <Modal
        visible={showRejectModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRejectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Refuser la demande
              </Text>
              <TouchableOpacity onPress={() => setShowRejectModal(false)}>
                <Ionicons name="close" size={28} color={theme.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[
                styles.reasonInput,
                { backgroundColor: theme.background, color: theme.text },
              ]}
              placeholder="Raison du refus (min 10 caractères)"
              placeholderTextColor={theme.placeholder}
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[
                styles.confirmRejectButton,
                { backgroundColor: Colors.dangerRed },
                processing && { opacity: 0.6 },
              ]}
              onPress={confirmReject}
              disabled={processing}
            >
              {processing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Confirmer le refus</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  actionType: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  resourceName: { fontSize: 16, fontWeight: '600' },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoText: { fontSize: 14 },
  reasonBox: {
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 15,
  },
  reasonLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  reasonText: { fontSize: 14 },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  reasonInput: {
    borderRadius: 12,
    padding: 15,
    fontSize: 14,
    minHeight: 120,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  confirmRejectButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PendingValidationsScreen;