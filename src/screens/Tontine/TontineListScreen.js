// FILE: src/screens/Tontine/TontineListScreen.js
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';


const MOCK = [
{ id: '1', name: 'Tontine Marché', members: 8, next: '2025-11-01' },
{ id: '2', name: 'Tontine Famille', members: 6, next: '2025-10-25' },
];


export default function TontineListScreen({ navigation }) {
return (
<View style={styles.container}>
<TouchableOpacity style={styles.create} onPress={() => navigation.navigate('CreateTontine')}>
<Text style={{ color: '#fff' }}>Créer une tontine</Text>
</TouchableOpacity>


<FlatList data={MOCK} keyExtractor={(i) => i.id} renderItem={({ item }) => (
<TouchableOpacity style={styles.item} onPress={() => navigation.navigate('TontineDetails', { id: item.id })}>
<Text style={styles.name}>{item.name}</Text>
<Text style={styles.meta}>{item.members} membres • prochain tour: {item.next}</Text>
</TouchableOpacity>
)} />
</View>
);
}


const styles = StyleSheet.create({
container: { flex: 1, padding: 16 },
create: { backgroundColor: '#2b6cb0', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
item: { padding: 12, borderRadius: 8, backgroundColor: '#fff', marginBottom: 8, borderWidth: 1, borderColor: '#eee' },
name: { fontSize: 16, fontWeight: '600' },
meta: { marginTop: 6, color: '#666' },
});

TontineListScreen.propTypes = {
	navigation: PropTypes.shape({ navigate: PropTypes.func.isRequired }).isRequired,
};