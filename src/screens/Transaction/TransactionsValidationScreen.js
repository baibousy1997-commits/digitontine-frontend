// src/screens/Transaction/TransactionsValidationScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  StatusBar,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import transactionService from '../../services/transaction/transactionService';
import Colors from '../../constants/colors';

const TransactionsValidationScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [motifRejet, setMotifRejet] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

const loadTransactions = async () => {
  try {
    setLoading(true);
    
    const result = await transactionService.listTransactions({ 
      statut: 'En attente' 
    });

    console.log('Resultat API pending validations:', result);

    if (result.success) {
      // CORRECTION: Triple imbrication result.data.data.data
      let transactionsList = [];
      
      if (Array.isArray(result.data?.data?.data)) {
        transactionsList = result.data.data.data;
      } else if (Array.isArray(result.data?.data)) {
        transactionsList = result.data.data;
      } else if (Array.isArray(result.data)) {
        transactionsList = result.data;
      }
      
      console.log(`${transactionsList.length} transaction(s) en attente trouvée(s)`);
      setTransactions(transactionsList);
    } else {
      console.error('Erreur API:', result.error);
      setTransactions([]);
    }
  } catch (error) {
    console.error('Exception chargement transactions:', error);
    console.error('Message:', error.message);
    setTransactions([]);
  } finally {
    setLoading(false);
  }
};

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const handleValidate = async (transactionId) => {
    Alert.alert(
      'Confirmation',
      'Valider cette transaction ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Valider',
          onPress: async () => {
            setActionLoading(true);
            try {
              const result = await transactionService.validateTransaction(transactionId);
              
              if (result.success) {
                Alert.alert('Succes', 'Transaction validee avec succes');
                await loadTransactions();
              } else {
                Alert.alert('Erreur', result.error?.message || 'Validation echouee');
              }
            } catch (error) {
              console.error('Erreur validation:', error);
              Alert.alert('Erreur', 'Une erreur est survenue');
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  const openRejectModal = (transaction) => {
    setSelectedTransaction(transaction);
    setMotifRejet('');
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!motifRejet.trim()) {
      Alert.alert('Erreur', 'Le motif de rejet est requis');
      return;
    }

    setActionLoading(true);
    try {
      const result = await transactionService.rejectTransaction(
        selectedTransaction.id,
        motifRejet.trim()
      );
      
      if (result.success) {
        Alert.alert('Succes', 'Transaction rejetee');
        setShowRejectModal(false);
        setSelectedTransaction(null);
        setMotifRejet('');
        await loadTransactions();
      } else {
        Alert.alert('Erreur', result.error?.message || 'Rejet echoue');
      }
    } catch (error) {
      console.error('Erreur rejet:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setActionLoading(false);
    }
  };

  const renderTransaction = ({ item }) => (
    <View style={[styles.transactionCard, { backgroundColor: theme.surface }]}>
      <View style={styles.transactionHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.userName, { color: theme.text }]}>
            {item.user || 'Utilisateur'}
          </Text>
          <Text style={[styles.tontineName, { color: theme.textSecondary }]}>
            {item.tontine || 'Tontine'}
          </Text>
          <Text style={[styles.reference, { color: theme.placeholder }]}>
            Ref: {item.reference}
          </Text>
        </View>
        <View>
          <Text style={[styles.amount, { color: Colors.accentGreen }]}>
            {item.montant?.toLocaleString()} FCFA
          </Text>
          <Text style={[styles.dateText, { color: theme.placeholder }]}>
            {new Date(item.dateTransaction).toLocaleDateString('fr-FR')}
          </Text>
        </View>
      </View>

      <View style={styles.transactionDetails}>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="wallet-outline" size={16} color={theme.textSecondary} />
          <Text style={[styles.detailText, { color: theme.textSecondary }]}>
            {item.moyenPaiement}
          </Text>
        </View>

        {item.montantPenalite > 0 && (
          <View style={styles.penaliteAlert}>
            <Ionicons name="alert-circle" size={16} color={Colors.danger} />
            <Text style={[styles.penaliteText, { color: Colors.danger }]}>
              Penalite: {item.montantPenalite?.toLocaleString()} FCFA
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.validateButton, actionLoading && { opacity: 0.5 }]}
          onPress={() => handleValidate(item.id)}
          disabled={actionLoading}
        >
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.validateButtonText}>Valider</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.rejectButton, actionLoading && { opacity: 0.5 }]}
          onPress={() => openRejectModal(item)}
          disabled={actionLoading}
        >
          <Ionicons name="close-circle" size={20} color="#fff" />
          <Text style={styles.rejectButtonText}>Rejeter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.isDarkMode ? 'light-content' : 'dark-content'} />
      
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Validation Transactions
        </Text>
        <TouchableOpacity onPress={onRefresh}>
          <Ionicons name="refresh" size={26} color={theme.text} />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primaryDark} />
        </View>
      ) : transactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-done-circle-outline" size={80} color={theme.placeholder} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Aucune transaction en attente
          </Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      <Modal
        visible={showRejectModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRejectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Rejeter la transaction
            </Text>
            
            <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
              Ref: {selectedTransaction?.reference}
            </Text>

            <TextInput
              style={[styles.motifInput, { 
                backgroundColor: theme.inputBackground,
                color: theme.text 
              }]}
              placeholder="Motif du rejet (obligatoire)"
              placeholderTextColor={theme.placeholder}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={motifRejet}
              onChangeText={setMotifRejet}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: Colors.placeholder }]}
                onPress={() => setShowRejectModal(false)}
                disabled={actionLoading}
              >
                <Text style={styles.modalButtonText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  { backgroundColor: Colors.danger },
                  actionLoading && { opacity: 0.5 }
                ]}
                onPress={handleReject}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalButtonText}>Confirmer le rejet</Text>
                )}
              </TouchableOpacity>
            </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  listContent: { padding: 20 },
  transactionCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  userName: { fontSize: 16, fontWeight: '700' },
  tontineName: { fontSize: 14, marginTop: 4 },
  reference: { fontSize: 11, marginTop: 4 },
  amount: { fontSize: 18, fontWeight: 'bold', textAlign: 'right' },
  dateText: { fontSize: 12, textAlign: 'right', marginTop: 4 },
  transactionDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  detailText: { fontSize: 13 },
  penaliteAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    backgroundColor: '#fee',
    borderRadius: 8,
  },
  penaliteText: { fontSize: 13, fontWeight: '600' },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  validateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accentGreen,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  validateButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.danger,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  rejectButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    padding: 20,
    borderRadius: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  motifInput: {
    padding: 15,
    borderRadius: 10,
    fontSize: 15,
    minHeight: 100,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});

export default TransactionsValidationScreen;