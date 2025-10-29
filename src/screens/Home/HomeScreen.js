// src/screens/Home/HomeScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import PropTypes from 'prop-types';
import { useAuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import dashboardService from '../../services/dashboard/dashboardService';
import tontineService from '../../services/tontine/tontineService';
import authService from '../../services/auth/authService';
import Colors from '../../constants/colors';
import HomeStyles from '../../styles/HomeStyles';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuthContext();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [mesTontines, setMesTontines] = useState([]);
  const [userData, setUserData] = useState(null);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  //  NOUVELLE FONCTION : Normaliser le rôle pour toutes les comparaisons
  const normalizeRole = (role) => {
    if (!role) return 'membre';
    
    const roleMap = {
      'admin': 'admin',
      'Admin': 'admin',
      'ADMIN': 'admin',
      'administrateur': 'admin',
      'Administrateur': 'admin',
      'ADMINISTRATEUR': 'admin',
      'tresorier': 'tresorier',
      'Tresorier': 'tresorier',
      'TRESORIER': 'tresorier',
      'trésorier': 'tresorier',
      'Trésorier': 'tresorier',
      'membre': 'membre',
      'Membre': 'membre',
      'MEMBRE': 'membre',
    };
    
    return roleMap[role] || role.toLowerCase();
  };

  useEffect(() => {
  loadDashboard();
  loadUserProfile(); // 
}, []);

useFocusEffect(
  useCallback(() => {
    loadDashboard();
    loadUserProfile(); // 
  }, [])
);

 const loadDashboard = async () => {
  try {
    setLoading(true);
    const rawRole = user?.role || 'membre';
    const normalizedRole = normalizeRole(rawRole);
    
    console.log(' HOME - Rôle brut:', rawRole, '→ Normalisé:', normalizedRole);
    
    // 1. Charger le dashboard
    const dashResult = await dashboardService.getDashboardByRole(rawRole);
    if (dashResult.success) {
      console.log(' Dashboard chargé:', dashResult.data?.data);
      setDashboardData(dashResult.data?.data);
      
      // ✅ NOUVEAU : Récupérer les tontines du dashboard
      let tontinesList = [];
      if (normalizedRole === 'admin') {
        tontinesList = dashResult.data?.data?.tontines?.mesTontines || [];
      } else if (normalizedRole === 'tresorier') {
        tontinesList = dashResult.data?.data?.mesTontines || [];
      } else {
        tontinesList = dashResult.data?.data?.tontines || [];
      }
      
      console.log(' Tontines chargées:', tontinesList.length);
      setMesTontines(tontinesList);
    } else {
      console.error(' Erreur dashboard:', dashResult.error);
      setMesTontines([]);
    }
    
  } catch (error) {
    console.error(' Erreur chargement dashboard:', error);
  } finally {
    setLoading(false);
  }
};

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };
  const loadUserProfile = async () => {
  try {
    const result = await authService.getMe();
    if (result.success && result.data) {
      console.log(' User chargé dans HomeScreen:', result.data);
      setUserData(result.data);
    }
  } catch (error) {
    console.error(' Erreur chargement user:', error);
  }
};

  const rawRole = user?.role || 'membre';
  const userRole = normalizeRole(rawRole); //  Utiliser le rôle normalisé partout

  //  FONCTION CORRIGÉE : Récupérer les KPIs selon le rôle normalisé
  const getKPIs = () => {
    if (!dashboardData) {
      console.log(' Pas de dashboardData disponible');
      return null;
    }

    console.log(' getKPIs - Rôle normalisé:', userRole);
    console.log(' dashboardData:', JSON.stringify(dashboardData, null, 2));

    if (userRole === 'admin') {
      const kpis = {
        totalUtilisateurs: dashboardData.utilisateurs?.total || 0,
        utilisateursActifs: dashboardData.utilisateurs?.actifs || 0,
        totalTontines: dashboardData.tontines?.total || 0,
        tontinesActives: dashboardData.tontines?.actives || 0,
      };
      console.log(' KPIs Admin:', kpis);
      return kpis;
    }

    if (userRole === 'tresorier') {
      const kpis = {
        montantTotalCollecte: dashboardData.kpis?.montantTotalCollecte || 0,
        montantTotalDistribue: dashboardData.kpis?.montantTotalDistribue || 0,
        soldeDisponible: dashboardData.kpis?.soldeDisponible || 0,
        transactionsEnAttente: dashboardData.kpis?.transactionsEnAttente || 0,
      };
      console.log(' KPIs Trésorier:', kpis);
      return kpis;
    }

    const kpis = {
      tontinesActives: dashboardData.resume?.tontinesActives || 0,
      totalCotise: dashboardData.resume?.totalCotise || 0,
      totalGagne: dashboardData.resume?.totalGagne || 0,
      retards: dashboardData.resume?.retards || 0,
    };
    console.log(' KPIs Membre:', kpis);
    return kpis;
  };

  const kpis = getKPIs();

  if (loading && !dashboardData) {
    return (
      <SafeAreaView style={[HomeStyles.safeArea, { backgroundColor: theme.background }]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primaryDark} />
          <Text style={{ color: theme.text, marginTop: 10 }}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }
const userName = userData?.prenom || user?.prenom || 'Utilisateur';
  return (
    <SafeAreaView style={[HomeStyles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />
      <ScrollView
        contentContainerStyle={HomeStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={[HomeStyles.headerContainer, { backgroundColor: Colors.primaryDark }]}>
          <Text style={HomeStyles.welcomeText}>Bienvenue {userName},</Text>
          <TouchableOpacity
            style={HomeStyles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={HomeStyles.profileButtonText}>Voir mon profil</Text>
            <View style={HomeStyles.profileIcon}>
              <Ionicons name="person-outline" size={24} color={Colors.textDark} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Section Tontines */}
        <View style={HomeStyles.tontineSection}>
          <Text style={HomeStyles.tontineTitle}>
            {userRole === 'admin' ? 'Toutes les tontines' : 'Mes tontines'} ({mesTontines.length})
          </Text>
          <View style={HomeStyles.tontineList}>
            {mesTontines.length > 0 ? (
              mesTontines.slice(0, 3).map((tontine, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[HomeStyles.tontineCard, { backgroundColor: Colors.accentGreen }]}
                  onPress={() => navigation.navigate('TontineDetails', { 
                    tontineId: tontine._id || tontine.id 
                  })}
                >
                  <MaterialCommunityIcons name="hand-coin" size={24} color={Colors.textLight} />
                  <Text style={HomeStyles.tontineCardName} numberOfLines={1}>
                    {tontine.nom}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              [1, 2, 3].map((i) => (
                <TouchableOpacity 
                  key={i} 
                  style={HomeStyles.tontineCard}
                  onPress={() => {
                    if (userRole === 'admin') {
                      navigation.navigate('CreateTontine');
                    } else {
                      navigation.navigate('MyTontines');
                    }
                  }}
                >
                  <Ionicons name="add-circle-outline" size={30} color={Colors.textLight} />
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

        {/* En-tête Aperçu */}
        <View style={HomeStyles.overviewHeader}>
          <Text style={[HomeStyles.overviewTitle, { color: theme.text }]}>Aperçu</Text>
          <Text style={[HomeStyles.dateText, { color: theme.placeholder }]}>
            {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
          </Text>
        </View>

        {/*  ADMIN Dashboard Card */}
        {userRole === 'admin' && (
          <View style={HomeStyles.cardContainer}>
            <TouchableOpacity
              style={[HomeStyles.cotisationCard, { backgroundColor: Colors.primaryDark }]}
              onPress={() => navigation.navigate('DashboardAdmin')}
            >
              <View style={HomeStyles.cotisationLeft}>
                <Text style={HomeStyles.cotisationTitle}>Tableau de bord Admin</Text>
                <Text style={HomeStyles.cotisationSubtitle}>
                  {kpis?.totalUtilisateurs || 0} utilisateurs • {kpis?.tontinesActives || 0} tontines actives
                </Text>
              </View>
              <View style={HomeStyles.cotisationRight}>
                <MaterialCommunityIcons
                  name="view-dashboard"
                  size={60}
                  color="rgba(255,255,255,0.4)"
                  style={HomeStyles.cotisationIcon}
                />
                <View style={HomeStyles.detailsButton}>
                  <Text style={HomeStyles.detailsText}>Voir les détails</Text>
                  <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/*  TRESORIER Dashboard Card */}
        {userRole === 'tresorier' && (
          <View style={HomeStyles.cardContainer}>
            <TouchableOpacity
              style={[HomeStyles.cotisationCard, { backgroundColor: Colors.accentGreen }]}
              onPress={() => navigation.navigate('DashboardTresorier')}
            >
              <View style={HomeStyles.cotisationLeft}>
                <Text style={HomeStyles.cotisationTitle}>Tableau de bord Trésorier</Text>
                <Text style={HomeStyles.cotisationSubtitle}>
                  {kpis?.transactionsEnAttente || 0} transactions en attente
                </Text>
              </View>
              <View style={HomeStyles.cotisationRight}>
                <MaterialCommunityIcons
                  name="finance"
                  size={60}
                  color="rgba(255,255,255,0.4)"
                  style={HomeStyles.cotisationIcon}
                />
                <View style={HomeStyles.detailsButton}>
                  <Text style={HomeStyles.detailsText}>Voir les détails</Text>
                  <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/*  MEMBRE Dashboard Card */}
        {userRole === 'membre' && (
          <View style={HomeStyles.cardContainer}>
            <TouchableOpacity
              style={[HomeStyles.cotisationCard, { backgroundColor: Colors.primaryDark }]}
              onPress={() => navigation.navigate('DashboardMembre')}
            >
              <View style={HomeStyles.cotisationLeft}>
                <Text style={HomeStyles.cotisationTitle}>Ma cotisation</Text>
                <Text style={HomeStyles.cotisationSubtitle}>
                  {(kpis?.retards || 0) > 0 
                    ? kpis.retards + ' cotisation(s) en retard' 
                    : "Vous êtes à jour"}
                </Text>
              </View>
              <View style={HomeStyles.cotisationRight}>
                <MaterialCommunityIcons
                  name="finance"
                  size={60}
                  color="rgba(255,255,255,0.4)"
                  style={HomeStyles.cotisationIcon}
                />
                <View style={HomeStyles.detailsButton}>
                  <Text style={HomeStyles.detailsText}>Voir les détails</Text>
                  <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/*  Carte Créer des utilisateurs (Admin uniquement) */}
        {userRole === 'admin' && (
          <View style={HomeStyles.cardContainer}>
            <TouchableOpacity
              style={[HomeStyles.userCard, { backgroundColor: theme.surface }]}
              onPress={() => navigation.navigate('CreateUser')}
            >
              <View style={HomeStyles.userCardLeft}>
                <Text style={[HomeStyles.userCardTitle, { color: theme.text }]}>
                  Créer des utilisateurs
                </Text>
                <Text style={[HomeStyles.userCardSubtitle, { color: theme.placeholder }]}>
                  Ajouter facilement de nouveaux membres à votre tontine.
                </Text>
              </View>
              <View style={HomeStyles.userCardRight}>
                <MaterialCommunityIcons
                  name="account-plus-outline"
                  size={60}
                  color="rgba(0,0,0,0.2)"
                  style={HomeStyles.userCardIcon}
                />
                <View style={HomeStyles.detailsButton}>
                  <Text style={[HomeStyles.detailsTextDark, { color: theme.text }]}>Aller</Text>
                  <Ionicons name="chevron-forward" size={20} color={theme.text} />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={[HomeStyles.bottomNav, { backgroundColor: theme.bottomNavBackground }]}>
        <TouchableOpacity style={HomeStyles.navItem} onPress={() => navigation.navigate('Accueil')}>
          <Ionicons name="home" size={24} color={Colors.primaryDark} />
          <Text style={HomeStyles.navTextActive}>Accueil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={HomeStyles.navItem} onPress={() => navigation.navigate('Wallet')}>
          <Ionicons name="wallet-outline" size={24} color={theme.placeholder} />
          <Text style={[HomeStyles.navTextInactive, { color: theme.placeholder }]}>Wallet</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={HomeStyles.navCenterButton}
          onPress={() => navigation.navigate('ChooseTontineAction')}
        >
          <Ionicons name="add" size={40} color={Colors.textLight} />
        </TouchableOpacity>

        <TouchableOpacity
          style={HomeStyles.navItem}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications-outline" size={24} color={theme.placeholder} />
          <Text style={HomeStyles.notificationBadge}>0</Text>
          <Text style={[HomeStyles.navTextInactive, { color: theme.placeholder }]}>Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity style={HomeStyles.navItem} onPress={() => navigation.navigate('Account')}>
          <Ionicons name="person-outline" size={24} color={theme.placeholder} />
          <Text style={[HomeStyles.navTextInactive, { color: theme.placeholder }]}>Compte</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

HomeScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    setOptions: PropTypes.func.isRequired,
  }).isRequired,
};

export default HomeScreen;