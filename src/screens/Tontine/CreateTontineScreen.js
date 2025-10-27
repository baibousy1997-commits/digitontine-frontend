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
  
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    montantCotisation: '',
    frequence: 'Mensuelle',
    dateDebut: '',
    nombreMembresMin: '3',
    nombreMembresMax: '50',
    tauxPenalite: '5',
    delaiGrace: '2',
    tresorierAssigneId: '',
  });

  const [dateDisplay, setDateDisplay] = useState({
    day: '1',
    month: 'janvier',
    year: '2025',
  });

  const [showDayPicker, setShowDayPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [showTresorierPicker, setShowTresorierPicker] = useState(false);

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    'janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre'
  ];
  const years = Array.from({ length: 10 }, (_, i) => 2025 + i);
  const durations = Array.from({ length: 22 }, (_, i) => i + 3);

  useEffect(() => {
    loadTresoriers();
  }, []);

  useEffect(() => {
    updateDateDebut();
  }, [dateDisplay]);

  const loadTresoriers = async () => {
    try {
      const result = await userService.listUsers({ role: 'Tresorier', isActive: true });
      if (result.success && result.data?.data?.users) {
        setTresoriers(result.data.data.users);
      }
    } catch (error) {
      console.error('Erreur chargement tresoriers:', error);
    } finally {
      setLoadingTresoriers(false);
    }
  };

  const updateDateDebut = () => {
    const monthIndex = months.indexOf(dateDisplay.month);
    const dateStr = `${dateDisplay.year}-${String(monthIndex + 1).padStart(2, '0')}-${String(dateDisplay.day).padStart(2, '0')}`;
    setFormData(prev => ({ ...prev, dateDebut: dateStr }));
  };

  const calculateDateFin = (dateDebut, dureeMois) => {
    const date = new Date(dateDebut);
    date.setMonth(date.getMonth() + parseInt(dureeMois));
    return date.toISOString().split('T')[0];
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.nom.trim()) {
      Alert.alert('Erreur', 'Le nom de la tontine est requis');
      return false;
    }

    if (!formData.montantCotisation || parseInt(formData.montantCotisation) < 5000) {
      Alert.alert('Erreur', 'Le montant minimum est de 5000 FCFA');
      return false;
    }

    if (!formData.nombreMembresMax || parseInt(formData.nombreMembresMax) < 3) {
      Alert.alert('Erreur', 'La duree minimum est de 3 mois');
      return false;
    }

    if (!formData.tresorierAssigneId) {
      Alert.alert('Erreur', 'Vous devez assigner un tresorier');
      return false;
    }

    return true;
  };

  const handleCreateTontine = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const dureeMois = parseInt(formData.nombreMembresMax);
      const dateFin = calculateDateFin(formData.dateDebut, dureeMois);

      const payload = {
        nom: formData.nom.trim(),
        description: formData.description.trim(),
        montantCotisation: parseInt(formData.montantCotisation),
        frequence: formData.frequence,
        dateDebut: formData.dateDebut,
        dateFin: dateFin,
        nombreMembresMin: parseInt(formData.nombreMembresMin),
        nombreMembresMax: parseInt(formData.nombreMembresMax),
        tauxPenalite: parseFloat(formData.tauxPenalite),
        delaiGrace: parseInt(formData.delaiGrace),
        tresorierAssigneId: formData.tresorierAssigneId,
      };

      console.log('Creation tontine avec payload:', payload);

      const result = await tontineService.createTontine(payload);

      if (result.success) {
        const tontineId = result.data?.data?.tontine?.id;
        
        Alert.alert(
          'Succes',
          'Tontine creee avec succes',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.navigate('AddMembers', {
                  tontineId,
                  tontineName: formData.nom,
                  requiredMembers: parseInt(formData.nombreMembresMax),
                });
              },
            },
          ]
        );
      } else {
        Alert.alert('Erreur', result.error?.message || 'Impossible de creer la tontine');
      }
    } catch (error) {
      console.error('Erreur creation tontine:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const getTresorierNom = (tresorierAssigneId) => {
    const tresorier = tresoriers.find(t => t.id === tresorierAssigneId);
    return tresorier ? `${tresorier.prenom} ${tresorier.nom}` : 'Selectionnez un tresorier';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.backText}>Retour</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Creation de la tontine</Text>

        <TextInput
          style={styles.input}
          placeholder="Nom de la tontine"
          placeholderTextColor="#999"
          value={formData.nom}
          onChangeText={(value) => handleChange('nom', value)}
        />

        <Text style={styles.sectionTitle}>Date de premiere distribution</Text>

        <View style={styles.dateContainer}>
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShowDayPicker(!showDayPicker)}
          >
            <Text style={styles.dateText}>{dateDisplay.day}</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.dateButton, styles.dateButtonWide]}
            onPress={() => setShowMonthPicker(!showMonthPicker)}
          >
            <Text style={styles.dateText}>{dateDisplay.month}</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShowYearPicker(!showYearPicker)}
          >
            <Text style={styles.dateText}>{dateDisplay.year}</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {showDayPicker && (
          <View style={styles.dropdownList}>
            <ScrollView style={{ maxHeight: 150 }}>
              {days.map((d) => (
                <TouchableOpacity key={d} onPress={() => { 
                  setDateDisplay(prev => ({ ...prev, day: d })); 
                  setShowDayPicker(false); 
                }}>
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
                <TouchableOpacity key={m} onPress={() => { 
                  setDateDisplay(prev => ({ ...prev, month: m })); 
                  setShowMonthPicker(false); 
                }}>
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
                <TouchableOpacity key={y} onPress={() => { 
                  setDateDisplay(prev => ({ ...prev, year: y })); 
                  setShowYearPicker(false); 
                }}>
                  <Text style={styles.dropdownItem}>{y}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <Text style={styles.dateInfo}>
          Le <Text style={styles.highlight}>{dateDisplay.day}</Text> de chaque mois, a partir de{' '}
          <Text style={styles.highlight}>{dateDisplay.month}</Text> {dateDisplay.year}, un membre recevra la cagnotte.
        </Text>

        <Text style={styles.sectionTitle}>Duree de la tontine</Text>
        <Text style={styles.durationInfo}>1 mois = 1 membre</Text>

        <TouchableOpacity 
          style={styles.dropdownButton}
          onPress={() => setShowDurationPicker(!showDurationPicker)}
        >
          <Text style={[styles.dropdownText, formData.nombreMembresMax && { color: '#333' }]}>
            {formData.nombreMembresMax ? `${formData.nombreMembresMax} mois` : 'Selectionnez la duree'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>

        {showDurationPicker && (
          <View style={styles.dropdownList}>
            <ScrollView style={{ maxHeight: 150 }}>
              {durations.map((d) => (
                <TouchableOpacity key={d} onPress={() => { 
                  handleChange('nombreMembresMax', d.toString()); 
                  setShowDurationPicker(false); 
                }}>
                  <Text style={styles.dropdownItem}>{d} mois</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <Text style={styles.sectionTitle}>Frequence des versements</Text>
        <View style={styles.frequencyContainer}>
          <TouchableOpacity 
            style={[
              styles.frequencyButton, 
              formData.frequence === 'Hebdomadaire' && styles.frequencyButtonActive
            ]}
            onPress={() => handleChange('frequence', 'Hebdomadaire')}
          >
            <Text style={[
              styles.frequencyText,
              formData.frequence === 'Hebdomadaire' && styles.frequencyTextActive
            ]}>
              Hebdomadaire
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.frequencyButton, 
              formData.frequence === 'Mensuelle' && styles.frequencyButtonActive
            ]}
            onPress={() => handleChange('frequence', 'Mensuelle')}
          >
            <Text style={[
              styles.frequencyText,
              formData.frequence === 'Mensuelle' && styles.frequencyTextActive
            ]}>
              Mensuelle
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Montant de la cotisation</Text>
        <Text style={styles.amountInfo}>
          Le montant minimum de la cotisation mensuelle est de{' '}
          <Text style={styles.highlight}>5000 FCFA</Text>
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Entrez le montant ici"
          placeholderTextColor="#999"
          keyboardType="numeric"
          value={formData.montantCotisation}
          onChangeText={(value) => handleChange('montantCotisation', value)}
        />

        <Text style={styles.sectionTitle}>Tresorier assigne</Text>
        <TouchableOpacity 
          style={styles.dropdownButton}
          onPress={() => setShowTresorierPicker(!showTresorierPicker)}
          disabled={loadingTresoriers}
        >
          <Text style={[styles.dropdownText, formData.tresorierAssigneId && { color: '#333' }]}>
            {loadingTresoriers ? 'Chargement...' : getTresorierNom(formData.tresorierAssigneId)}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>

        {showTresorierPicker && tresoriers.length > 0 && (
          <View style={styles.dropdownList}>
            <ScrollView style={{ maxHeight: 150 }}>
              {tresoriers.map((tresorier) => (
                <TouchableOpacity 
                  key={tresorier.id} 
                  onPress={() => { 
                    handleChange('tresorierAssigneId', tresorier.id); 
                    setShowTresorierPicker(false); 
                  }}
                >
                  <Text style={styles.dropdownItem}>
                    {tresorier.prenom} {tresorier.nom}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <Text style={styles.sectionTitle}>Description / Regles (optionnel)</Text>
        <TextInput
          style={[styles.input, styles.descriptionInput]}
          placeholder="Ajoutez une description ou les regles de la tontine..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          value={formData.description}
          onChangeText={(value) => handleChange('description', value)}
        />

        <TouchableOpacity 
          style={styles.nextButton} 
          onPress={handleCreateTontine}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.nextButtonText}>Etape suivante</Text>
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