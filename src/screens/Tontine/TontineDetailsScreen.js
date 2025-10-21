// FILE: src/screens/Tontine/TontineDetailsScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';


export default function TontineDetailsScreen({ route }) {
const { id } = route.params || {};
return (
<View style={styles.container}>
<Text style={styles.title}>Détails de la tontine</Text>
<Text>ID: {id}</Text>


<View style={styles.section}>
<Text style={styles.sectionTitle}>Membres</Text>
<Text>Liste des membres (mock)</Text>
</View>


<View style={styles.section}>
<Text style={styles.sectionTitle}>Historique des transactions</Text>
<Text>Aucun paiement pour l'instant (mock)</Text>
</View>
</View>
);
}


const styles = StyleSheet.create({
container: { flex: 1, padding: 16 },
title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
section: { marginTop: 16 },
sectionTitle: { fontWeight: '700' },
});

TontineDetailsScreen.propTypes = {
	route: PropTypes.shape({ params: PropTypes.object }),
};