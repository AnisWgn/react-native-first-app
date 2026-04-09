/**
 * Notifications push (FCM) — optionnel, non branché ici.
 *
 * Pour une notification système quand une nouvelle version est publiée :
 * 1. Ajouter @react-native-firebase/app + messaging (ou expo-notifications + serveur Expo push).
 * 2. Configurer Firebase Cloud Messaging dans la console (clé serveur, fichier google-services.json).
 * 3. Demander la permission avec requestPermission() et enregistrer le token FCM.
 * 4. Envoyer la notif depuis une Cloud Function ou ton backend quand tu publies un build / une OTA.
 *
 * Ce fichier évite d’importer des modules natifs lourds tant que tu n’en as pas besoin.
 */
export async function registerFcmOptionalPlaceholder(): Promise<null> {
  return null;
}
