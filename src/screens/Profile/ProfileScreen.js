import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';

// Activer LayoutAnimation sur Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ProfileScreen = ({ navigation }) => {
  const [firstName] = useState('Adama');
  const [lastName] = useState('Sy');
  const [email] = useState('adama.sy@example.com');
  const [cni] = useState('123456789');
  const [phone] = useState('+221 77 000 00 00');

  

  
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

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarCircle}>
           <Text style={styles.avatarInitials}>
           {firstName.charAt(0).toUpperCase()}{lastName.charAt(0).toUpperCase()}
           </Text>
        </View>
        

        {/* Informations lecture seule */}
        {['Prénom', 'Nom', 'Email', 'CNI', 'Numéro de téléphone'].map((label, i) => {
          const valueMap = { 0: firstName, 1: lastName, 2: email, 3: cni, 4: phone };
          return (
            <View key={i}>
              <Text style={styles.label}>{label}</Text>
              <Text style={styles.readonlyInput}>{valueMap[i]}</Text>
            </View>
          );
        })}

        

      </ScrollView>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F6F6' },
  header: {
    backgroundColor: Colors.primaryDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  content: { padding: 20 },
  avatarContainer: { alignItems: 'center', marginVertical: 20 },
  avatarName: { fontSize: 22, fontWeight: '700', color: Colors.primaryDark, marginTop: 8 },
  label: { fontSize: 16, fontWeight: '600', color: '#333', marginTop: 20, marginBottom: 8 },
  readonlyInput: {
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#555',
  },
  changePasswordButton: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 30,
  },
  changePasswordText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  passwordForm: { marginTop: 20 },
  passwordWrapper: { flexDirection: 'row', alignItems: 'center' },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  eyeIcon: { paddingHorizontal: 10 },
  saveButton: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  avatarCircle: {
  width: 100,
  height: 100,
  borderRadius: 50,
  backgroundColor: Colors.primaryDark, // couleur de fond
  justifyContent: 'center',
  alignItems: 'center',
  marginLeft: 150,
},
avatarInitials: {
  color: '#fff',
  fontSize: 36,
  fontWeight: '700',
},

  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
