// src/screens/Users/ManageUsersScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  StatusBar,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import userService from '../../services/user/userService';
import validationService from '../../services/validation/validationService';
import Colors from '../../constants/colors';

const ManageUsersScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { criticalActions } = route.params || {};
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('all'); // all, Administrateur, Tresorier, Membre
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const result = await userService.listUsers({ limit: 100 });
      
      if (result.success) {
        let usersList = [];
        
        if (Array.isArray(result.data?.data?.data)) {
          usersList = result.data.data.data;
        } else if (Array.isArray(result.data?.data)) {
          usersList = result.data.data;
        } else if (Array.isArray(result.data)) {
          usersList = result.data;
        }
        
        console.log('Utilisateurs chargés:', usersList.length);
        setUsers(usersList);
      } else {
        console.error('Erreur:', result.error);
        setUsers([]);
      }
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const getUserId = (user) => user._id || user.id;

  const getRoleColor = (role) => {
    switch (role) {
      case 'Administrateur': return Colors.dangerRed;
      case 'Tresorier': return Colors.primaryDark;
      case 'Membre': return Colors.accentGreen;
      default: return Colors.placeholder;
    }
  };

  // ========================================
  // ACTIONS CRITIQUES (avec validation)
  // ========================================

  const handleActivateUser = (user) => {
    if (criticalActions) {
      // Mode validation
      Alert.alert(
        ' Activation avec validation',
        `L'activation de "${user.prenom} ${user.nom}" nécessite la validation d'un Trésorier.\n\nVoulez-vous créer une demande de validation ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Créer la demande',
            onPress: () => {
              Alert.prompt(
                'Raison de l\'activation',
                'Expliquez pourquoi cet utilisateur doit être activé :',
                [
                  { text: 'Annuler', style: 'cancel' },
                  {
                    text: 'Valider',
                    onPress: (reason) => {
                      if (!reason || reason.trim().length < 10) {
                        Alert.alert(' Erreur', 'La raison doit contenir au moins 10 caractères');
                        return;
                      }
                      
                      navigation.navigate('CreateValidationRequest', {
                        actionType: 'ACTIVATE_USER',
                        resourceType: 'User',
                        resourceId: getUserId(user),
                        resourceName: `${user.prenom} ${user.nom} (${user.email})`,
                        reason: reason.trim(),
                        onSuccess: () => loadUsers(),
                      });
                    }
                  }
                ],
                'plain-text'
              );
            }
          }
        ]
      );
    } else {
      // Mode direct (lecture seule)
      Alert.alert(' Action non disponible', 'Utilisez le mode "Actions Critiques" pour activer un utilisateur');
    }
  };

  const handleDeactivateUser = (user) => {
    if (criticalActions) {
      Alert.alert(
        'Désactivation avec validation',
        `La désactivation de "${user.prenom} ${user.nom}" nécessite la validation d'un Trésorier.\n\nVoulez-vous créer une demande de validation ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Créer la demande',
            onPress: () => {
              Alert.prompt(
                'Raison de la désactivation',
                'Expliquez pourquoi cet utilisateur doit être désactivé :',
                [
                  { text: 'Annuler', style: 'cancel' },
                  {
                    text: 'Valider',
                    onPress: (reason) => {
                      if (!reason || reason.trim().length < 10) {
                        Alert.alert('Erreur', 'La raison doit contenir au moins 10 caractères');
                        return;
                      }
                      
                      navigation.navigate('CreateValidationRequest', {
                        actionType: 'DEACTIVATE_USER',
                        resourceType: 'User',
                        resourceId: getUserId(user),
                        resourceName: `${user.prenom} ${user.nom} (${user.email})`,
                        reason: reason.trim(),
                        onSuccess: () => loadUsers(),
                      });
                    }
                  }
                ],
                'plain-text'
              );
            }
          }
        ]
      );
    } else {
      Alert.alert('ℹ Action non disponible', 'Utilisez le mode "Actions Critiques" pour désactiver un utilisateur');
    }
  };

  const handleDeleteUser = (user) => {
    if (criticalActions) {
      Alert.alert(
        ' SUPPRESSION CRITIQUE',
        `ATTENTION !\n\nVous allez supprimer définitivement l'utilisateur "${user.prenom} ${user.nom}".\n\nCette action nécessite la validation d'un Trésorier.\n\nÊtes-vous sûr de vouloir créer cette demande ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Créer la demande',
            style: 'destructive',
            onPress: () => {
              navigation.navigate('CreateValidationRequest', {
                actionType: 'DELETE_USER',
                resourceType: 'User',
                resourceId: getUserId(user),
                resourceName: `${user.prenom} ${user.nom} (${user.email})`,
                onSuccess: () => loadUsers(),
              });
            }
          }
        ]
      );
    } else {
      Alert.alert('ℹ Action non disponible', 'Utilisez le mode "Actions Critiques" pour supprimer un utilisateur');
    }
  };

  // ========================================
  // FILTRAGE & RECHERCHE
  // ========================================

  const filteredUsers = users.filter((user) => {
    const matchesFilter = filter === 'all' || user.role === filter;
    const matchesSearch = 
      searchQuery === '' ||
      user.prenom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // ========================================
  // RENDER ITEM
  // ========================================

  const renderUser = ({ item }) => {
    const canActivate = !item.isActive;
    const canDeactivate = item.isActive;

    return (
      <View style={[styles.userCard, { backgroundColor: theme.surface }]}>
        {/* Header */}
        <View style={styles.userHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.userName, { color: theme.text }]}>
              {item.prenom} {item.nom}
            </Text>
            <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
              {item.email}
            </Text>
          </View>
          <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) }]}>
            <Text style={styles.roleText}>{item.role}</Text>
          </View>
        </View>

        {/* Détails */}
        <View style={styles.userDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={16} color={theme.textSecondary} />
            <Text style={[styles.detailText, { color: theme.text }]}>
              {item.numeroTelephone || 'N/A'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons 
              name={item.isActive ? "checkmark-circle" : "close-circle"} 
              size={16} 
              color={item.isActive ? Colors.accentGreen : Colors.dangerRed} 
            />
            <Text style={[styles.detailText, { color: theme.text }]}>
              {item.isActive ? 'Actif' : 'Inactif'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color={theme.textSecondary} />
            <Text style={[styles.detailText, { color: theme.text }]}>
              {new Date(item.createdAt).toLocaleDateString('fr-FR')}
            </Text>
          </View>
        </View>

        {/* Actions */}
        {criticalActions && (
          <View style={styles.actionsContainer}>
            {canActivate && (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: Colors.accentGreen }]}
                onPress={() => handleActivateUser(item)}
                disabled={actionLoading}
              >
                <Ionicons name="checkmark-circle" size={18} color="#fff" />
                <Text style={styles.actionBtnText}>Activer</Text>
              </TouchableOpacity>
            )}

            {canDeactivate && (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: Colors.accentYellow }]}
                onPress={() => handleDeactivateUser(item)}
                disabled={actionLoading}
              >
                <Ionicons name="pause-circle" size={18} color="#fff" />
                <Text style={styles.actionBtnText}>Désactiver</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: Colors.dangerRed }]}
              onPress={() => handleDeleteUser(item)}
              disabled={actionLoading}
            >
              <Ionicons name="trash" size={18} color="#fff" />
              <Text style={styles.actionBtnText}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        )}

        {!criticalActions && (
          <View style={[styles.infoBox, { backgroundColor: theme.background }]}>
            <Ionicons name="information-circle" size={16} color={Colors.primaryDark} />
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              Mode lecture seule - Utilisez "Actions Critiques" pour modifier
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {criticalActions ? ' Actions Critiques' : 'Gérer Utilisateurs'}
        </Text>
        <TouchableOpacity onPress={loadUsers}>
          <Ionicons name="refresh" size={26} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Barre de recherche */}
      <View style={[styles.searchContainer, { backgroundColor: theme.surface }]}>
        <Ionicons name="search" size={20} color={theme.placeholder} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Rechercher un utilisateur..."
          placeholderTextColor={theme.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={theme.placeholder} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filtres */}
      <View style={styles.filterContainer}>
        {['all', 'Administrateur', 'Tresorier', 'Membre'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterButton,
              { backgroundColor: theme.surface },
              filter === f && { backgroundColor: Colors.primaryDark }
            ]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterText,
                { color: theme.text },
                filter === f && { color: '#fff' }
              ]}
            >
              {f === 'all' ? 'Tous' : f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Liste */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primaryDark} />
          <Text style={{ color: theme.text, marginTop: 10 }}>Chargement...</Text>
        </View>
      ) : filteredUsers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={80} color={theme.placeholder} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            {searchQuery 
              ? 'Aucun utilisateur trouvé'
              : filter === 'all' 
                ? 'Aucun utilisateur disponible'
                : `Aucun ${filter} disponible`
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUser}
          keyExtractor={(item) => getUserId(item)}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginVertical: 15,
    borderRadius: 12,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 16 },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 15,
    gap: 10,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  filterText: { fontSize: 14, fontWeight: '600' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: { fontSize: 16, textAlign: 'center', marginTop: 20 },
  listContent: { padding: 20 },
  userCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  userName: { fontSize: 18, fontWeight: '700', marginBottom: 5 },
  userEmail: { fontSize: 14 },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleText: { fontSize: 12, color: '#fff', fontWeight: '600' },
  userDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
    gap: 15,
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  detailText: { fontSize: 13 },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  actionBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    gap: 8,
  },
  infoText: { fontSize: 12, flex: 1 },
});

export default ManageUsersScreen;