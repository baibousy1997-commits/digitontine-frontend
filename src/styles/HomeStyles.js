import { StyleSheet, Platform, Dimensions } from 'react-native';
import Colors from '../constants/Colors';

const { width } = Dimensions.get('window');

const HomeStyles = StyleSheet.create({
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

export default HomeStyles;
