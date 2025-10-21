import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import globalStyles from '../../styles/globalStyles';
import formStyles from '../../styles/formStyles';
import ButtonPrimary from '../../components/ButtonPrimary';
import PropTypes from 'prop-types';

export default function ForgotPasswordScreen({ navigation }) {
	const [phone, setPhone] = useState('');

	const handleSend = () => {
		if (!phone) {
			Alert.alert('Erreur', 'Veuillez saisir votre numéro de téléphone.');
			return;
		}
		// Ici on pourrait appeler un service d'oubli de mot de passe
		Alert.alert('Succès', "Instructions envoyées si le numéro existe.");
		navigation.goBack();
	};

	return (
		<View style={[globalStyles.container, styles.container]}>
			<Text style={globalStyles.title}>Mot de passe oublié</Text>
			<Text style={globalStyles.subtitle}>Entrez votre numéro pour recevoir les instructions.</Text>

			<TextInput
				value={phone}
				onChangeText={setPhone}
				placeholder="Téléphone"
				keyboardType="phone-pad"
				style={formStyles.input}
			/>

			<ButtonPrimary onPress={handleSend}>Envoyer</ButtonPrimary>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { justifyContent: 'center' },
});

ForgotPasswordScreen.propTypes = {
	navigation: PropTypes.shape({ goBack: PropTypes.func.isRequired }).isRequired,
};
