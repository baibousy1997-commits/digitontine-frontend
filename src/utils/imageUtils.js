// src/utils/imageUtils.js
/**
 * Utilitaires pour la gestion des images
 * Contrôle de taille, compression, validation
 */

import * as ImageManipulator from 'expo-image-manipulator';
import { Alert } from 'react-native';

// Limites de taille (en bytes)
const MAX_FILE_SIZE_IDENTITY = 5 * 1024 * 1024; // 5MB pour photo d'identité
const MAX_FILE_SIZE_PROFILE = 2 * 1024 * 1024; // 2MB pour photo de profil
const MAX_DIMENSION_IDENTITY = 2000; // 2000px max pour photo d'identité
const MAX_DIMENSION_PROFILE = 1000; // 1000px max pour photo de profil

/**
 * Formater la taille en format lisible
 * @param {number} bytes - Taille en bytes
 * @returns {string} - Taille formatée (ex: "2.5 MB")
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Vérifier et compresser une image si nécessaire
 * @param {Object} imageAsset - Asset retourné par ImagePicker
 * @param {string} type - 'identity' ou 'profile'
 * @returns {Promise<Object|null>} - Asset compressé et validé, ou null si annulé/erreur
 */
export const validateAndCompressImage = async (imageAsset, type = 'identity') => {
  try {
    const maxSize = type === 'identity' ? MAX_FILE_SIZE_IDENTITY : MAX_FILE_SIZE_PROFILE;
    const maxDimension = type === 'identity' ? MAX_DIMENSION_IDENTITY : MAX_DIMENSION_PROFILE;
    
    // Vérifier la taille initiale
    if (imageAsset.fileSize && imageAsset.fileSize > maxSize) {
      const sizeFormatted = formatFileSize(imageAsset.fileSize);
      const maxSizeFormatted = formatFileSize(maxSize);
      
      // Demander confirmation pour compression
      return new Promise((resolve) => {
        Alert.alert(
          'Image trop lourde',
          `L'image sélectionnée fait ${sizeFormatted}.\nLa taille maximale autorisée est ${maxSizeFormatted}.\n\nVoulez-vous la compresser automatiquement ?`,
          [
            { 
              text: 'Annuler', 
              style: 'cancel',
              onPress: () => resolve(null)
            },
            { 
              text: 'Compresser', 
              onPress: async () => {
                const compressed = await compressImage(imageAsset, maxSize, maxDimension);
                resolve(compressed);
              }
            },
          ]
        );
      });
    }

    // Vérifier les dimensions
    const needsResize = 
      imageAsset.width > maxDimension || 
      imageAsset.height > maxDimension;

    if (needsResize) {
      // Redimensionner automatiquement si trop grande (sans demander confirmation)
      return await compressImage(imageAsset, maxSize, maxDimension);
    }

    // Image valide, retourner telle quelle
    return imageAsset;
  } catch (error) {
    console.error('Erreur validation image:', error);
    Alert.alert('Erreur', 'Une erreur est survenue lors de la validation de l\'image.');
    return null;
  }
};

/**
 * Compresser et redimensionner une image
 * @param {Object} imageAsset - Asset retourné par ImagePicker
 * @param {number} maxSize - Taille maximale en bytes
 * @param {number} maxDimension - Dimension maximale en pixels
 * @returns {Promise<Object>} - Asset compressé
 */
const compressImage = async (imageAsset, maxSize, maxDimension) => {
  try {
    // Calculer les nouvelles dimensions en gardant le ratio
    let newWidth = imageAsset.width;
    let newHeight = imageAsset.height;

    if (imageAsset.width > maxDimension || imageAsset.height > maxDimension) {
      const ratio = Math.min(
        maxDimension / imageAsset.width,
        maxDimension / imageAsset.height
      );
      newWidth = Math.round(imageAsset.width * ratio);
      newHeight = Math.round(imageAsset.height * ratio);
    }

    // Compresser progressivement jusqu'à atteindre la taille cible
    let quality = 0.8;
    let compressedAsset = imageAsset;

    while (quality > 0.1) {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        imageAsset.uri,
        [
          { resize: { width: newWidth, height: newHeight } },
        ],
        {
          compress: quality,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      // Vérifier la taille du fichier compressé
      if (manipulatedImage.fileSize && manipulatedImage.fileSize <= maxSize) {
        compressedAsset = {
          ...manipulatedImage,
          width: newWidth,
          height: newHeight,
        };
        break;
      }

      // Réduire la qualité pour la prochaine tentative
      quality -= 0.1;
    }

    // Vérifier si la compression a réussi
    if (compressedAsset.fileSize && compressedAsset.fileSize > maxSize) {
      Alert.alert(
        'Image trop lourde',
        `Impossible de compresser l'image sous ${formatFileSize(maxSize)}.\nVeuillez sélectionner une image plus petite.`
      );
      return null;
    }

    const originalSize = formatFileSize(imageAsset.fileSize || 0);
    const compressedSize = formatFileSize(compressedAsset.fileSize || 0);
    
    console.log(`[ImageUtils] Image compressée: ${originalSize} → ${compressedSize}`);
    
    return compressedAsset;
  } catch (error) {
    console.error('Erreur compression image:', error);
    Alert.alert('Erreur', 'Une erreur est survenue lors de la compression de l\'image.');
    return null;
  }
};

/**
 * Vérifier rapidement la taille d'une image avant sélection
 * @param {Object} imageAsset - Asset retourné par ImagePicker
 * @param {string} type - 'identity' ou 'profile'
 * @returns {boolean} - true si valide, false sinon
 */
export const quickValidateImage = (imageAsset, type = 'identity') => {
  const maxSize = type === 'identity' ? MAX_FILE_SIZE_IDENTITY : MAX_FILE_SIZE_PROFILE;
  
  if (!imageAsset.fileSize) {
    // Si pas de fileSize disponible, on accepte (sera vérifié côté serveur)
    return true;
  }

  if (imageAsset.fileSize > maxSize) {
    const sizeFormatted = formatFileSize(imageAsset.fileSize);
    const maxSizeFormatted = formatFileSize(maxSize);
    
    Alert.alert(
      'Image trop lourde',
      `L'image sélectionnée fait ${sizeFormatted}.\nLa taille maximale autorisée est ${maxSizeFormatted}.`
    );
    return false;
  }

  return true;
};

