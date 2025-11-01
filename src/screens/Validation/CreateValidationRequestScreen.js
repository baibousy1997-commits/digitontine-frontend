// src/screens/Validation/CreateValidationRequestScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import validationService from '../../services/validation/validationService';
import userService from '../../services/user/userService';
import Colors from '../../constants/colors';

const CreateValidationRequestScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const {
    actionType,
    resourceType,
    resourceId,
    resourceName,
    reason: initialReason,
    onSuccess,
  } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [loadingTresoriers, setLoadingTresoriers] = useState(true);
  const [tresoriers, setTresoriers] = useState([]);
  const [selectedTresorier, setSelectedTresorier] = useState(null);
  const [reason, setReason] = useState(initialReason || '');

  useEffect(() => {
    loadTresoriers();
  }, []);

  const loadTresoriers = async () => {
    try {
      setLoadingTresoriers(true);
      console.log('Debut chargement des tresoriers...');
      
      const result = await userService.listUsers({ 
        role: 'tresorier', 
        isActive: true,
        limit: 100 
      });
      
      console.log('Resultat complet:', JSON.stringify(result, null, 2));
      console.log('Success:', result.success);
      console.log('Structure data:', result.data);
      
      if (result.success && result.data?.data) {
        // CORRECTION : Meme logique que CreateTontineScreen.js
        const tresoriersList = Array.isArray(result.data.data?.data) 
          ? result.data.data.data 
          : (Array.isArray(result.data.data) ? result.data.data : []);

        console.log('Nombre de tresoriers:', tresoriersList.length);
        console.log('Liste des tresoriers:', tresoriersList);
        setTresoriers(tresoriersList);
        
        // Selectionner le premier par defaut
        if (tresoriersList.length > 0) {
          setSelectedTresorier(tresoriersList[0]._id || tresoriersList[0].id);
        }
      } else {
        console.log('Aucun tresorier trouve ou structure inattendue');
        console.log('Donnees recues:', result);
        setTresoriers([]);
      }
    } catch (error) {
      console.error('Erreur chargement tresoriers:', error);
      console.error('Stack:', error.stack);
      setTresoriers([]);
    } finally {
      console.log('Fin chargement - loadingTresoriers = false');
      setLoadingTresoriers(false);
    }
  };

  const handleSubmit = async () => {
    if (!reason.trim() || reason.trim().length < 10) {
      Alert.alert('Erreur', 'La raison doit contenir au moins 10 caracteres');
      return;
    }

    if (!selectedTresorier) {
      Alert.alert('Erreur', 'Veuillez selectionner un tresorier');
      return;
    }

    setLoading(true);
    try {
      const result = await validationService.createValidationRequest({
        actionType,
        resourceType,
        resourceId,
        reason: reason.trim(),
        assignedTresorier: selectedTresorier,
      });

      if (result.success) {
        Alert.alert(
          'Demande creee',
          `Votre demande a ete envoyee au tresorier.\n\nVous recevrez une notification lorsqu'il aura valide.`,
          [
            {
              text: 'OK',
              onPress: () => {
                if (onSuccess) onSuccess();
                navigation.goBack();
              },
            },
          ]
        );
      } else {
        Alert.alert('Erreur', result.error?.message || 'Impossible de creer la demande');
      }
    } catch (error) {
      console.error('Erreur creation demande:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const actionLabels = {
    DELETE_USER: 'Suppression d\'utilisateur',
    ACTIVATE_USER: 'Activation d\'utilisateur',
    DEACTIVATE_USER: 'Desactivation d\'utilisateur',
    DELETE_TONTINE: 'Suppression de tontine',
    BLOCK_TONTINE: 'Blocage de tontine',
    UNBLOCK_TONTINE: 'Deblocage de tontine',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Demande de Validation
        </Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.warningBox, { backgroundColor: '#fff3cd' }]}>
          <Ionicons name="shield-checkmark" size={32} color="#856404" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.warningTitle}>Action Critique</Text>
            <Text style={styles.warningText}>
              Cette action necessite la validation d'un Tresorier
            </Text>
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Action</Text>
          <Text style={[styles.value, { color: theme.text }]}>
            {actionLabels[actionType] || actionType}
          </Text>

          <Text style={[styles.label, { color: theme.textSecondary, marginTop: 15 }]}>
            Ressource
          </Text>
          <Text style={[styles.value, { color: theme.text }]}>{resourceName}</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Tresorier assigne
        </Text>

        {loadingTresoriers ? (
          <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
            <ActivityIndicator size="small" color={Colors.primaryDark} />
            <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 10 }}>
              Chargement des tresoriers...
            </Text>
          </View>
        ) : tresoriers.length === 0 ? (
          <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
            <Ionicons name="alert-circle" size={32} color={Colors.dangerRed} style={{ alignSelf: 'center' }} />
            <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 10 }}>
              Aucun tresorier disponible
            </Text>
            <Text style={{ color: theme.placeholder, textAlign: 'center', marginTop: 5, fontSize: 12 }}>
              Creez d'abord un compte tresorier via le menu principal
            </Text>
          </View>
        ) : (
          tresoriers.map((tresorier) => {
            const tresorierid = tresorier._id || tresorier.id;
            const isSelected = tresorierid === selectedTresorier;

            return (
              <TouchableOpacity
                key={tresorierid}
                style={[
                  styles.tresorierCard,
                  { backgroundColor: theme.surface },
                  isSelected && { borderColor: Colors.primaryDark, borderWidth: 2 },
                ]}
                onPress={() => setSelectedTresorier(tresorierid)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.tresorierName, { color: theme.text }]}>
                    {tresorier.prenom} {tresorier.nom}
                  </Text>
                  <Text style={[styles.tresorierEmail, { color: theme.textSecondary }]}>
                    {tresorier.email}
                  </Text>
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={24} color={Colors.accentGreen} />
                )}
              </TouchableOpacity>
            );
          })
        )}

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Raison de la demande *
        </Text>
        <TextInput
          style={[
            styles.reasonInput,
            { backgroundColor: theme.surface, color: theme.text },
          ]}
          placeholder="Expliquez pourquoi cette action est necessaire (min 10 caracteres)"
          placeholderTextColor={theme.placeholder}
          value={reason}
          onChangeText={setReason}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          editable={!initialReason}
        />

        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: Colors.primaryDark },
            (loading || tresoriers.length === 0) && { opacity: 0.6 },
          ]}
          onPress={handleSubmit}
          disabled={loading || tresoriers.length === 0}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="send" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Envoyer la demande</Text>
            </>
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
  headerTitle: { fontSize: 18, fontWeight: '700' },
  content: { padding: 20 },
  warningBox: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  warningTitle: { fontSize: 16, fontWeight: '700', color: '#856404', marginBottom: 4 },
  warningText: { fontSize: 13, color: '#856404' },
  infoCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 5 },
  value: { fontSize: 16, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 15 },
  tresorierCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tresorierName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  tresorierEmail: { fontSize: 13 },
  reasonInput: {
    borderRadius: 12,
    padding: 15,
    fontSize: 14,
    minHeight: 120,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    gap: 10,
  },
  submitButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});

export default CreateValidationRequestScreen;