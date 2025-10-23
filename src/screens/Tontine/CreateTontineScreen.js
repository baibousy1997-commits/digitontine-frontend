import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../../styles/CreateTontineScreenStyles';

const CreateTontineScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [day, setDay] = useState('1');
  const [month, setMonth] = useState('janvier');
  const [year, setYear] = useState('2025');
  const [duration, setDuration] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('mensuel');
  const [description, setDescription] = useState('');

  const [showDayPicker, setShowDayPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];
  const years = Array.from({ length: 10 }, (_, i) => 2025 + i);
  const durations = Array.from({ length: 22 }, (_, i) => i + 3); // à partir de 3 mois

  const handleNext = () => {
    if (!name || !duration || !amount) {
      alert('Veuillez remplir tous les champs requis');
      return;
    }

    navigation.navigate('AddMembers', {
      tontineName: name,
      day,
      month,
      year,
      duration,
      frequency,
      amount,
      description
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.backText}>Retour</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Création de la tontine</Text>

        {/* Nom de la tontine */}
        <TextInput
          style={styles.input}
          placeholder="Nom de la tontine"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
        />

        {/* Date Section */}
        <Text style={styles.sectionTitle}>Entrez la date de première distribution</Text>

        <View style={styles.dateContainer}>
          {/* Jour */}
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShowDayPicker(!showDayPicker)}
          >
            <Text style={styles.dateText}>{day}</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>

          {/* Mois */}
          <TouchableOpacity 
            style={[styles.dateButton, styles.dateButtonWide]}
            onPress={() => setShowMonthPicker(!showMonthPicker)}
          >
            <Text style={styles.dateText}>{month}</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>

          {/* Année */}
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShowYearPicker(!showYearPicker)}
          >
            <Text style={styles.dateText}>{year}</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Listes déroulantes pour date */}
        {showDayPicker && (
          <View style={styles.dropdownList}>
            <ScrollView style={{ maxHeight: 150 }}>
              {days.map((d) => (
                <TouchableOpacity key={d} onPress={() => { setDay(d); setShowDayPicker(false); }}>
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
                <TouchableOpacity key={m} onPress={() => { setMonth(m); setShowMonthPicker(false); }}>
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
                <TouchableOpacity key={y} onPress={() => { setYear(y); setShowYearPicker(false); }}>
                  <Text style={styles.dropdownItem}>{y}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <Text style={styles.dateInfo}>
          Le <Text style={styles.highlight}>{day}</Text> de chaque mois, à partir de{' '}
          <Text style={styles.highlight}>{month}</Text> {year}, un membre recevra la cagnotte.
        </Text>

        {/* Durée Section */}
        <Text style={styles.sectionTitle}>Choisissez la durée de la tontine</Text>
        <Text style={styles.durationInfo}>1 mois = 1 membre </Text>

        <TouchableOpacity 
          style={styles.dropdownButton}
          onPress={() => setShowDurationPicker(!showDurationPicker)}
        >
          <Text style={styles.dropdownText}>
            {duration ? `${duration} mois` : 'Sélectionnez la durée'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>

        {showDurationPicker && (
          <View style={styles.dropdownList}>
            <ScrollView style={{ maxHeight: 150 }}>
              {durations.map((d) => (
                <TouchableOpacity key={d} onPress={() => { setDuration(d); setShowDurationPicker(false); }}>
                  <Text style={styles.dropdownItem}>{d} mois</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Fréquence */}
        <Text style={styles.sectionTitle}>Fréquence des versements</Text>
        <View style={styles.frequencyContainer}>
          <TouchableOpacity 
            style={[
              styles.frequencyButton, 
              frequency === 'hebdomadaire' && styles.frequencyButtonActive
            ]}
            onPress={() => setFrequency('hebdomadaire')}
          >
            <Text style={[
              styles.frequencyText,
              frequency === 'hebdomadaire' && styles.frequencyTextActive
            ]}>
              Hebdomadaire
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.frequencyButton, 
              frequency === 'mensuel' && styles.frequencyButtonActive
            ]}
            onPress={() => setFrequency('mensuel')}
          >
            <Text style={[
              styles.frequencyText,
              frequency === 'mensuel' && styles.frequencyTextActive
            ]}>
              Mensuel
            </Text>
          </TouchableOpacity>
        </View>

        {/* Montant */}
        <Text style={styles.sectionTitle}>Choisissez le montant de la cotisation</Text>
        <Text style={styles.amountInfo}>
          Le montant minimum de la cotisation mensuelle est de{' '}
          <Text style={styles.highlight}>5000 CFA</Text>
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Entrez le montant ici"
          placeholderTextColor="#999"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        {/* Description */}
        <Text style={styles.sectionTitle}>Description / Règles (optionnel)</Text>
        <TextInput
          style={[styles.input, styles.descriptionInput]}
          placeholder="Ajoutez une description ou les règles de la tontine..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          value={description}
          onChangeText={setDescription}
        />

        {/* Bouton Suivant */}
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Étape suivante</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default CreateTontineScreen;
