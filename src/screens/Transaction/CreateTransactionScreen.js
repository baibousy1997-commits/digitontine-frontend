// src/screens/Transaction/CreateTransactionScreen.js
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import tontineService from '../../services/tontine/tontineService';
import transactionService from '../../services/transaction/transactionService';
import Colors from '../../constants/colors';

const CreateTransactionScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { tontineId, tontineName } = route.params || {};
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tontines, setTontines] = useState([]);
  const [selectedTontine, setSelectedTontine] = useState(null);
  const [tontineDetails, setTontineDetails] = useState(null);
  const [echeances, setEcheances] = useState([]);
  const [selectedEcheance, setSelectedEcheance] = useState(null);
  const [montantTotal, setMontantTotal] = useState(0);
  const [montantPenalite, setMontantPenalite] = useState(0);
  const [moyenPaiement, setMoyenPaiement] = useState('Wave');
  const [showTontinePicker, setShowTontinePicker] = useState(false);
  const [showEcheancePicker, setShowEcheancePicker] = useState(false);

  const moyensPaiement = ['Wave', 'Orange Money', 'Cash'];

  useEffect(() => {
    loadTontines();
  }, []);

  useEffect(() => {
    if (tontineId) {
      loadTontineDetails(tontineId);
    }
  }, [tontineId]);

  useEffect(() => {
    if (selectedTontine) {
      loadTontineDetails(selectedTontine.id);
    }
  }, [selectedTontine]);

  useEffect(() => {
    if (selectedEcheance && tontineDetails) {
      calculateMontant();
    }
  }, [selectedEcheance, tontineDetails]);

  const loadTontines = async () => {
    try {
      setLoading(true);
      const result = await tontineService.listTontines({ statut: 'Active' });
      
      if (result.success) {
        const tontinesList = result.data?.data?.tontines || [];
        setTontines(tontinesList);
        
        if (tontineId) {
          const found = tontinesList.find(t => t.id === tontineId);
          setSelectedTontine(found || null);
        }
      }
    } catch (error) {
      console.error('Erreur chargement tontines:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTontineDetails = async (id) => {
    try {
      const result = await tontineService.getTontineDetails(id);
      
      if (result.success) {
        const details = result.data?.data?.tontine;
        setTontineDetails(details);
        
        if (details.calendrierCotisations) {
          const echeancesNonPayees = details.calendrierCotisations.filter(
            e => e.statut === 'en_attente' || e.statut === 'en_cours'
          );
          setEcheances(echeancesNonPayees);
          
          if (echeancesNonPayees.length > 0) {
            setSelectedEcheance(echeancesNonPayees[0]);
          }
        }
      }
    } catch (error) {
      console.error('Erreur chargement details tontine:', error);
    }
  };

  const calculateMontant = () => {
    if (!selectedEcheance || !tontineDetails) return;
    
    const dateEcheance = new Date(selectedEcheance.dateEcheance);
    const maintenant = new Date();
    
    let montantBase = selectedEcheance.montant || tontineDetails.montantCotisation;
    let penalite = 0;
    
    if (maintenant > dateEcheance) {
      const diffTime = maintenant - dateEcheance;
      const joursRetard = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const joursRetardEffectifs = Math.max(0, joursRetard - (tontineDetails.delaiGrace || 0));
      
      if (joursRetardEffectifs > 0) {
        const semainesRetard = Math.ceil(joursRetardEffectifs / 7);
        penalite = Math.floor((montantBase * (tontineDetails.tauxPenalite || 0) * semainesRetard) / 100);
      }
    }
    
    setMontantPenalite(penalite);
    setMontantTotal(montantBase + penalite);
  };

  const handleSubmit = async () => {
    if (!selectedTontine) {
      Alert.alert('Erreur', 'Veuillez selectionner une tontine');
      return;
    }
    
    if (!selectedEcheance) {
      Alert.alert('Erreur', 'Veuillez selectionner une echeance');
      return;
    }
    
    if (!moyenPaiement) {
      Alert.alert('Erreur', 'Veuillez selectionner un moyen de paiement');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const payload = {
        tontineId: selectedTontine.id,
        montant: montantTotal,
        moyenPaiement: moyenPaiement,
        echeanceNumero: selectedEcheance.numeroEcheance,
      };
      
      const result = await transactionService.createTransaction(payload);
      
      if (result.success) {
        const paymentData = result.data?.data?.payment;
        
        if (paymentData && paymentData.paymentUrl) {
          Alert.alert(
            'Redirection paiement',
            'Vous allez etre redirige vers la page de paiement',
            [
              {
                text: 'OK',
                onPress: () => {
                  navigation.navigate('MyTransactions');
                }
              }
            ]
          );
        } else {
          Alert.alert(
            'Succes',
            'Transaction creee avec succes. En attente de validation.',
            [
              {
                text: 'OK',
                onPress: () => navigation.navigate('MyTransactions')
              }
            ]
          );
        }
      } else {
        Alert.alert('Erreur', result.error?.message || 'Creation echouee');
      }
    } catch (error) {
      console.error('Erreur creation transaction:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={Colors.primaryDark} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.isDarkMode ? 'light-content' : 'dark-content'} />
      
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Nouvelle Cotisation
        </Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={[styles.label, { color: theme.text }]}>
            Tontine
          </Text>
          <TouchableOpacity
            style={[styles.picker, { backgroundColor: theme.inputBackground }]}
            onPress={() => setShowTontinePicker(!showTontinePicker)}
          >
            <Text style={[styles.pickerText, { color: theme.text }]}>
              {selectedTontine ? selectedTontine.nom : 'Selectionnez une tontine'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={theme.text} />
          </TouchableOpacity>
          
          {showTontinePicker && (
            <View style={[styles.dropdownList, { backgroundColor: theme.surface }]}>
              <ScrollView style={{ maxHeight: 200 }}>
                {tontines.map((tontine) => (
                  <TouchableOpacity
                    key={tontine.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedTontine(tontine);
                      setShowTontinePicker(false);
                    }}
                  >
                    <Text style={[styles.dropdownItemText, { color: theme.text }]}>
                      {tontine.nom}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {selectedTontine && echeances.length > 0 && (
          <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <Text style={[styles.label, { color: theme.text }]}>
              Echeance a payer
            </Text>
            <TouchableOpacity
              style={[styles.picker, { backgroundColor: theme.inputBackground }]}
              onPress={() => setShowEcheancePicker(!showEcheancePicker)}
            >
              <Text style={[styles.pickerText, { color: theme.text }]}>
                {selectedEcheance 
                  ? `Echeance ${selectedEcheance.numeroEcheance} - ${new Date(selectedEcheance.dateEcheance).toLocaleDateString('fr-FR')}`
                  : 'Selectionnez une echeance'
                }
              </Text>
              <Ionicons name="chevron-down" size={20} color={theme.text} />
            </TouchableOpacity>
            
            {showEcheancePicker && (
              <View style={[styles.dropdownList, { backgroundColor: theme.surface }]}>
                <ScrollView style={{ maxHeight: 200 }}>
                  {echeances.map((echeance, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedEcheance(echeance);
                        setShowEcheancePicker(false);
                      }}
                    >
                      <Text style={[styles.dropdownItemText, { color: theme.text }]}>
                        Echeance {echeance.numeroEcheance} - {new Date(echeance.dateEcheance).toLocaleDateString('fr-FR')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}

        {selectedEcheance && (
          <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Recapitulatif
            </Text>
            
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                Montant cotisation
              </Text>
              <Text style={[styles.summaryValue, { color: theme.text }]}>
                {(montantTotal - montantPenalite).toLocaleString()} FCFA
              </Text>
            </View>
            
            {montantPenalite > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: Colors.danger }]}>
                  Penalite (retard)
                </Text>
                <Text style={[styles.summaryValue, { color: Colors.danger }]}>
                  {montantPenalite.toLocaleString()} FCFA
                </Text>
              </View>
            )}
            
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={[styles.totalLabel, { color: theme.text }]}>
                Total a payer
              </Text>
              <Text style={[styles.totalValue, { color: Colors.accentGreen }]}>
                {montantTotal.toLocaleString()} FCFA
              </Text>
            </View>
          </View>
        )}

        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={[styles.label, { color: theme.text }]}>
            Moyen de paiement
          </Text>
          {moyensPaiement.map((moyen) => (
            <TouchableOpacity
              key={moyen}
              style={[
                styles.paymentOption,
                { borderColor: theme.border },
                moyenPaiement === moyen && { 
                  borderColor: Colors.primaryDark,
                  backgroundColor: Colors.primaryDark + '10'
                }
              ]}
              onPress={() => setMoyenPaiement(moyen)}
            >
              <View style={styles.paymentOptionLeft}>
                <MaterialCommunityIcons 
                  name={moyen === 'Cash' ? 'cash' : 'wallet'}
                  size={24}
                  color={moyenPaiement === moyen ? Colors.primaryDark : theme.text}
                />
                <Text style={[
                  styles.paymentOptionText, 
                  { color: theme.text },
                  moyenPaiement === moyen && { fontWeight: '600' }
                ]}>
                  {moyen}
                </Text>
              </View>
              {moyenPaiement === moyen && (
                <Ionicons name="checkmark-circle" size={24} color={Colors.primaryDark} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: Colors.accentGreen },
            (!selectedTontine || !selectedEcheance || submitting) && { opacity: 0.5 }
          ]}
          onPress={handleSubmit}
          disabled={!selectedTontine || !selectedEcheance || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>
              Valider la cotisation
            </Text>
          )}
        </TouchableOpacity>
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
  label: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  picker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
  },
  pickerText: { fontSize: 15 },
  dropdownList: {
    marginTop: 10,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemText: { fontSize: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 15 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  summaryLabel: { fontSize: 15 },
  summaryValue: { fontSize: 15, fontWeight: '600' },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: 10,
    paddingTop: 15,
  },
  totalLabel: { fontSize: 17, fontWeight: '700' },
  totalValue: { fontSize: 20, fontWeight: '700' },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderWidth: 2,
    borderRadius: 10,
    marginBottom: 10,
  },
  paymentOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  paymentOptionText: { fontSize: 16 },
  submitButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
});

export default CreateTransactionScreen;