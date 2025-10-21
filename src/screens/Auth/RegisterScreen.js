// FILE: src/screens/Auth/RegisterScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';


export default function RegisterScreen({ navigation }) {
const [name, setName] = useState('');
const [phone, setPhone] = useState('');
const [password, setPassword] = useState('');


const handleRegister = async () => {
Alert.alert('Info', 'Mock register — connecter le backend pour créer un utilisateur');
};


return (
<View style={styles.container}>
<Text style={styles.title}>Créer un compte</Text>
<TextInput placeholder="Nom complet" style={styles.input} value={name} onChangeText={setName} />
<TextInput placeholder="Téléphone" style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
<TextInput placeholder="Mot de passe" style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />
<TouchableOpacity style={styles.button} onPress={handleRegister}>
<Text style={styles.buttonText}>S'inscrire</Text>
</TouchableOpacity>
</View>
);
}


const styles = StyleSheet.create({
container: { flex: 1, justifyContent: 'center', padding: 20 },
title: { fontSize: 22, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 12 },
button: { backgroundColor: '#2b6cb0', padding: 14, borderRadius: 8, alignItems: 'center' },
buttonText: { color: '#fff', fontWeight: '600' },
});