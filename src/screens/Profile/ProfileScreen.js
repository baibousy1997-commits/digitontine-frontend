import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import authService from '../../services/auth/authService';

// Activer LayoutAnimation sur Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const result = await authService.getMe();
      
      console.log('📥 Résultat COMPLET getMe:', JSON.stringify(result, null, 2));
      console.log('📦 result.data:', result.data);
      console.log('👤 result.data?.prenom:', result.data?.prenom);
      console.log('📧 result.data?.email:', result.data?.email);
      
      // ✅ CORRECTION : data est directement l'objet user
      if (result.success && result.data) {
        console.log('✅ User chargé:', result.data);
        setUser(result.data);
      } else {
        console.log('❌ Erreur:', result.error);
        Alert.alert(
          'Erreur',
          result.error?.message || 'Impossible de charger le profil'
        );
      }
    } catch (error) {
      console.error('💥 Exception:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    if (!user) return '??';
    const firstInitial = user.prenom?.charAt(0).toUpperCase() || '';
    const lastInitial = user.nom?.charAt(0).toUpperCase() || '';
    return `${firstInitial}${lastInitial}`;
  };

  const formatPhone = (phone) => {
    if (!phone) return 'Non renseigné';
    // Format : +221 77 000 00 00
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 9) {
      return `+221 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7)}`;
    }
    return phone;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mon Profil</Text>
          <View style={{ width: 26 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primaryDark} />
          <Text style={styles.loadingText}>Chargement du profil...</Text>
        </View>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mon Profil</Text>
          <View style={{ width: 26 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#999" />
          <Text style={styles.errorText}>Impossible de charger le profil</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadUserProfile}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon Profil</Text>
        <TouchableOpacity onPress={loadUserProfile}>
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar avec initiales */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>{getInitials()}</Text>
          </View>
          <Text style={styles.avatarName}>
            {user.prenom} {user.nom}
          </Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user.role}</Text>
          </View>
        </View>

        {/* Informations personnelles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Prénom</Text>
            <Text style={styles.value}>{user.prenom || 'Non renseigné'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Nom</Text>
            <Text style={styles.value}>{user.nom || 'Non renseigné'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user.email || 'Non renseigné'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>CNI</Text>
            <Text style={styles.value}>{user.cni || 'Non renseigné'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Numéro de téléphone</Text>
            <Text style={styles.value}>{formatPhone(user.telephone)}</Text>
          </View>
        </View>

        {/* Informations du compte */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations du compte</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Rôle</Text>
            <Text style={styles.value}>{user.role}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Statut</Text>
            <View style={[styles.statusBadge, user.isActive ? styles.activeStatus : styles.inactiveStatus]}>
              <Text style={styles.statusText}>
                {user.isActive ? 'Actif' : 'Inactif'}
              </Text>
            </View>
          </View>

          {user.dateInscription && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Membre depuis</Text>
              <Text style={styles.value}>
                {new Date(user.dateInscription).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </Text>
            </View>
          )}
        </View>

        {/* Bouton changer mot de passe */}
        <TouchableOpacity
          style={styles.changePasswordButton}
          onPress={() => navigation.navigate('ChangePassword')}
        >
          <Ionicons name="lock-closed-outline" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.changePasswordText}>Changer mon mot de passe</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F6F6F6' 
  },
  header: {
    backgroundColor: Colors.primaryDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  headerTitle: { 
    color: '#fff', 
    fontSize: 20, 
    fontWeight: '700' 
  },
  content: { 
    padding: 20 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.primaryDark,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  avatarContainer: { 
    alignItems: 'center', 
    marginVertical: 20 
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarInitials: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '700',
  },
  avatarName: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: Colors.primaryDark,
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: Colors.primaryDark,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primaryDark,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  label: { 
    fontSize: 15, 
    color: '#666',
    flex: 1,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeStatus: {
    backgroundColor: '#E8F5E9',
  },
  inactiveStatus: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  changePasswordButton: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 25,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonIcon: {
    marginRight: 8,
  },
  changePasswordText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '700' 
  },
});