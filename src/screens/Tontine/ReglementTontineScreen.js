// src/screens/Tontine/ReglementTontineScreen.js
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import Colors from '../../constants/colors';

const ReglementTontineScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { 
    tontineId, 
    tontineName, 
    reglement, 
    montantCotisation,
    frequence,
    dateDebut,
    tauxPenalite,
    delaiGrace,
  } = route.params;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Règlement
        </Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Contenu */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Badge succès */}
        <View style={styles.successBadge}>
          <Ionicons name="checkmark-circle" size={48} color={Colors.accentGreen} />
          <Text style={[styles.successTitle, { color: theme.text }]}>
            Tontine créée avec succès !
          </Text>
          <Text style={[styles.successSubtitle, { color: theme.textSecondary }]}>
            "{tontineName}"
          </Text>
        </View>

        {/* Résumé */}
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
             Résumé
          </Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
              Cotisation
            </Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {montantCotisation?.toLocaleString()} FCFA / {frequence}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
              Date de début
            </Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {new Date(dateDebut).toLocaleDateString('fr-FR')}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
              Taux de pénalité
            </Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {tauxPenalite}%
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
              Délai de grâce
            </Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {delaiGrace} jour(s)
            </Text>
          </View>
        </View>

        {/* Règlement complet */}
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
             Règlement complet
          </Text>
          <Text style={[styles.reglementText, { color: theme.text }]}>
            {reglement || 'Aucun règlement disponible'}
          </Text>
        </View>

        {/* Info importante */}
        <View style={[styles.infoBox, { backgroundColor: '#FEF3C7' }]}>
          <Ionicons name="information-circle" size={24} color="#92400E" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.infoBoxTitle, { color: '#92400E' }]}>
              Prochaine étape
            </Text>
            <Text style={[styles.infoBoxText, { color: '#92400E' }]}>
              Les membres invités recevront une notification avec ce règlement complet. Ils devront l'accepter avant de rejoindre la tontine.
            </Text>
          </View>
        </View>

        {/* Bouton retour accueil */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: Colors.primaryDark }]}
          onPress={() => navigation.navigate('Accueil')}
        >
          <Ionicons name="home" size={20} color="#fff" />
          <Text style={styles.buttonText}>Retour à l'accueil</Text>
        </TouchableOpacity>

        {/* Bouton voir détails tontine */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: Colors.accentGreen }]}
          onPress={() => navigation.navigate('TontineDetails', { tontineId })}
        >
          <Ionicons name="eye" size={20} color="#fff" />
          <Text style={styles.buttonText}>Voir les détails de la tontine</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  successBadge: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 15,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  card: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
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
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  reglementText: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: 'monospace',
  },
  infoBox: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  infoBoxTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  infoBoxText: {
    fontSize: 13,
    lineHeight: 18,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default ReglementTontineScreen;