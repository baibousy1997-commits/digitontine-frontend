import { StyleSheet } from 'react-native';
import Colors from '../constants/colors';

export default StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primaryDark,
    textAlign: 'center',
    marginBottom: 20,
  },
  imagePicker: {
    alignItems: 'center',
    marginBottom: 25,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  imageText: {
    color: Colors.placeholder,
    fontSize: 14,
  },
  label: {
    fontSize: 16,
    color: Colors.primaryDark,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 15,
    backgroundColor: '#fafafa',
  },
  // Nouveau style pour le sélecteur de rôle
  roleSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#fafafa',
  },
  roleSelectorText: {
    fontSize: 15,
    color: Colors.primaryDark,
  },
  // Styles pour le modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primaryDark,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#fafafa',
  },
  modalOptionSelected: {
    backgroundColor: '#e8f4fd',
    borderColor: Colors.primary,
  },
  modalOptionText: {
    fontSize: 16,
    color: Colors.primaryDark,
  },
  modalOptionTextSelected: {
    fontWeight: '600',
    color: Colors.primary,
  },
  modalCancelButton: {
    marginTop: 10,
    padding: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    color: Colors.primaryDark,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitText: {
    color: '#380bebff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
  backgroundColor: Colors.accentGreen,
  paddingVertical: 16,
  paddingHorizontal: 20,
  borderRadius: 12,
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 10,
  marginBottom: 20,
  flexDirection: 'row',
  shadowColor: Colors.primary,
  shadowOffset: {
    width: 0,
    height: 4,
  },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 6, // Pour Android
},
submitText: {
  color: '#0b11baff',
  fontSize: 17,
  fontWeight: '700',
  letterSpacing: 0.5,
},
});