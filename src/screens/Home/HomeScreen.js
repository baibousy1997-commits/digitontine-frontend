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
import Colors from '../../constants/colors';
import HomeStyles from '../../styles/HomeStyles';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuthContext();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [mesTontines, setMesTontines] = useState([]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    loadDashboard();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [])
  );

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const role = user?.role || 'Membre';
      
      console.log('HOME - Role:', role);
      
      // 1. Charger le dashboard
      const dashResult = await dashboardService.getDashboardByRole(role);
      if (dashResult.success) {
        setDashboardData(dashResult.data?.data);
      }

      // 2. Charger les tontines selon le role
      if (role === 'Admin' || role === 'Administrateur') {
        console.log('ADMIN - Chargement de TOUTES les tontines...');
        const tontinesResult = await tontineService.listTontines({ limit: 100 });
        
        if (tontinesResult.success) {
          let tontinesList = [];
          
          if (Array.isArray(tontinesResult.data?.data?.data)) {
            tontinesList = tontinesResult.data.data.data;
          } else if (Array.isArray(tontinesResult.data?.data)) {
            tontinesList = tontinesResult.data.data;
          } else if (Array.isArray(tontinesResult.data)) {
            tontinesList = tontinesResult.data;
          }
          
          console.log('Admin tontines chargees:', tontinesList.length);
          setMesTontines(tontinesList);
        } else {
          console.error('Erreur:', tontinesResult.error);
          setMesTontines([]);
        }
      } else {
        console.log('MEMBRE - Chargement de MES tontines...');
        const tontinesResult = await tontineService.mesTontines();
        
        if (tontinesResult.success) {
          const tontinesList = tontinesResult.data?.data?.tontines || [];
          console.log('Mes tontines chargees:', tontinesList.length);
          setMesTontines(tontinesList);
        } else {
          console.error('Erreur:', tontinesResult.error);
          setMesTontines([]);
        }
      }
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  const userName = user?.prenom || 'Utilisateur';
  const userRole = user?.role || 'Membre';

  const getKPIs = () => {
    if (!dashboardData) return null;

    if (userRole === 'Admin' || userRole === 'Administrateur') {
      return {
        totalUtilisateurs: dashboardData.utilisateurs?.total || 0,
        utilisateursActifs: dashboardData.utilisateurs?.actifs || 0,
        totalTontines: dashboardData.tontines?.total || 0,
        tontinesActives: dashboardData.tontines?.actives || 0,
      };
    }

    if (userRole === 'Tresorier') {
      return {
        montantTotalCollecte: dashboardData.kpis?.montantTotalCollecte || 0,
        montantTotalDistribue: dashboardData.kpis?.montantTotalDistribue || 0,
        soldeDisponible: dashboardData.kpis?.soldeDisponible || 0,
        transactionsEnAttente: dashboardData.kpis?.transactionsEnAttente || 0,
      };
    }

    return {
      tontinesActives: dashboardData.resume?.tontinesActives || 0,
      totalCotise: dashboardData.resume?.totalCotise || 0,
      totalGagne: dashboardData.resume?.totalGagne || 0,
      retards: dashboardData.resume?.retards || 0,
    };
  };

  const kpis = getKPIs();

  if (loading && !dashboardData) {
    return (
      <SafeAreaView style={[HomeStyles.safeArea, { backgroundColor: theme.background }]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.primaryDark} />
          <Text style={{ color: theme.text, marginTop: 10 }}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[HomeStyles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.headerBackground} />
      <ScrollView
        contentContainerStyle={HomeStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={[HomeStyles.headerContainer, { backgroundColor: theme.headerBackground }]}>
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

        <View style={HomeStyles.tontineSection}>
          <Text style={HomeStyles.tontineTitle}>
            {userRole === 'Admin' || userRole === 'Administrateur' ? 'Toutes les tontines' : 'Mes tontines'} ({mesTontines.length})
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
                    if (userRole === 'Admin' || userRole === 'Administrateur') {
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

        <View style={HomeStyles.overviewHeader}>
          <Text style={[HomeStyles.overviewTitle, { color: theme.text }]}>Apercu</Text>
          <Text style={[HomeStyles.dateText, { color: theme.placeholder }]}>
            {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
          </Text>
        </View>

        {(userRole === 'Admin' || userRole === 'Administrateur') && (
          <View style={HomeStyles.cardContainer}>
            <TouchableOpacity
              style={[HomeStyles.cotisationCard, { backgroundColor: theme.primaryDark }]}
              onPress={() => navigation.navigate('DashboardAdmin')}
            >
              <View style={HomeStyles.cotisationLeft}>
                <Text style={HomeStyles.cotisationTitle}>Tableau de bord Admin</Text>
                <Text style={HomeStyles.cotisationSubtitle}>
                  {kpis?.totalUtilisateurs || 0} utilisateurs - {kpis?.tontinesActives || 0} tontines actives
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
                  <Text style={HomeStyles.detailsText}>Voir les details</Text>
                  <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {userRole === 'Tresorier' && (
          <View style={HomeStyles.cardContainer}>
            <TouchableOpacity
              style={[HomeStyles.cotisationCard, { backgroundColor: Colors.accentGreen }]}
              onPress={() => navigation.navigate('DashboardTresorier')}
            >
              <View style={HomeStyles.cotisationLeft}>
                <Text style={HomeStyles.cotisationTitle}>Tableau de bord Tresorier</Text>
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
                  <Text style={HomeStyles.detailsText}>Voir les details</Text>
                  <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {userRole === 'Membre' && (
          <View style={HomeStyles.cardContainer}>
            <TouchableOpacity
              style={[HomeStyles.cotisationCard, { backgroundColor: theme.primaryDark }]}
              onPress={() => navigation.navigate('DashboardMembre')}
            >
              <View style={HomeStyles.cotisationLeft}>
                <Text style={HomeStyles.cotisationTitle}>Ma cotisation</Text>
                <Text style={HomeStyles.cotisationSubtitle}>
                  {(kpis?.retards || 0) > 0 
                    ? kpis.retards + ' cotisation(s) en retard' 
                    : "Vous etes a jour"}
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
                  <Text style={HomeStyles.detailsText}>Voir les details</Text>
                  <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {(userRole === 'Admin' || userRole === 'Administrateur') && (
          <View style={HomeStyles.cardContainer}>
            <TouchableOpacity
              style={[HomeStyles.userCard, { backgroundColor: theme.surface }]}
              onPress={() => navigation.navigate('CreateUser')}
            >
              <View style={HomeStyles.userCardLeft}>
                <Text style={[HomeStyles.userCardTitle, { color: theme.text }]}>
                  Creer des utilisateurs
                </Text>
                <Text style={[HomeStyles.userCardSubtitle, { color: theme.placeholder }]}>
                  Ajouter facilement de nouveaux membres a votre tontine.
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