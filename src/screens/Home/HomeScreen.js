import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform, Dimensions, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import Colors from '../../constants/colors';

// Dimensions pour le style réactif
const { width } = Dimensions.get('window');

// Composant pour simuler les cartes de tontine vides (réutilisable)
const TontineCard = () => (
  <View style={styles.tontineCard}>
    <Ionicons name="add-circle-outline" size={30} color={Colors.textLight} />
  </View>
);

const HomeScreen = ({ navigation }) => {
  const userName = "Adama";
  const tontinesCount = 0;
  const onboardingProgress = 36; // Donnée fictive
  const hasContribution = false; // Donnée fictive
  
  // Masque l'en-tête de la navigation par défaut
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* --- 1. En-tête / Profil (Partie supérieure bleu foncé) --- */}
        <View style={styles.headerContainer}>
          <Text style={styles.welcomeText}>Bienvenue {userName},</Text>
          <TouchableOpacity style={styles.profileButton}>
            <Text style={styles.profileButtonText}>Voir mon profil</Text>
            {/* Icône de profil */}
            <View style={styles.profileIcon}>
              <Ionicons name="person-outline" size={24} color={Colors.textDark} />
            </View>
          </TouchableOpacity>
        </View>

        {/* --- 2. Section Mes Tontines (Carte principale flottante) --- */}
        <View style={styles.tontineSection}>
          <Text style={styles.tontineTitle}>Mes tontines ({tontinesCount})</Text>
          <View style={styles.tontineList}>
            <TontineCard />
            <TontineCard />
            <TontineCard />
          </View>
        </View>

        {/* --- 3. Section Aperçu et Date --- */}
        <View style={styles.overviewHeader}>
          <Text style={styles.overviewTitle}>Aperçu</Text>
          <Text style={styles.dateText}>21 oct. 2025</Text>
        </View>

        {/* --- 4. Carte Onboarding (Rouge) --- */}
        <View style={styles.cardContainer}>
          <TouchableOpacity style={styles.onboardingCard}>
            <View style={styles.onboardingTop}>
                <Text style={styles.onboardingSubtitle}>Finissez votre onboarding pour gagner 5€ <Ionicons name="information-circle-outline" size={14} color={Colors.textLight} /></Text>
                <Ionicons name="alert-circle" size={30} color={Colors.textLight} />
            </View>
            <Text style={styles.onboardingTitle}>Finaliser l'onboarding</Text>
            
            <View style={styles.progressRow}>
              <View style={styles.progressBlock}>
                <Text style={styles.progressPercent}>{onboardingProgress}% terminé</Text>
                <View style={styles.progressBarBackground}>
                  <View style={[styles.progressBarFill, { width: `${onboardingProgress}%` }]} />
                </View>
              </View>
              <View style={styles.continueButton}>
                <Text style={styles.progressAction}>Continuer</Text>
                <Ionicons name="chevron-forward" size={24} color={Colors.textLight} />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* --- 5. Carte Cotisation (Vert foncé) --- */}
        <View style={styles.cardContainer}>
          <TouchableOpacity style={styles.cotisationCard}>
            <View style={styles.cotisationLeft}>
              <Text style={styles.cotisationTitle}>Verser ma prochaine cotisation</Text>
              <Text style={styles.cotisationSubtitle}>
                {hasContribution 
                  ? "Votre prochaine cotisation est due le 30/11/2025"
                  : "Actuellement, il n'y a aucune contribution à payer"
                }
              </Text>
            </View>
            <View style={styles.cotisationRight}>
              <MaterialCommunityIcons name="finance" size={60} color="rgba(255,255,255,0.4)" style={styles.cotisationIcon} />
              <View style={styles.detailsButton}>
                <Text style={styles.detailsText}>Voir les détails</Text>
                <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
              </View>
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Espace vide */}
        <View style={{ height: 40 }} />

      </ScrollView>
      
      {/* --- 6. Barre de navigation inférieure (Simulée) --- */}
      {/* La barre est stylisée pour refléter le design de l'image */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Accueil')}>
          <Ionicons name="home" size={24} color={Colors.primaryDark} />
          <Text style={styles.navTextActive}>Accueil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => alert('Aller au Wallet')}>
          <Ionicons name="wallet-outline" size={24} color={Colors.placeholder} />
          <Text style={styles.navTextInactive}>Wallet</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navCenterButton} onPress={() => alert('Créer une nouvelle Tontine')}>
          <Ionicons name="add" size={40} color={Colors.textLight} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => alert('Aller aux Notifications')}>
          <Ionicons name="notifications-outline" size={24} color={Colors.placeholder} />
          <Text style={styles.notificationBadge}>0</Text>
          <Text style={styles.navTextInactive}>Notifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => alert('Aller au Contact')}>
          <Ionicons name="call-outline" size={24} color={Colors.placeholder} />
          <Text style={styles.navTextInactive}>Contact</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  scrollContainer: {
    paddingBottom: 100, // Espace pour la barre de navigation inférieure
  },
  
  // --- En-tête ---
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: Colors.primaryDark, 
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 30 : 0,
    paddingBottom: 140, // Espace pour la carte tontine flottante
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.textLight,
    marginTop: 10,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 5,
    marginTop: 10,
  },
  profileButtonText: {
    color: Colors.textLight,
    fontSize: 14,
    marginRight: 8,
  },
  profileIcon: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: Colors.textLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // --- Section Mes Tontines (Carte flottante) ---
  tontineSection: {
    position: 'absolute',
    top: 100, // Positionnement pour chevaucher l'en-tête
    width: width - 40,
    alignSelf: 'center',
    padding: 20,
    backgroundColor: Colors.primaryLight, 
    borderRadius: 15,
    zIndex: 10,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5 },
      android: { elevation: 8 },
    }),
  },
  tontineTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textLight,
    marginBottom: 15,
  },
  tontineList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tontineCard: {
    width: (width - 100) / 3, // Calcule la largeur pour trois cartes + espace
    height: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // --- Aperçu ---
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 120, // Espace après la carte tontine flottante
    marginBottom: 15,
  },
  overviewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  dateText: {
    fontSize: 14,
    color: Colors.placeholder,
  },

  // --- Cartes Aperçu ---
  cardContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  
  // Carte Onboarding (Rouge)
  onboardingCard: {
    backgroundColor: Colors.danger, 
    borderRadius: 15,
    padding: 20,
    paddingBottom: 15,
  },
  onboardingTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  onboardingSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '500',
    flexShrink: 1, // Pour que le texte s'ajuste
  },
  onboardingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textLight,
    marginBottom: 15,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressBlock: {
    flex: 1,
    marginRight: 10,
  },
  progressPercent: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 5,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.textLight,
    borderRadius: 3,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressAction: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '600',
    marginRight: 5,
  },

  // Carte Cotisation (Vert foncé)
  cotisationCard: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    overflow: 'hidden', // Cache l'icône qui dépasse
  },
  cotisationLeft: {
    flex: 0.65,
    justifyContent: 'center',
  },
  cotisationRight: {
    flex: 0.35,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  cotisationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textLight,
    marginBottom: 5,
  },
  cotisationSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  cotisationIcon: {
    position: 'absolute',
    top: -10,
    right: -10,
    opacity: 0.5,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
  },
  detailsText: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '600',
  },
  
  // --- Barre de navigation inférieure (Simulée) ---
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: Colors.textLight,
    paddingVertical: Platform.OS === 'ios' ? 10 : 5,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    height: Platform.OS === 'ios' ? 90 : 70, // Espace pour la zone sûre sur iOS
  },
  navItem: {
    alignItems: 'center',
    paddingHorizontal: 5,
    position: 'relative',
    height: '100%',
    justifyContent: 'center',
  },
  navTextActive: {
    fontSize: 12,
    color: Colors.primaryDark,
    marginTop: 2,
    fontWeight: 'bold',
  },
  navTextInactive: {
    fontSize: 12,
    color: Colors.placeholder,
    marginTop: 2,
  },
  navCenterButton: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: Colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    // Positionnement pour flotter légèrement
    ...Platform.select({
        ios: { marginBottom: 35 },
        android: { marginBottom: 20 },
    }), 
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5 },
      android: { elevation: 12 },
    }),
  },
  notificationBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: Colors.accentYellow,
    color: Colors.textDark,
    borderRadius: 10,
    paddingHorizontal: 5,
    fontSize: 10,
    fontWeight: 'bold',
    zIndex: 1,
  }
});

HomeScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    setOptions: PropTypes.func.isRequired,
  }).isRequired,
};

export default HomeScreen;
