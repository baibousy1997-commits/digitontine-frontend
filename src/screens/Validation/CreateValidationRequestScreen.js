// src/screens/Validation/CreateValidationRequestScreen.js -

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
    resourceName, //  Maintenant passé depuis les écrans de management
    reason: initialReason,
    onSuccess,
  } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [loadingTresoriers, setLoadingTresoriers] = useState(true);
  const [tresoriers, setTresoriers] = useState([]);
  const [selectedTresorier, setSelectedTresorier] = useState(null);
  const [reason, setReason] = useState(initialReason || '');

  useEffect(() => {
    console.log('\n CreateValidationRequest - Params reçus:');
    console.log('  - actionType:', actionType);
    console.log('  - resourceType:', resourceType);
    console.log('  - resourceId:', resourceId);
    console.log('  - resourceName:', resourceName);
    console.log('  - reason initial:', initialReason);
    
    loadTresoriers();
  }, []);

  const loadTresoriers = async () => {
    try {
      setLoadingTresoriers(true);
      console.log(' Début chargement des trésoriers...');
      
      const result = await userService.listUsers({ 
        role: 'tresorier', 
        isActive: true,
        limit: 100 
      });
      
      console.log(' Résultat brut API:', JSON.stringify(result, null, 2));
      console.log('   - Success:', result.success);
      console.log('   - Structure data:', typeof result.data, Array.isArray(result.data));
      
      if (result.success && result.data) {
        let tresoriersList = [];
        
        //  Extraction robuste selon plusieurs structures possibles
        if (result.data.data && Array.isArray(result.data.data.data)) {
          tresoriersList = result.data.data.data;
          console.log(' Structure détectée: result.data.data.data (pagination)');
        }
        else if (Array.isArray(result.data.data)) {
          tresoriersList = result.data.data;
          console.log(' Structure détectée: result.data.data (wrapper)');
        }
        else if (Array.isArray(result.data)) {
          tresoriersList = result.data;
          console.log(' Structure détectée: result.data (direct)');
        }
        else if (result.data.users && Array.isArray(result.data.users)) {
          tresoriersList = result.data.users;
          console.log(' Structure détectée: result.data.users');
        }
        else if (result.data.tresoriers && Array.isArray(result.data.tresoriers)) {
          tresoriersList = result.data.tresoriers;
          console.log(' Structure détectée: result.data.tresoriers');
        }
        else {
          console.error(' Structure inconnue:', result.data);
        }

        console.log(` Nombre de trésoriers trouvés: ${tresoriersList.length}`);
        
        if (tresoriersList.length > 0) {
          console.log(' Premier trésorier:', JSON.stringify(tresoriersList[0], null, 2));
          
          // Filtrer pour être sûr d'avoir que des trésoriers actifs
          const filteredList = tresoriersList.filter(t => {
            const roleOk = t.role === 'tresorier' || t.role === 'Tresorier';
            const activeOk = t.isActive === true;
            return roleOk && activeOk;
          });
          
          console.log(` Après filtrage: ${filteredList.length} trésoriers actifs`);
          
          setTresoriers(filteredList);
          
          // Sélectionner le premier par défaut
          if (filteredList.length > 0) {
            const firstId = filteredList[0]._id || filteredList[0].id;
            setSelectedTresorier(firstId);
            console.log(' Premier trésorier sélectionné par défaut:', firstId);
          }
        } else {
          console.log(' Aucun trésorier dans la liste');
          setTresoriers([]);
        }
      } else {
        console.error(' Erreur API ou structure invalide');
        console.error('   - Success:', result.success);
        console.error('   - Data:', result.data);
        console.error('   - Error:', result.error);
        setTresoriers([]);
      }
    } catch (error) {
      console.error(' Exception chargement trésoriers:', error);
      console.error('   - Message:', error.message);
      console.error('   - Stack:', error.stack);
      setTresoriers([]);
      
      Alert.alert(
        ' Erreur',
        'Impossible de charger les trésoriers. Vérifiez votre connexion.',
        [{ text: 'OK' }]
      );
    } finally {
      console.log(' Fin chargement - loadingTresoriers = false');
      setLoadingTresoriers(false);
    }
  };

  const handleSubmit = async () => {
    //  CORRECTION : Pas de minimum de 10 caractères
    if (!reason.trim()) {
      Alert.alert('Erreur', 'La raison est requise');
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
          ' Demande creee',
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
        Alert.alert(' Erreur', result.error?.message || 'Impossible de creer la demande');
      }
    } catch (error) {
      console.error('Erreur creation demande:', error);
      Alert.alert(' Erreur', 'Une erreur est survenue');
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
    ACTIVATE_TONTINE: 'Activation de tontine',
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
          {/* CORRECTION : Afficher resourceName passé depuis l'écran de management */}
          <Text style={[styles.value, { color: theme.text }]}>
            {resourceName || 'N/A'}
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Tresorier assigne *
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
        
        {/*  CORRECTION : Texte d'aide adapté */}
        <Text style={[styles.helperText, { color: theme.textSecondary }]}>
          Expliquez brièvement pourquoi cette action est nécessaire
        </Text>

        <TextInput
          style={[
            styles.reasonInput,
            { backgroundColor: theme.surface, color: theme.text },
          ]}
          placeholder="Ex: Compte inactif depuis 6 mois"
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
  helperText: { fontSize: 13, marginBottom: 10 },
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