import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import Colors from '../../constants/colors';
import HomeStyles from '../../styles/HomeStyles';

const { width } = Dimensions.get('window');

const TontineCard = () => (
  <View style={HomeStyles.tontineCard}>
    <Ionicons name="add-circle-outline" size={30} color={Colors.textLight} />
  </View>
);

const HomeScreen = ({ navigation }) => {
  const userName = 'Adama';
  const tontinesCount = 0;
  const hasContribution = false;

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  return (
    <SafeAreaView style={HomeStyles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />
      <ScrollView
        contentContainerStyle={HomeStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* --- 1. En-tête --- */}
        <View style={HomeStyles.headerContainer}>
          <Text style={HomeStyles.welcomeText}>Bienvenue {userName},</Text>
          <TouchableOpacity
            style={HomeStyles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={HomeStyles.profileButtonText}>Voir mon profil</Text>
            <View style={HomeStyles.profileIcon}>
              <Ionicons name="person-outline" size={24} color={Colors.textDark} />
            </View>
          </TouchableOpacity>
        </View>

        {/* --- 2. Mes Tontines --- */}
        <View style={HomeStyles.tontineSection}>
          <Text style={HomeStyles.tontineTitle}>Mes tontines ({tontinesCount})</Text>
          <View style={HomeStyles.tontineList}>
            <TontineCard />
            <TontineCard />
            <TontineCard />
          </View>
        </View>

        {/* --- 3. Aperçu --- */}
        <View style={HomeStyles.overviewHeader}>
          <Text style={HomeStyles.overviewTitle}>Aperçu</Text>
          <Text style={HomeStyles.dateText}>21 oct. 2025</Text>
        </View>

        {/* --- 4. Carte Cotisation --- */}
        <View style={HomeStyles.cardContainer}>
          <TouchableOpacity style={HomeStyles.cotisationCard}>
            <View style={HomeStyles.cotisationLeft}>
              <Text style={HomeStyles.cotisationTitle}>Verser ma prochaine cotisation</Text>
              <Text style={HomeStyles.cotisationSubtitle}>
                {hasContribution
                  ? 'Votre prochaine cotisation est due le 30/11/2025'
                  : "Actuellement, il n'y a aucune contribution à payer"}
              </Text>
            </View>
            <View style={HomeStyles.cotisationRight}>
              <MaterialCommunityIcons
                name="finance"
                size={60}
                color="rgba(255,255,255,0.4)"
                style={HomeStyles.cotisationIcon}
              />
              <View style={HomeStyles.detailsButton}>
                <Text style={HomeStyles.detailsText}>Voir les détails</Text>
                <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* --- 5. Nouvelle Carte : Créer des utilisateurs --- */}
<View style={HomeStyles.cardContainer}>
  <TouchableOpacity
    style={HomeStyles.userCard}
    onPress={() => navigation.navigate('CreateUser')}
  >
    <View style={HomeStyles.userCardLeft}>
      <Text style={HomeStyles.userCardTitle}>Créer des utilisateurs</Text>
      <Text style={HomeStyles.userCardSubtitle}>
        Ajouter facilement de nouveaux membres à votre tontine.
      </Text>
    </View>
    <View style={HomeStyles.userCardRight}>
      <MaterialCommunityIcons
        name="account-plus-outline"
        size={60}
        color="rgba(0,0,0,0.2)"
        style={HomeStyles.userCardIcon}
      />
      <View style={HomeStyles.detailsButton}>
        <Text style={HomeStyles.detailsTextDark}>Aller</Text>
        <Ionicons name="chevron-forward" size={20} color={Colors.textDark} />
      </View>
    </View>
  </TouchableOpacity>
</View>


        <View style={{ height: 40 }} />
      </ScrollView>

      {/* --- 6. Navigation inférieure --- */}
      <View style={HomeStyles.bottomNav}>
        <TouchableOpacity style={HomeStyles.navItem} onPress={() => navigation.navigate('Accueil')}>
          <Ionicons name="home" size={24} color={Colors.primaryDark} />
          <Text style={HomeStyles.navTextActive}>Accueil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={HomeStyles.navItem} onPress={() => alert('Aller au Wallet')}>
          <Ionicons name="wallet-outline" size={24} color={Colors.placeholder} />
          <Text style={HomeStyles.navTextInactive}>Wallet</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={HomeStyles.navCenterButton}
          onPress={() => navigation.navigate('ChooseTontineAction')}
        >
          <Ionicons name="add" size={40} color={Colors.textLight} />
        </TouchableOpacity>

        <TouchableOpacity
          style={HomeStyles.navItem}
          onPress={() => alert('Aller aux Notifications')}
        >
          <Ionicons name="notifications-outline" size={24} color={Colors.placeholder} />
          <Text style={HomeStyles.notificationBadge}>0</Text>
          <Text style={HomeStyles.navTextInactive}>Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity style={HomeStyles.navItem} onPress={() => navigation.navigate('Account')}>
          <Ionicons name="person-outline" size={24} color={Colors.placeholder} />
          <Text style={HomeStyles.navTextInactive}>Compte</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

HomeScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    setOptions: PropTypes.func.isRequired,
  }).isRequired,
};

export default HomeScreen;
