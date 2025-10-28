// src/screens/Transaction/TransactionDetailsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuthContext } from '../../context/AuthContext';
import transactionService from '../../services/transaction/transactionService';
import Colors from '../../constants/colors';

const TransactionDetailsScreen = ({ navigation, route }) => {
  const { transactionId } = route.params;
  const { theme } = useTheme();
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [motifRejet, setMotifRejet] = useState('');

  useEffect(() => {
    loadTransaction();
  }, []);

  const loadTransaction = async () => {
    try {
      setLoading(true);
      const result = await transactionService.getTransactionDetails(transactionId);
      
      if (result.success) {
        setTransaction(result.data?.data?.transaction);
      }
    } catch (error) {
      console.error('Erreur chargement transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
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
                Alert.alert('Succes', 'Transaction validee avec succes', [
                  { text: 'OK', onPress: () => navigation.goBack() }
                ]);
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

  const handleReject = async () => {
    if (!motifRejet.trim()) {
      Alert.alert('Erreur', 'Le motif de rejet est requis');
      return;
    }

    setActionLoading(true);
    try {
      const result = await transactionService.rejectTransaction(
        transactionId,
        motifRejet.trim()
      );
      
      if (result.success) {
        Alert.alert('Succes', 'Transaction rejetee', [
          {
            text: 'OK',
            onPress: () => {
              setShowRejectModal(false);
              navigation.goBack();
            }
          }
        ]);
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

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'Validee': return Colors.accentGreen;
      case 'En attente': return Colors.accentYellow;
      case 'Rejetee': return Colors.danger;
      default: return Colors.placeholder;
    }
  };

  const getStatutIcon = (statut) => {
    switch (statut) {
      case 'Validee': return 'checkmark-circle';
      case 'En attente': return 'time';
      case 'Rejetee': return 'close-circle';
      default: return 'help-circle';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={Colors.primaryDark} />
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Transaction introuvable</Text>
      </View>
    );
  }

  const isTresorier = user?.role === 'Tresorier' || user?.role === 'Administrateur';
  const isEnAttente = transaction.statut === 'En attente';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.isDarkMode ? 'light-content' : 'dark-content'} />
      
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Details Transaction
        </Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <View style={styles.statutContainer}>
            <View style={[styles.statutBadge, { backgroundColor: getStatutColor(transaction.statut) }]}>
              <Ionicons name={getStatutIcon(transaction.statut)} size={20} color="#fff" />
              <Text style={styles.statutText}>{transaction.statut}</Text>
            </View>
          </View>

          <Text style={[styles.reference, { color: theme.text }]}>
            {transaction.reference}
          </Text>
          
          <Text style={[styles.dateText, { color: theme.textSecondary }]}>
            {new Date(transaction.dateTransaction).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Informations financieres
          </Text>
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
              Montant cotisation
            </Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {transaction.montantCotisation?.toLocaleString()} FCFA
            </Text>
          </View>

          {transaction.montantPenalite > 0 && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: Colors.danger }]}>
                Penalites
              </Text>
              <Text style={[styles.infoValue, { color: Colors.danger }]}>
                {transaction.montantPenalite.toLocaleString()} FCFA
              </Text>
            </View>
          )}

          <View style={[styles.infoRow, styles.totalRow]}>
            <Text style={[styles.totalLabel, { color: theme.text }]}>
              Montant total
            </Text>
            <Text style={[styles.totalValue, { color: Colors.accentGreen }]}>
              {transaction.montant.toLocaleString()} FCFA
            </Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Details
          </Text>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="hand-coin" size={20} color={theme.textSecondary} />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                Tontine
              </Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {transaction.tontine?.nom || 'N/A'}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="wallet" size={20} color={theme.textSecondary} />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                Moyen de paiement
              </Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {transaction.moyenPaiement}
              </Text>
            </View>
          </View>

          {transaction.referencePaiement && (
            <View style={styles.detailRow}>
              <Ionicons name="key" size={20} color={theme.textSecondary} />
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                  Reference paiement
                </Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  {transaction.referencePaiement}
                </Text>
              </View>
            </View>
          )}

          {transaction.echeanceNumero && (
            <View style={styles.detailRow}>
              <Ionicons name="calendar" size={20} color={theme.textSecondary} />
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                  Echeance
                </Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  Numero {transaction.echeanceNumero}
                </Text>
              </View>
            </View>
          )}

          {transaction.joursRetard > 0 && (
            <View style={styles.detailRow}>
              <Ionicons name="alert-circle" size={20} color={Colors.danger} />
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: Colors.danger }]}>
                  Retard
                </Text>
                <Text style={[styles.detailValue, { color: Colors.danger }]}>
                  {transaction.joursRetard} jour(s)
                </Text>
              </View>
            </View>
          )}
        </View>

        {transaction.user && isTresorier && (
          <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Informations membre
            </Text>

            <View style={styles.detailRow}>
              <Ionicons name="person" size={20} color={theme.textSecondary} />
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                  Nom complet
                </Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  {transaction.user.nom}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="mail" size={20} color={theme.textSecondary} />
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                  Email
                </Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  {transaction.user.email}
                </Text>
              </View>
            </View>

            {transaction.user.telephone && (
              <View style={styles.detailRow}>
                <Ionicons name="call" size={20} color={theme.textSecondary} />
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                    Telephone
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    {transaction.user.telephone}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {transaction.statut === 'Validee' && transaction.dateValidation && (
          <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Validation
            </Text>

            <View style={styles.detailRow}>
              <Ionicons name="checkmark-done" size={20} color={Colors.accentGreen} />
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                  Date de validation
                </Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  {new Date(transaction.dateValidation).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
            </View>

            {transaction.validePar && (
              <View style={styles.detailRow}>
                <Ionicons name="person" size={20} color={theme.textSecondary} />
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                    Validee par
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    {transaction.validePar.nom || 'Tresorier'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {transaction.statut === 'Rejetee' && (
          <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionTitle, { color: Colors.danger }]}>
              Motif du rejet
            </Text>

            <View style={[styles.rejetBox, { backgroundColor: '#fee' }]}>
              <Ionicons name="alert-circle" size={24} color={Colors.danger} />
              <Text style={[styles.rejetText, { color: Colors.danger }]}>
                {transaction.motifRejet || 'Aucun motif specifie'}
              </Text>
            </View>

            {transaction.dateRejet && (
              <Text style={[styles.dateText, { color: theme.textSecondary, marginTop: 10 }]}>
                Rejete le {new Date(transaction.dateRejet).toLocaleDateString('fr-FR')}
              </Text>
            )}
          </View>
        )}

        {isTresorier && isEnAttente && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.validateButton, actionLoading && { opacity: 0.5 }]}
              onPress={handleValidate}
              disabled={actionLoading}
            >
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
              <Text style={styles.buttonText}>Valider</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.rejectButton, actionLoading && { opacity: 0.5 }]}
              onPress={() => setShowRejectModal(true)}
              disabled={actionLoading}
            >
              <Ionicons name="close-circle" size={24} color="#fff" />
              <Text style={styles.buttonText}>Rejeter</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

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
              Ref: {transaction.reference}
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
                  <Text style={styles.modalButtonText}>Confirmer</Text>
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
  content: { padding: 20 },
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
  statutContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  statutBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  statutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  reference: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 5,
  },
  dateText: {
    fontSize: 14,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: { fontSize: 15 },
  infoValue: { fontSize: 15, fontWeight: '600' },
  totalRow: {
    borderTopWidth: 2,
    borderBottomWidth: 0,
    marginTop: 10,
    paddingTop: 15,
  },
  totalLabel: { fontSize: 17, fontWeight: '700' },
  totalValue: { fontSize: 20, fontWeight: '700' },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailContent: {
    flex: 1,
    marginLeft: 15,
  },
  detailLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  rejetBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    gap: 12,
  },
  rejetText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  validateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accentGreen,
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.danger,
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
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

export default TransactionDetailsScreen;