// FILE: src/screens/Tontine/CreateTontineScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';


export default function CreateTontineScreen({ navigation }) {
const [name, setName] = useState('');
const [amount, setAmount] = useState('');
const [frequency, setFrequency] = useState('mensuel');


const handleCreate = () => {
// TODO: call backend to create
Alert.alert('Créé', `Tontine ${name} créée (mock)`);
navigation.goBack();
};


return (
<View style={styles.container}>
<Text style={styles.label}>Nom de la tontine</Text>
<TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Ex: Tontine Marché" />


<Text style={styles.label}>Montant par membre (FCFA)</Text>
<TextInput style={styles.input} value={amount} onChangeText={setAmount} keyboardType="numeric" />


<Text style={styles.label}>Fréquence</Text>
<TextInput style={styles.input} value={frequency} onChangeText={setFrequency} />


<TouchableOpacity style={styles.button} onPress={handleCreate}>
<Text style={styles.buttonText}>Créer</Text>
</TouchableOpacity>
</View>
);
}


const styles = StyleSheet.create({
container: { flex: 1, padding: 16 },
label: { marginTop: 12, marginBottom: 6, fontWeight: '600' },
input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8 },
button: { backgroundColor: '#2b6cb0', padding: 14, borderRadius: 8, marginTop: 20, alignItems: 'center' },
buttonText: { color: '#fff', fontWeight: '600' },
});