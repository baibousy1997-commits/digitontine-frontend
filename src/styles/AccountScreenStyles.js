import { StyleSheet } from 'react-native';
import Colors from '../constants/colors';

const AccountStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: Colors.textLight,
    fontSize: 18,
    marginLeft: 8,
    fontWeight: '500',
  },
  menuButton: {
    padding: 5,
  },
  profileSection: {
    paddingBottom: 30,
    alignItems: 'center',
    marginTop: -20,
  },
  avatarContainer: {
    marginTop: 20,
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    overflow: 'hidden',
  },
  // Nouveau : Style pour avatar avec initiales
  avatarWithInitials: {
    backgroundColor: Colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Nouveau : Style pour les initiales
  avatarInitials: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '700',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginTop: 10,
  },
  userRole: {
    fontSize: 16,
    color: Colors.textSecondary || '#666',
    marginTop: 5,
    fontWeight: '500',
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuText: {
    fontSize: 16,
    color: Colors.textDark,
    fontWeight: '500',
    flex: 1,
  },
  // Nouveau : Style pour le bouton deconnexion
  logoutItem: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
});

export default AccountStyles;