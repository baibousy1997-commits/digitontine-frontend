import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, Easing } from 'react-native';
import colors from '../constants/colors';

const SplashScreen = ({ onFinish }) => {
  // Animation pour le changement de couleur autour du logo (sans native driver)
  const colorAnimation = useRef(new Animated.Value(0)).current;
  // Animation pour l'opacité du logo (avec native driver)
  const logoOpacity = useRef(new Animated.Value(0)).current;
  // Animation pour l'échelle du logo (avec native driver)
  const logoScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Animation d'entrée du logo (avec native driver)
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Animation de changement de couleur en boucle (sans native driver)
    const colorLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(colorAnimation, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false, // Les couleurs ne peuvent pas utiliser native driver
        }),
        Animated.timing(colorAnimation, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    );
    colorLoop.start();

    // Fin du splash screen après 3 secondes
    const timer = setTimeout(() => {
      Animated.timing(logoOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        if (onFinish) onFinish();
      });
    }, 3000);

    return () => {
      colorLoop.stop();
      clearTimeout(timer);
    };
  }, []);

  // Interpolation des couleurs pour l'animation (sans native driver)
  const borderColor = colorAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [
      colors.primaryDark,    // Bleu foncé
      colors.primaryLight,    // Bleu clair
      colors.accentYellow,    // Jaune doré
    ],
  });

  return (
    <View style={styles.container}>
      {/* Container externe pour l'animation de couleur (sans native driver) */}
      <Animated.View
        style={[
          styles.borderContainer,
          {
            borderColor: borderColor,
          },
        ]}
      >
        {/* Container interne pour les animations avec native driver */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  borderContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logoContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  logo: {
    width: 120,
    height: 120,
  },
});

export default SplashScreen;

