import React, { useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import Colors from '../../constants/colors';
import ChangePasswordStyles from '../../styles/ChangePasswordStyles';

const ChangePasswordScreen = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChangePassword = () => {
    // Logique de changement de mot de passe
    if (newPassword !== confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    if (newPassword.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    alert('Mot de passe changé avec succès');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={ChangePasswordStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      
      {/* Header */}
      <View style={ChangePasswordStyles.header}>
        <TouchableOpacity 
          style={ChangePasswordStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textDark} />
          <Text style={ChangePasswordStyles.backText}>Retour</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={ChangePasswordStyles.menuButton}>
          <Ionicons name="menu" size={28} color={Colors.textDark} />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <View style={ChangePasswordStyles.titleContainer}>
        <Text style={ChangePasswordStyles.title}>Paramètres</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={ChangePasswordStyles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={ChangePasswordStyles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Card Container */}
          <View style={ChangePasswordStyles.cardContainer}>
            <Text style={ChangePasswordStyles.cardTitle}>
              Changer mon mot de passe
            </Text>

            {/* Mot de passe actuel */}
            <View style={ChangePasswordStyles.inputGroup}>
              <Text style={ChangePasswordStyles.label}>Mot de passe actuel</Text>
              <View style={ChangePasswordStyles.inputContainer}>
                <TextInput
                  style={ChangePasswordStyles.input}
                  placeholder="Mot de passe actuel"
                  placeholderTextColor="#B0B0B0"
                  secureTextEntry={!showCurrentPassword}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                />
                <TouchableOpacity
                  style={ChangePasswordStyles.eyeIcon}
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  <Ionicons
                    name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={24}
                    color="#B0B0B0"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Nouveau mot de passe */}
            <View style={ChangePasswordStyles.inputGroup}>
              <Text style={ChangePasswordStyles.label}>Nouveau mot de passe</Text>
              <View style={ChangePasswordStyles.inputContainer}>
                <TextInput
                  style={ChangePasswordStyles.input}
                  placeholder="Nouveau mot de passe"
                  placeholderTextColor="#B0B0B0"
                  secureTextEntry={!showNewPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TouchableOpacity
                  style={ChangePasswordStyles.eyeIcon}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  <Ionicons
                    name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={24}
                    color="#B0B0B0"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirmation du nouveau mot de passe */}
            <View style={ChangePasswordStyles.inputGroup}>
              <Text style={ChangePasswordStyles.label}>
                Confirmation du nouveau mot de passe
              </Text>
              <View style={ChangePasswordStyles.inputContainer}>
                <TextInput
                  style={ChangePasswordStyles.input}
                  placeholder="Confirmation du nouveau mot de passe"
                  placeholderTextColor="#B0B0B0"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity
                  style={ChangePasswordStyles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={24}
                    color="#B0B0B0"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Button */}
            <TouchableOpacity
              style={ChangePasswordStyles.button}
              onPress={handleChangePassword}
            >
              <Text style={ChangePasswordStyles.buttonText}>
                Changer mon mot de passe
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

ChangePasswordScreen.propTypes = {
  navigation: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
  }).isRequired,
};

export default ChangePasswordScreen;