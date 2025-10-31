import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // --- HEADER ---
  header: {
    backgroundColor: '#4A9B8E',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 8,
    fontWeight: '400',
  },
  menuButton: {
    padding: 5,
  },

  // --- CONTENU ---
  content: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    marginBottom: 25,
  },

  // --- INPUTS GÉNÉRAUX ---
  input: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 18,
    fontSize: 16,
    color: '#333',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  descriptionInput: {
    height: 100,
    paddingTop: 15,
  },

  // --- TITRES DE SECTIONS ---
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 15,
  },

  // --- DATES ---
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  dateButton: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  dateButtonWide: {
    flex: 1.5,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  dateInfo: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 25,
  },
  highlight: {
    color: '#FF8C42',
    fontWeight: '600',
  },

  // --- LISTES DÉROULANTES (nouveau) ---
  dropdownList: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    marginBottom: 15,
    maxHeight: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    fontSize: 16,
    color: '#333',
  },
helperText: {
  fontSize: 13,
  color: '#666',
  marginTop: -15,
  marginBottom: 15,
  fontStyle: 'italic',
},
  // --- DURÉE ---
  durationInfo: {
    fontSize: 14,
    color: '#FF8C42',
    marginBottom: 15,
    fontWeight: '500',
  },
  dropdownButton: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  dropdownText: {
    fontSize: 16,
    color: '#999',
  },

  // --- FRÉQUENCE ---
  frequencyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    gap: 10,
  },
  frequencyButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  frequencyButtonActive: {
    backgroundColor: '#4A9B8E',
    borderColor: '#4A9B8E',
  },
  frequencyText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  frequencyTextActive: {
    color: '#fff',
  },

  // --- MONTANT ---
  amountInfo: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },

  // --- BOUTON SUIVANT ---
  nextButton: {
    backgroundColor: '#C8E6DC',
    borderRadius: 25,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
});

export default styles;
