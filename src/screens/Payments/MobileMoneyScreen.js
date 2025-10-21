import React, { useState } from 'react';


const WavePaymentScreen = () => {
const [amount, setAmount] = useState('');
const [phoneNumber, setPhoneNumber] = useState('');


const handlePayment = async () => {
if (!amount || !phoneNumber) {
Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
return;
}


const result = await processWavePayment({ amount, phoneNumber });
if (result.success) {
Alert.alert('Succès', 'Paiement Wave effectué avec succès.');
setAmount('');
setPhoneNumber('');
} else {
Alert.alert('Erreur', result.message || 'Échec du paiement.');
}
};


return (
<View style={styles.container}>
<Text style={styles.title}>Paiement via Wave</Text>
<TextInput
style={styles.input}
placeholder="Numéro Wave (ex: 77XXXXXXX)"
keyboardType="phone-pad"
value={phoneNumber}
onChangeText={setPhoneNumber}
/>
<TextInput
style={styles.input}
placeholder="Montant à payer (FCFA)"
keyboardType="numeric"
value={amount}
onChangeText={setAmount}
/>
<ButtonPrimary title="Payer" onPress={handlePayment} />
</View>
);
};


const styles = StyleSheet.create({
container: { flex: 1, padding: 20, backgroundColor: '#fff' },
title: { fontSize: 22, fontWeight: 'bold', color: '#004aad', marginBottom: 20 },
input: {
borderWidth: 1,
borderColor: '#ccc',
borderRadius: 10,
padding: 12,
marginBottom: 15,
fontSize: 16,
},
});


export default WavePaymentScreen;