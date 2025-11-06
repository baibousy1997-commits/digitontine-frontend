// src/components/TirageWheelAnimation.js
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';

const { width } = Dimensions.get('window');
const WHEEL_SIZE = width * 0.7;
const SEGMENT_ANGLE = 360 / 8; // 8 segments pour l'animation

const TirageWheelAnimation = ({ 
  participants = [], 
  onAnimationComplete,
  winnerName = null,
  visible = false 
}) => {
  const rotation = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const spinCount = useRef(0);

  useEffect(() => {
    if (visible && participants.length > 0) {
      startAnimation();
    }
  }, [visible, participants]);

  const startAnimation = () => {
    // Réinitialiser les valeurs
    rotation.setValue(0);
    scale.setValue(0.8);
    opacity.setValue(0);

    // Animation d'entrée
    Animated.parallel([
      Animated.spring(opacity, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
    ]).start();

    // Animation de rotation (roue qui tourne)
    const randomSpins = 5 + Math.random() * 3; // 5-8 tours
    const randomAngle = Math.random() * 360; // Angle final aléatoire

    spinCount.current = 0;
    const totalRotation = randomSpins * 360 + randomAngle;

    rotation.setValue(0);
    
    Animated.timing(rotation, {
      toValue: totalRotation,
      duration: 3000 + Math.random() * 1000, // 3-4 secondes
      useNativeDriver: true,
      easing: (t) => {
        // Easing personnalisé : rapide au début, ralentit à la fin
        return t * (2 - t);
      },
    }).start(() => {
      // Animation terminée
      setTimeout(() => {
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }, 500);
    });

    // Animation de pulsation pendant la rotation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.05,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    // Arrêter la pulsation après la rotation
    setTimeout(() => {
      pulseAnimation.stop();
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    }, 3000);
  };

  const spin = rotation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  if (!visible) return null;

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.container,
          {
            opacity,
            transform: [{ scale }],
          },
        ]}
      >
        <View style={styles.header}>
          <Ionicons name="trophy" size={32} color={Colors.accentGreen} />
          <Text style={styles.title}>Tirage au sort en cours...</Text>
          <Text style={styles.subtitle}>La roue tourne pour déterminer le gagnant</Text>
        </View>

        <View style={styles.wheelContainer}>
          <Animated.View
            style={[
              styles.wheel,
              {
                transform: [{ rotate: spin }],
              },
            ]}
          >
            {/* Segments de la roue */}
            {Array.from({ length: 8 }).map((_, index) => {
              const segmentRotation = index * SEGMENT_ANGLE;
              const isEven = index % 2 === 0;
              return (
                <View
                  key={index}
                  style={[
                    styles.segment,
                    {
                      transform: [
                        { rotate: `${segmentRotation}deg` },
                        { translateX: WHEEL_SIZE / 2 },
                      ],
                      backgroundColor: isEven ? Colors.primaryDark : Colors.primaryLight,
                    },
                  ]}
                />
              );
            })}

            {/* Centre de la roue */}
            <View style={styles.centerCircle}>
              <Ionicons name="star" size={40} color="#FFD700" />
            </View>
          </Animated.View>

          {/* Flèche indicateur */}
          <View style={styles.pointer}>
            <Ionicons name="triangle" size={30} color={Colors.accentGreen} />
          </View>
        </View>

        {/* Participants listés */}
        {participants.length > 0 && (
          <View style={styles.participantsContainer}>
            <Text style={styles.participantsTitle}>
              {participants.length} participant(s) éligible(s)
            </Text>
            <View style={styles.participantsList}>
              {participants.slice(0, 5).map((participant, index) => (
                <View key={index} style={styles.participantTag}>
                  <Text style={styles.participantText}>
                    {participant.prenom || participant.nom || participant.email || `Membre ${index + 1}`}
                  </Text>
                </View>
              ))}
              {participants.length > 5 && (
                <Text style={styles.moreText}>+ {participants.length - 5} autre(s)</Text>
              )}
            </View>
          </View>
        )}

        {/* Message de chargement */}
        <View style={styles.loadingContainer}>
          <Animated.View
            style={[
              styles.loadingDot,
              {
                opacity: rotation.interpolate({
                  inputRange: [0, 360],
                  outputRange: [0.3, 1],
                }),
              },
            ]}
          />
          <Text style={styles.loadingText}>Calcul en cours...</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    width: width * 0.9,
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginTop: 15,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  wheelContainer: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    position: 'relative',
    marginBottom: 30,
  },
  wheel: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    borderRadius: WHEEL_SIZE / 2,
    position: 'relative',
    borderWidth: 4,
    borderColor: Colors.primaryDark,
    overflow: 'hidden',
  },
  segment: {
    position: 'absolute',
    width: WHEEL_SIZE / 2,
    height: 2,
    left: WHEEL_SIZE / 2,
    top: WHEEL_SIZE / 2,
    transformOrigin: '0% 0%',
  },
  centerCircle: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    top: WHEEL_SIZE / 2 - 40,
    left: WHEEL_SIZE / 2 - 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.primaryDark,
    zIndex: 10,
  },
  pointer: {
    position: 'absolute',
    top: -15,
    left: WHEEL_SIZE / 2 - 15,
    zIndex: 20,
  },
  participantsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  participantsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  participantsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  participantTag: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    margin: 4,
  },
  participantText: {
    fontSize: 12,
    color: Colors.primaryDark,
    fontWeight: '500',
  },
  moreText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    alignSelf: 'center',
    marginTop: 5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accentGreen,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default TirageWheelAnimation;

