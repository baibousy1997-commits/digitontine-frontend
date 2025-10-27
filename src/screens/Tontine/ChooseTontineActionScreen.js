// src/screens/Tontine/ChooseTontineActionScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import Colors from '../../constants/colors';

const ChooseTontineActionScreen = ({ navigation }) => {
  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={() => navigation.goBack()}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={() => navigation.goBack()}
      >
        <View style={styles.modalContent}>
          <Text style={styles.title}>Que voulez-vous creer ?</Text>

          {/* Creer une tontine */}
          <TouchableOpacity
            style={[styles.optionButton, styles.tontineButton]}
            onPress={() => {
              navigation.goBack();
              setTimeout(() => navigation.navigate('CreateTontine'), 100);
            }}
          >
            <View style={styles.optionIconContainer}>
              <MaterialCommunityIcons name="hand-coin" size={40} color="#fff" />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Creer une tontine</Text>
              <Text style={styles.optionSubtitle}>
                Lancez une nouvelle tontine avec vos membres
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Creer un utilisateur */}
          <TouchableOpacity
            style={[styles.optionButton, styles.userButton]}
            onPress={() => {
              navigation.goBack();
              setTimeout(() => navigation.navigate('CreateUser'), 100);
            }}
          >
            <View style={styles.optionIconContainer}>
              <Ionicons name="person-add" size={40} color="#fff" />
            </View>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Creer un utilisateur</Text>
              <Text style={styles.optionSubtitle}>
                Ajoutez un nouveau membre ou tresorier
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Bouton annuler */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

ChooseTontineActionScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
  }).isRequired,
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  tontineButton: {
    backgroundColor: Colors.accentGreen || '#27AE60',
  },
  userButton: {
    backgroundColor: Colors.primaryDark || '#004aad',
  },
  optionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 5,
  },
  optionSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
  },
});

export default ChooseTontineActionScreen;