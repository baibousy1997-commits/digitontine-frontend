# Guide d'utilisation du logo DigiTontine

## 📍 Où placer votre logo

1. **Placez votre image logo dans ce dossier** (`assets/images/`)
   - Nom du fichier : `logo.png`
   - Format recommandé : PNG (avec transparence si possible)
   - Taille recommandée : 
     - **1024x1024 pixels** minimum pour l'icône de l'application
     - Format carré (ratio 1:1)

## 🎨 Préparation de l'image

### Pour l'icône de l'application :
- **Taille** : 1024x1024 pixels (minimum)
- **Format** : PNG
- **Fond** : Transparent ou noir (selon votre design)
- **Contenu** : Le logo doit être centré avec un peu d'espace autour (marges)

### Pour le Splash Screen (écran de démarrage) :
Vous pouvez utiliser le même fichier `logo.png` ou créer un fichier séparé :
- **Nom optionnel** : `splash.png`
- **Taille** : 2048x2048 pixels (recommandé)
- **Fond** : Noir (#000000) comme dans votre design actuel

## ✅ Configuration actuelle

Le fichier `app.json` est déjà configuré pour utiliser :
- **Icône de l'application** : `./assets/images/logo.png`
- **Splash Screen** : `./assets/images/logo.png` sur fond noir
- **Icône Android adaptative** : `./assets/images/logo.png`

## 📝 Étapes à suivre

1. **Placez votre fichier logo.png** dans ce dossier
2. **Redémarrez Expo** : 
   ```bash
   npm start
   # ou
   expo start
   ```
3. **Nettoyez le cache si nécessaire** :
   ```bash
   expo start -c
   ```

## 🔄 Utilisation dans les composants

Pour utiliser le logo dans vos écrans (LoginScreen, etc.), importez-le ainsi :

```javascript
import { Image } from 'react-native';

const logo = require('../../../assets/images/logo.png');

// Dans votre JSX :
<Image source={logo} style={{ width: 150, height: 150, resizeMode: 'contain' }} />
```

## 📱 Après avoir placé le logo

Une fois le logo placé, vous devrez :
1. Redémarrer Expo
2. Reconstruire l'application si nécessaire :
   - Pour iOS : `expo build:ios`
   - Pour Android : `expo build:android`
   - Ou utiliser EAS Build : `eas build`

---

**Note** : Si votre logo a un fond noir comme dans la description, il sera parfaitement visible sur le splash screen avec le fond noir configuré.

