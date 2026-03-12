# Agora Mobile – Sprint 2 – Documentation

**BTS SIO – Lycée Frédéric Chopin – Nancy**  
**Projet : Application mobile de gestion avec authentification**

---

## 1. Contexte et besoins

### Contexte

L’application mobile Agora doit évoluer d’une simple application de consultation vers une application de **gestion** des données de l’association. Pour cela, le directeur demande la mise en place d’un **système d’authentification** afin de :

- Restreindre l’accès aux fonctionnalités aux utilisateurs autorisés
- Identifier l’utilisateur connecté
- Permettre une déconnexion sécurisée

### Besoins fonctionnels

- Authentification par email/mot de passe via Firebase
- Persistance de la session (reste connecté après redémarrage de l’app)
- Vérification de l’authentification sur toutes les pages protégées
- Redirection vers la page de connexion si l’utilisateur n’est pas connecté
- Bouton de déconnexion sur toutes les pages de l’application

---

## 2. Outils et technologies utilisés

| Technologie | Rôle |
|-------------|------|
| **React Native / Expo** | Framework de développement de l’application mobile |
| **Firebase** | Backend (Firestore + Authentication) |
| **Firebase Auth** | Authentification (email/mot de passe) |
| **Firestore** | Base de données NoSQL pour les données |
| **@react-native-async-storage/async-storage** | Stockage persistant pour la session Firebase |
| **React Navigation** | Navigation entre les écrans |
| **JavaScript / TypeScript** | Langage de développement |

---

## 3. Réalisations effectuées

### 3.1 Configuration Firebase avec persistance

**Fichier :** `fireBaseConfig.js` (racine du projet)

- **Imports :** `initializeAuth`, `getReactNativePersistence` (Firebase Auth), `AsyncStorage`
- **Configuration :** `initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })` pour que la session survive au redémarrage de l’app
- **Export :** `auth` et `db` pour utilisation dans les écrans

---

### 3.2 Page de connexion

**Fichier :** `screens/App.js`

- **Imports :** `auth`, `signInWithEmailAndPassword`
- **Fonction `handleLogin` :** appelle `signInWithEmailAndPassword(auth, email, password)`, puis `navigation.navigate('page2')` en cas de succès, ou `Alert.alert` en cas d’erreur
- **Navigation :** `navigation.navigate('page2')` sans envoi de l’email (l’email est récupéré via `auth.currentUser` sur les autres pages)
- **Champs :** `TextInput` pour email et mot de passe avec `secureTextEntry` pour le mot de passe
- **Styles :** `input` pour les champs, `button` et `buttonText` pour le bouton

---

### 3.3 Vérification de l’authentification sur la page menu (liste des desserts)

**Fichier :** `screens/page2.tsx`

- **Imports :** `onAuthStateChanged`, `signOut` depuis `firebase/auth`
- **`useEffect` :** `onAuthStateChanged(auth, (user) => { if (!user) navigation.replace('page1'); })` pour rediriger vers la page de connexion si l’utilisateur n’est pas connecté
- **Affichage :** `Connecté : {auth.currentUser?.email}` pour afficher l’email de l’utilisateur connecté
- **Bouton déconnexion :** `handleLogout` appelle `signOut(auth)` puis `navigation.replace('page1')`
- **`navigation.replace` :** utilisé pour empêcher le retour arrière vers les pages protégées après déconnexion

---

### 3.4 Vérification et déconnexion sur la page détail

**Fichier :** `screens/page3.tsx`

- **Imports :** `useEffect`, `auth`, `onAuthStateChanged`, `signOut`
- **`useEffect` :** même logique que `page2` : `onAuthStateChanged` pour rediriger vers `page1` si non connecté
- **`handleLogout` :** identique à `page2` : `signOut(auth)` puis `navigation.replace('page1')`
- **Bouton :** `<Button color="#b00020" title="Quitter" onPress={handleLogout} />`

---

### 3.5 Récapitulatif des emplacements dans le code

| Réalisation | Fichier | Lignes / zones concernées |
|-------------|---------|---------------------------|
| Config Firebase + persistance | `fireBaseConfig.js` | Imports, `initializeAuth`, export `auth` |
| Connexion | `screens/App.js` | `handleLogin`, `TextInput`, `Pressable` |
| Vérification auth + déconnexion menu | `screens/page2.tsx` | `useEffect`, `handleLogout`, `auth.currentUser?.email`, bouton Quitter |
| Vérification auth + déconnexion détail | `screens/page3.tsx` | `useEffect`, `handleLogout`, bouton Quitter |

---

## 4. Difficultés possibles

### 4.1 Configuration Firebase

- **Problème :** Erreur `auth/operation-not-allowed` ou erreur de persistance
- **Cause :** Méthode "Email/Mot de passe" non activée dans la console Firebase, ou mauvaise configuration de `initializeAuth`
- **Solution :** Vérifier dans Firebase Console → Authentification → Méthode de connexion que "Adresse e-mail/Mot de passe" est activé

### 4.2 Persistance avec AsyncStorage

- **Problème :** L’utilisateur est déconnecté à chaque redémarrage de l’app
- **Cause :** Utilisation de `getAuth()` au lieu de `initializeAuth()` avec `getReactNativePersistence(AsyncStorage)`
- **Solution :** Utiliser `initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })` pour React Native

### 4.3 Retour arrière après déconnexion

- **Problème :** L’utilisateur peut revenir aux pages protégées avec le bouton retour après déconnexion
- **Cause :** Utilisation de `navigation.navigate` au lieu de `navigation.replace`
- **Solution :** Utiliser `navigation.replace('page1')` pour remplacer la page de connexion dans la pile de navigation

### 4.4 Affichage de l’email après connexion

- **Problème :** L’email n’apparaît pas ou est vide
- **Cause :** Passage de l’email via `route.params` alors que l’utilisateur peut arriver directement depuis la persistance
- **Solution :** Utiliser `auth.currentUser?.email` pour afficher l’email de l’utilisateur authentifié par Firebase

### 4.5 Erreurs de connexion

- **Problème :** L’utilisateur ne peut pas se connecter
- **Cause :** Compte non créé dans Firebase, ou erreur réseau
- **Solution :** Créer les comptes dans Firebase Console → Authentification → Utilisateurs, et vérifier les messages d’erreur dans `Alert.alert`

### 4.6 Déconnexion sur toutes les pages

- **Problème :** Oubli de la vérification sur une page
- **Cause :** Multiplication des écrans sans appliquer systématiquement le même pattern
- **Solution :** Utiliser `useEffect` + `onAuthStateChanged` et `handleLogout` sur chaque page protégée, ou créer un composant réutilisable

---

## 5. Structure des écrans

```
page1 (App.js)              → Connexion
pageMenu (menu.tsx)         → Menu principal + authentification + déconnexion
page2 (page2.tsx)           → Liste des desserts + authentification + déconnexion
page3 (page3.tsx)           → Détail d'un dessert + authentification + déconnexion
gererLesJeux                → Liste des jeux + authentification + déconnexion
detailJeu                   → Détail d'un jeu + authentification + déconnexion
gererLesGenres              → Liste des genres + authentification + déconnexion
detailGenre                 → Détail d'un genre + authentification + déconnexion
gererLesPegis               → Liste des PEGI + authentification + déconnexion
detailPegi                  → Détail d'un PEGI + authentification + déconnexion
gererLesMarques             → Liste des marques + authentification + déconnexion
detailMarque                → Détail d'une marque + authentification + déconnexion
gererLesPlateformes         → Liste des plateformes + authentification + déconnexion
detailPlateforme            → Détail d'une plateforme + authentification + déconnexion
```

**Collections Firestore :** `jeux`, `genres`, `pegis`, `marques`, `plateformes` (à créer dans Firestore si nécessaire)

---

*Document rédigé dans le cadre du projet Agora Mobile – Sprint 2 – BTS SIO*
