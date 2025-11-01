// src/screens/Tontine/CreateTontineScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import styles from '../../styles/CreateTontineScreenStyles';
import tontineService from '../../services/tontine/tontineService';
import userService from '../../services/user/userService';

const CreateTontineScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [tresoriers, setTresoriers] = useState([]);
  const [loadingTresoriers, setLoadingTresoriers] = useState(true);
  
// ✅ CORRECTION 1 : Valeurs par défaut pour tauxPenalite et delaiGrace
const [formData, setFormData] = useState({
  nom: '',
  description: '',
  montantCotisation: '',
  frequence: 'mensuelle', 
  dateDebut: '',
  nombreMembresMin: '1',
  nombreMembresMax: '50',
  tauxPenalite: '5',      // ✅ Valeur par défaut
  delaiGrace: '2',        // ✅ Valeur par défaut
  tresorierAssigneId: '',
});

const getCurrentDate = () => {
  const today = new Date();
  const day = today.getDate();
  const monthIndex = today.getMonth();
  const year = today.getFullYear();
  
  const months = [
    'janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre'
  ];
  
  return {
    day: day.toString(),
    month: months[monthIndex],
    year: year.toString()
  };
};

const [dateDisplay, setDateDisplay] = useState(getCurrentDate());

  const [showDayPicker, setShowDayPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMinPicker, setShowMinPicker] = useState(false);
  const [showMaxPicker, setShowMaxPicker] = useState(false);
  const [showTresorierPicker, setShowTresorierPicker] = useState(false);

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    'janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre'
  ];
  const years = Array.from({ length: 10 }, (_, i) => 2025 + i);
  const minOptions = Array.from({ length: 19 }, (_, i) => i + 1);
  const maxOptions = Array.from({ length: 100 }, (_, i) => i + 1);

  useEffect(() => {
    loadTresoriers();
  }, []);

  useEffect(() => {
    updateDateDebut();
  }, [dateDisplay]);

const loadTresoriers = async () => {
  try {
    console.log('Début chargement des trésoriers...');
    
    const result = await userService.listUsers({ 
      role: 'tresorier',
      isActive: true,
      limit: 100 
    });
    
    console.log('Résultat complet:', JSON.stringify(result, null, 2));
    console.log('Success:', result.success);
    console.log('Structure data:', result.data);
    
    if (result.success && result.data?.data) {
      const tresoriersList = Array.isArray(result.data.data?.data) 
        ? result.data.data.data 
        : (Array.isArray(result.data.data) ? result.data.data : []);

      console.log('Nombre de trésoriers:', tresoriersList.length);
      console.log('Liste des trésoriers:', tresoriersList);
      setTresoriers(tresoriersList);
    } else {
      console.log('Aucun trésorier trouvé ou structure inattendue');
      console.log('Données reçues:', result);
      setTresoriers([]);
    }
  } catch (error) {
    console.error('Erreur chargement trésoriers:', error);
    console.error('Stack:', error.stack);
    setTresoriers([]);
  } finally {
    console.log('Fin chargement - loadingTresoriers = false');
    setLoadingTresoriers(false);
  }
};

  const updateDateDebut = () => {
    const monthIndex = months.indexOf(dateDisplay.month);
    const dateStr = `${dateDisplay.year}-${String(monthIndex + 1).padStart(2, '0')}-${String(dateDisplay.day).padStart(2, '0')}`;
    setFormData(prev => ({ ...prev, dateDebut: dateStr }));
  };

const calculateDateFin = (dateDebut, duree) => {
  const date = new Date(dateDebut);
  const parsedDuree = parseInt(duree);
  if (formData.frequence === 'mensuelle') {
    date.setMonth(date.getMonth() + parsedDuree);
  } else {
    date.setDate(date.getDate() + parsedDuree * 7);
  }
  return date.toISOString().split('T')[0];
};

const handleChange = (field, value) => {
  if (field === 'frequence') {
    setFormData(prev => ({ ...prev, [field]: value.toLowerCase() }));
  } else {
    setFormData(prev => ({ ...prev, [field]: value }));
  }
};

//  CORRECTION 2 : Validation complète avec delaiGrace et tauxPenalite
const validateForm = () => {
  if (!formData.nom.trim()) {
    Alert.alert('Erreur', 'Le nom de la tontine est requis');
    return false;
  }

  //  NOUVEAU : Validation delaiGrace
  const delaiGrace = parseInt(formData.delaiGrace) || 0;
  if (delaiGrace < 0 || delaiGrace > 30) {
    Alert.alert('Erreur', 'Le délai de grâce doit être entre 0 et 30 jours');
    return false;
  }

  //  NOUVEAU : Validation tauxPenalite
  const tauxPenalite = parseFloat(formData.tauxPenalite) || 0;
  if (tauxPenalite < 0 || tauxPenalite > 50) {
    Alert.alert('Erreur', 'Le taux de pénalité doit être entre 0 et 50%');
    return false;
  }

  const montant = parseInt(formData.montantCotisation);
  if (!formData.montantCotisation || isNaN(montant) || montant <= 0) {
    Alert.alert('Erreur', 'Le montant doit être supérieur à 0');
    return false;
  }

  const minMembres = parseInt(formData.nombreMembresMin);
  const maxMembres = parseInt(formData.nombreMembresMax);
  
  if (isNaN(minMembres) || minMembres < 1) {
    Alert.alert('Erreur', 'Le minimum de membres à ajouter est de 1');
    return false;
  }
  
  if (isNaN(maxMembres) || maxMembres < 1) {
    Alert.alert('Erreur', 'Le maximum de membres supplémentaires doit être au moins 1');
    return false;
  }
  
  if (minMembres > maxMembres) {
    Alert.alert('Erreur', 'Le minimum doit être inférieur ou égal au maximum');
    return false;
  }

  if (!formData.tresorierAssigneId) {
    Alert.alert(
      'Attention',
      'Aucun trésorier assigné. La tontine ne pourra pas être activée sans trésorier.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Continuer quand même', 
          onPress: () => {
            handleCreateTontineWithoutValidation();
          }
        }
      ]
    );
    return false;
  }

  return true;
};

const handleCreateTontineWithoutValidation = async () => {
  setLoading(true);

  try {
    const duree = parseInt(formData.nombreMembresMax);
    const dateFin = calculateDateFin(formData.dateDebut, duree);

    const payload = {
      nom: formData.nom.trim(),
      description: formData.description.trim(),
      montantCotisation: parseInt(formData.montantCotisation),
      frequence: formData.frequence,
      dateDebut: formData.dateDebut,
      dateFin: dateFin,
      nombreMembresMin: parseInt(formData.nombreMembresMin) || 1,
      nombreMembresMax: parseInt(formData.nombreMembresMax) || 50,
      tauxPenalite: parseFloat(formData.tauxPenalite) || 5,
      delaiGrace: parseInt(formData.delaiGrace) || 2,
      tresorierAssigneId: formData.tresorierAssigneId || null,
    };

    console.log(' PAYLOAD ENVOYÉ (sans validation trésorier):', JSON.stringify(payload, null, 2));

    const result = await tontineService.createTontine(payload);

    console.log(' RÉPONSE BACKEND (sans validation):', JSON.stringify(result, null, 2));

    if (result.success) {
      const tontineData = result.data?.data?.tontine;
      
      console.log(' TONTINE DATA (sans validation):', JSON.stringify(tontineData, null, 2));
      console.log(' RÈGLEMENT REÇU:', tontineData?.reglement);
      
      if (!tontineData || !tontineData.id) {
        Alert.alert(' Erreur', 'Réponse invalide du serveur');
        return;
      }

      const navParams = {
        tontineId: tontineData.id,
        tontineName: tontineData.nom,
        minMembers: tontineData.nombreMembresMin,
        maxMembers: tontineData.nombreMembresMax,
        montantCotisation: tontineData.montantCotisation,
        frequence: tontineData.frequence,
        dateDebut: tontineData.dateDebut,
        tauxPenalite: tontineData.tauxPenalite,
        delaiGrace: tontineData.delaiGrace,
        reglementAuto: tontineData.reglement,
      };

      console.log(' NAVIGATION (sans validation) avec params:', JSON.stringify(navParams, null, 2));
      
      navigation.navigate('AddMembers', navParams);
    } else {
      const errorMsg = result.error?.message || 'Impossible de créer la tontine';
      console.error(' ERREUR:', result.error);
      Alert.alert(' Erreur', errorMsg);
    }
  } catch (error) {
    console.error(' EXCEPTION:', error);
    Alert.alert(' Erreur', 'Une erreur est survenue');
  } finally {
    setLoading(false);
  }
};
const handleCreateTontine = async () => {
  if (!validateForm()) return;

  setLoading(true);

  try {
    const duree = parseInt(formData.nombreMembresMax);
    const dateFin = calculateDateFin(formData.dateDebut, duree);

    const payload = {
      nom: formData.nom.trim(),
      description: formData.description.trim(),
      montantCotisation: parseInt(formData.montantCotisation),
      frequence: formData.frequence,
      dateDebut: formData.dateDebut,
      dateFin: dateFin,
      nombreMembresMin: parseInt(formData.nombreMembresMin) || 1,
      nombreMembresMax: parseInt(formData.nombreMembresMax) || 50,
      tauxPenalite: parseFloat(formData.tauxPenalite) || 5,
      delaiGrace: parseInt(formData.delaiGrace) || 2,
      tresorierAssigneId: formData.tresorierAssigneId || null,
    };

    console.log(' PAYLOAD ENVOYÉ AU BACKEND:', JSON.stringify(payload, null, 2));

    const result = await tontineService.createTontine(payload);

    console.log(' RÉPONSE COMPLÈTE DU BACKEND:', JSON.stringify(result, null, 2));

    if (result.success) {
      const tontineData = result.data?.data?.tontine;
      
      console.log(' TONTINE DATA EXTRAITE:', JSON.stringify(tontineData, null, 2));
      console.log(' RÈGLEMENT REÇU:', tontineData?.reglement);
      console.log(' LONGUEUR RÈGLEMENT:', tontineData?.reglement?.length);
      console.log(' TYPE RÈGLEMENT:', typeof tontineData?.reglement);
      
      if (!tontineData || !tontineData.id) {
        Alert.alert(' Erreur', 'Réponse invalide du serveur');
        return;
      }

      const navParams = {
        tontineId: tontineData.id,
        tontineName: tontineData.nom,
        minMembers: tontineData.nombreMembresMin,
        maxMembers: tontineData.nombreMembresMax,
        montantCotisation: tontineData.montantCotisation,
        frequence: tontineData.frequence,
        dateDebut: tontineData.dateDebut,
        tauxPenalite: tontineData.tauxPenalite,
        delaiGrace: tontineData.delaiGrace,
        reglementAuto: tontineData.reglement,
      };

      console.log(' NAVIGATION VERS AddMembers AVEC PARAMS:');
      console.log('    Tous les params:', JSON.stringify(navParams, null, 2));
      console.log('    reglementAuto spécifique:', navParams.reglementAuto);
      console.log('    Longueur reglementAuto:', navParams.reglementAuto?.length);
      
      navigation.navigate('AddMembers', navParams);
    } else {
      const errorMsg = result.error?.message || 'Impossible de créer la tontine';
      console.error(' ERREUR CRÉATION:', result.error);
      Alert.alert(' Erreur', errorMsg);
    }
  } catch (error) {
    console.error(' EXCEPTION CRÉATION TONTINE:', error);
    console.error(' STACK:', error.stack);
    Alert.alert(' Erreur', 'Une erreur est survenue');
  } finally {
    setLoading(false);
  }
};
const getTresorierNom = (id) => {
  if (!id) return 'Sélectionnez un trésorier (requis)';
  const tresorier = tresoriers.find(t => t.id === id);
  return tresorier ? `${tresorier.prenom} ${tresorier.nom}` : 'Sélectionnez un trésorier (requis)';
};

  const unit = formData.frequence === 'mensuelle' ? 'mois' : 'semaines';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.backText}>Retour</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Créer une tontine</Text>

        <Text style={styles.sectionTitle}>Nom de la tontine</Text>
        <TextInput
          style={styles.input}
          placeholder="Entrez le nom de la tontine ici"
          placeholderTextColor="#999"
          value={formData.nom}
          onChangeText={(value) => handleChange('nom', value)}
        />

        <Text style={styles.sectionTitle}>Date de début</Text>
        <View style={styles.dateContainer}>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowDayPicker(!showDayPicker)}>
            <Text style={[styles.dateText, dateDisplay.day && { color: '#333' }]}>{dateDisplay.day || 'Jour'}</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.dateButton} onPress={() => setShowMonthPicker(!showMonthPicker)}>
            <Text style={[styles.dateText, dateDisplay.month && { color: '#333' }]}>{dateDisplay.month || 'Mois'}</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.dateButton} onPress={() => setShowYearPicker(!showYearPicker)}>
            <Text style={[styles.dateText, dateDisplay.year && { color: '#333' }]}>{dateDisplay.year || 'Année'}</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {showDayPicker && (
          <View style={styles.dropdownList}>
            <ScrollView style={{ maxHeight: 150 }}>
              {days.map((d) => (
                <TouchableOpacity key={d} onPress={() => { setDateDisplay(prev => ({ ...prev, day: d.toString() })); setShowDayPicker(false); }}>
                  <Text style={styles.dropdownItem}>{d}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {showMonthPicker && (
          <View style={styles.dropdownList}>
            <ScrollView style={{ maxHeight: 150 }}>
              {months.map((m) => (
                <TouchableOpacity key={m} onPress={() => { setDateDisplay(prev => ({ ...prev, month: m })); setShowMonthPicker(false); }}>
                  <Text style={styles.dropdownItem}>{m}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {showYearPicker && (
          <View style={styles.dropdownList}>
            <ScrollView style={{ maxHeight: 150 }}>
              {years.map((y) => (
                <TouchableOpacity key={y} onPress={() => { setDateDisplay(prev => ({ ...prev, year: y.toString() })); setShowYearPicker(false); }}>
                  <Text style={styles.dropdownItem}>{y}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <Text style={styles.sectionTitle}>Minimum de membres</Text>
        <TouchableOpacity 
          style={styles.dropdownButton}
          onPress={() => setShowMinPicker(!showMinPicker)}
        >
          <Text style={[styles.dropdownText, formData.nombreMembresMin && { color: '#333' }]}>
            {formData.nombreMembresMin ? `${formData.nombreMembresMin}` : 'Sélectionnez le minimum de membres'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>

        {showMinPicker && (
          <View style={styles.dropdownList}>
            <ScrollView style={{ maxHeight: 150 }}>
              {minOptions.map((d) => (
                <TouchableOpacity key={d} onPress={() => { 
                  handleChange('nombreMembresMin', d.toString()); 
                  setShowMinPicker(false); 
                }}>
                  <Text style={styles.dropdownItem}>{d}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <Text style={styles.sectionTitle}>Maximum de membres (= Durée en {unit})</Text>
        <TouchableOpacity 
          style={styles.dropdownButton}
          onPress={() => setShowMaxPicker(!showMaxPicker)}
        >
          <Text style={[styles.dropdownText, formData.nombreMembresMax && { color: '#333' }]}>
            {formData.nombreMembresMax ? `${formData.nombreMembresMax} ${unit}` : `Sélectionnez la durée en ${unit}`}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>

        {showMaxPicker && (
          <View style={styles.dropdownList}>
            <ScrollView style={{ maxHeight: 150 }}>
              {maxOptions.map((d) => (
                <TouchableOpacity key={d} onPress={() => { 
                  handleChange('nombreMembresMax', d.toString()); 
                  setShowMaxPicker(false); 
                }}>
                  <Text style={styles.dropdownItem}>{d} {unit}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {formData.nombreMembresMax && (
          <Text style={styles.helperText}>
            Durée totale : {formData.nombreMembresMax} {unit} 
            (1 {unit === 'mois' ? 'mois' : 'semaine'} par membre)
          </Text>
        )}

        <Text style={styles.sectionTitle}>Fréquence des versements</Text>
        <View style={styles.frequencyContainer}>
          <TouchableOpacity 
            style={[
              styles.frequencyButton, 
              formData.frequence === 'hebdomadaire' && styles.frequencyButtonActive
            ]}
            onPress={() => handleChange('frequence', 'hebdomadaire')}
          >
            <Text style={[
              styles.frequencyText,
              formData.frequence === 'hebdomadaire' && styles.frequencyTextActive
            ]}>
              Hebdomadaire
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.frequencyButton, 
              formData.frequence === 'mensuelle' && styles.frequencyButtonActive
            ]}
            onPress={() => handleChange('frequence', 'mensuelle')}
          >
            <Text style={[
              styles.frequencyText,
              formData.frequence === 'mensuelle' && styles.frequencyTextActive
            ]}>
              Mensuelle
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Montant de la cotisation</Text>
        <TextInput
          style={styles.input}
          placeholder="Entrez le montant ici"
          placeholderTextColor="#999"
          keyboardType="numeric"
          value={formData.montantCotisation}
          onChangeText={(value) => handleChange('montantCotisation', value)}
        />

        <Text style={styles.sectionTitle}>Paramètres de pénalités</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 5 (entre 0 et 50%)"
          placeholderTextColor="#999"
          keyboardType="numeric"
          value={formData.tauxPenalite}
          onChangeText={(value) => handleChange('tauxPenalite', value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Ex: 2 (entre 0 et 30 jours)"
          placeholderTextColor="#999"
          keyboardType="numeric"
          value={formData.delaiGrace}
          onChangeText={(value) => handleChange('delaiGrace', value)}
        />

        <Text style={styles.sectionTitle}>Trésorier assigné (requis pour activation)</Text>
        <TouchableOpacity 
          style={styles.dropdownButton}
          onPress={() => {
            console.log('Clic sur dropdown trésorier');
            console.log('tresoriers.length:', tresoriers.length);
            console.log('loadingTresoriers:', loadingTresoriers);
            setShowTresorierPicker(!showTresorierPicker);
          }}
          disabled={loadingTresoriers}
        >
          <Text style={[styles.dropdownText, formData.tresorierAssigneId && { color: '#333' }]}>
            {loadingTresoriers ? 'Chargement...' : getTresorierNom(formData.tresorierAssigneId)}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>

        {showTresorierPicker && (
          <View style={styles.dropdownList}>
            {loadingTresoriers ? (
              <Text style={[styles.dropdownItem, { textAlign: 'center', color: '#999', padding: 15 }]}>
                Chargement des trésoriers...
              </Text>
            ) : tresoriers.length === 0 ? (
              <View style={{ padding: 15 }}>
                <Text style={[styles.dropdownItem, { textAlign: 'center', color: '#E74C3C', marginBottom: 10 }]}>
                  Aucun trésorier disponible
                </Text>
                <Text style={{ textAlign: 'center', color: '#999', fontSize: 12 }}>
                  Créez d'abord un compte trésorier via le menu principal
                </Text>
              </View>
            ) : (
              <ScrollView style={{ maxHeight: 150 }}>
                {tresoriers.map((tresorier) => {
                  console.log('Trésorier dans la liste:', tresorier);
                  return (
                    <TouchableOpacity 
                      key={tresorier.id} 
                      onPress={() => { 
                        console.log('Trésorier sélectionné:', tresorier.id, tresorier.prenom, tresorier.nom);
                        handleChange('tresorierAssigneId', tresorier.id); 
                        setShowTresorierPicker(false); 
                      }}
                    >
                      <Text style={styles.dropdownItem}>
                        {tresorier.prenom} {tresorier.nom}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>
        )}

      

        <TouchableOpacity 
          style={styles.nextButton} 
          onPress={handleCreateTontine}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.nextButtonText}>Étape suivante</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

CreateTontineScreen.propTypes = {
  navigation: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

export default CreateTontineScreen;