// src/utils/storageManager.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_VERSION_KEY = '@app_storage_version';
const CURRENT_VERSION = '1.0.1'; // Incremente cette version pour forcer un nettoyage

/**
 * Verifie la version du storage et efface si necessaire
 * Retourne true si le cache a ete nettoye
 */
export const checkAndClearOldStorage = async () => {
  try {
    const storedVersion = await AsyncStorage.getItem(STORAGE_VERSION_KEY);
    
    console.log(` Version stockee: ${storedVersion}, Version actuelle: ${CURRENT_VERSION}`);
    
    if (storedVersion !== CURRENT_VERSION) {
      console.log('Nettoyage du cache (ancienne version ou premiere utilisation)');
      
      // Efface tout sauf la version
      const keys = await AsyncStorage.getAllKeys();
      const keysToRemove = keys.filter(key => key !== STORAGE_VERSION_KEY);
      
      if (keysToRemove.length > 0) {
        console.log(`  Suppression de ${keysToRemove.length} cles:`, keysToRemove);
        await AsyncStorage.multiRemove(keysToRemove);
      }
      
      // Definir la nouvelle version
      await AsyncStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION);
      
      console.log(' Cache nettoye avec succes');
      return true;
    }
    
    console.log(' Version du cache OK, pas de nettoyage necessaire');
    return false;
  } catch (error) {
    console.error(' Erreur lors du nettoyage du cache:', error);
    return false;
  }
};

/**
 * Force le nettoyage complet du storage
 */
export const clearAllStorage = async () => {
  try {
    console.log(' Nettoyage complet du storage...');
    await AsyncStorage.clear();
    await AsyncStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION);
    console.log(' Tout le cache a ete efface');
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'effacement du cache:', error);
    return false;
  }
};

/**
 * Liste toutes les cles du storage (pour debug)
 */
export const debugStorage = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    console.log('\n ===== DEBUG ASYNCSTORAGE =====');
    console.log(`Total: ${keys.length} cles`);
    
    if (keys.length === 0) {
      console.log('(vide)');
    } else {
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        
        // Tronquer les longues valeurs pour la lisibilite
        let displayValue = value;
        if (value && value.length > 200) {
          displayValue = value.substring(0, 200) + '... (tronque)';
        }
        
        console.log(`\n   ${key}:`);
        
        // Essayer de parser le JSON pour un affichage plus propre
        try {
          const parsed = JSON.parse(value);
          console.log('    ', JSON.stringify(parsed, null, 2));
        } catch {
          console.log('    ', displayValue);
        }
      }
    }
    console.log('================================\n');
    
    return keys;
  } catch (error) {
    console.error(' Erreur debug storage:', error);
    return [];
  }
};

/**
 * Supprimer une cle specifique
 */
export const removeItem = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    console.log(` Cle supprimee: ${key}`);
    return true;
  } catch (error) {
    console.error(` Erreur suppression de ${key}:`, error);
    return false;
  }
};

/**
 * Nettoyer uniquement les donnees utilisateur (pas les tokens)
 */
export const clearUserDataOnly = async () => {
  try {
    console.log(' Nettoyage des donnees utilisateur uniquement...');
    await AsyncStorage.removeItem('@user_data');
    await AsyncStorage.removeItem('@temp_password');
    console.log(' Donnees utilisateur nettoyees');
    return true;
  } catch (error) {
    console.error(' Erreur nettoyage donnees utilisateur:', error);
    return false;
  }
};

export default {
  checkAndClearOldStorage,
  clearAllStorage,
  debugStorage,
  removeItem,
  clearUserDataOnly,
};