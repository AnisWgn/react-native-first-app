import { Alert, Linking, Platform } from 'react-native';
import * as Application from 'expo-application';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../fireBaseConfig.js';
import { compareSemver } from './semver';

export type AppUpdateConfig = {
  /** Version minimale du build natif (ex. "1.0.0" = version dans app.config). */
  minAndroidVersion?: string;
  /** Lien HTTPS vers le dernier APK à installer. */
  latestApkUrl?: string;
};

/**
 * Firestore : collection `config`, document `app_update` (console Firebase).
 * Règles : autoriser au moins la lecture pour les clients authentifiés ou public selon ton besoin.
 *
 * Exemple de document :
 * { "minAndroidVersion": "1.0.0", "latestApkUrl": "https://example.com/app-release.apk" }
 */
export async function checkNativeApkGateFromFirestore(): Promise<void> {
  if (Platform.OS !== 'android') return;

  try {
    const snap = await getDoc(doc(db, 'config', 'app_update'));
    if (!snap.exists()) return;

    const data = snap.data() as AppUpdateConfig;
    const minV = data.minAndroidVersion?.trim();
    const apkUrl = data.latestApkUrl?.trim();
    if (!minV || !apkUrl) return;

    const current = Application.nativeApplicationVersion ?? '0.0.0';

    if (compareSemver(current, minV) >= 0) return;

    await new Promise<void>((resolve) => {
      Alert.alert(
        'Mise à jour requise',
        `Cette version (${current}) est trop ancienne. Installe la version ${minV} ou plus récente.`,
        [
          {
            text: 'Télécharger',
            onPress: () => {
              Linking.openURL(apkUrl).catch(() => {});
              resolve();
            },
          },
          { text: 'OK', style: 'cancel', onPress: () => resolve() },
        ]
      );
    });
  } catch {
    // Réseau / permissions Firestore : ne pas bloquer l’app
  }
}
