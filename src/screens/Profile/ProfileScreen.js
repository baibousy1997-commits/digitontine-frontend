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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import authService from '../../services/auth/authService';

// Activer LayoutAnimation sur Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ProfileScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const result = await authService.getMe();
      
      console.log('Resultat COMPLET getMe:', JSON.stringify(result, null, 2));
      console.log('result.data:', result.data);
      console.log('result.data?.prenom:', result.data?.prenom);
      console.log('result.data?.email:', result.data?.email);
      
      // CORRECTION : data est directement l'objet user
      if (result.success && result.data) {
        console.log('User charge:', result.data);
        setUser(result.data);
      } else {
        console.log('Erreur:', result.error);
        Alert.alert(
          'Erreur',
          result.error?.message || 'Impossible de charger le profil'
        );
      }
    } catch (error) {
      console.error('Exception:', error);
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

  // Utiliser photoProfil si disponible, sinon photoIdentite comme fallback
  const photoUrl = user?.photoProfil || user?.photoIdentite || null;
  const hasPhoto = photoUrl && photoUrl.trim() !== '';

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
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.headerBackground} />
        <View style={[styles.header, { backgroundColor: theme.headerBackground }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={26} color={theme.textLight} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.textLight }]}>Mon Profil</Text>
          <View style={{ width: 26 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primaryDark} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Chargement du profil...</Text>
        </View>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.headerBackground} />
        <View style={[styles.header, { backgroundColor: theme.headerBackground }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={26} color={theme.textLight} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.textLight }]}>Mon Profil</Text>
          <View style={{ width: 26 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color={theme.textSecondary} />
          <Text style={[styles.errorText, { color: theme.text }]}>Impossible de charger le profil</Text>
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: theme.primaryDark }]} onPress={loadUserProfile}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.headerBackground} />
      <View style={[styles.header, { backgroundColor: theme.headerBackground }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color={theme.textLight} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textLight }]}>Mon Profil</Text>
        <TouchableOpacity onPress={loadUserProfile}>
          <Ionicons name="refresh" size={24} color={theme.textLight} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar avec photo ou initiales */}
        <View style={styles.avatarContainer}>
          {hasPhoto ? (
            <Image 
              source={{ uri: photoUrl }} 
              style={styles.avatarCircle}
            />
          ) : (
            <View style={[styles.avatarCircle, { backgroundColor: theme.primaryDark }]}>
              <Text style={styles.avatarInitials}>{getInitials()}</Text>
            </View>
          )}
          <Text style={[styles.avatarName, { color: theme.text }]}>
            {user.prenom} {user.nom}
          </Text>
          <View style={[styles.roleBadge, { backgroundColor: theme.primaryDark }]}>
            <Text style={styles.roleText}>{user.role}</Text>
          </View>
        </View>

        {/* Informations personnelles */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.primaryDark }]}>Informations personnelles</Text>
          
          <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Prénom</Text>
            <Text style={[styles.value, { color: theme.text }]}>{user.prenom || 'Non renseigné'}</Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Nom</Text>
            <Text style={[styles.value, { color: theme.text }]}>{user.nom || 'Non renseigné'}</Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
            <Text style={[styles.value, { color: theme.text }]}>{user.email || 'Non renseigné'}</Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>CNI</Text>
            <Text style={[styles.value, { color: theme.text }]}>{user.cni || 'Non renseigné'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Numéro de téléphone</Text>
            <Text style={[styles.value, { color: theme.text }]}>{formatPhone(user.telephone)}</Text>
          </View>
        </View>

        {/* Informations du compte */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.primaryDark }]}>Informations du compte</Text>
          
          <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Rôle</Text>
            <Text style={[styles.value, { color: theme.text }]}>{user.role}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Statut</Text>
            <View style={[
              styles.statusBadge, 
              user.isActive 
                ? { backgroundColor: isDarkMode ? '#2E7D32' : '#E8F5E9' } 
                : { backgroundColor: isDarkMode ? '#C62828' : '#FFEBEE' }
            ]}>
              <Text style={[
                styles.statusText,
                { color: user.isActive ? (isDarkMode ? '#81C784' : '#2E7D32') : (isDarkMode ? '#EF5350' : '#C62828') }
              ]}>
                {user.isActive ? 'Actif' : 'Inactif'}
              </Text>
            </View>
          </View>

          {user.dateInscription && (
            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Membre depuis</Text>
              <Text style={[styles.value, { color: theme.text }]}>
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
          style={[styles.changePasswordButton, { backgroundColor: theme.primaryDark }]}
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  headerTitle: { 
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  avatarInitials: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '700',
  },
  avatarName: { 
    fontSize: 24, 
    fontWeight: '700', 
    marginBottom: 8,
  },
  roleBadge: {
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  label: { 
    fontSize: 15, 
    flex: 1,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  changePasswordButton: {
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