import { useEffect, useRef } from 'react';
import { Alert, AppState, type AppStateStatus } from 'react-native';
import * as Updates from 'expo-updates';
import { checkNativeApkGateFromFirestore } from '../utils/checkNativeApkGate';

async function promptOtaReload(): Promise<void> {
  if (!Updates.isEnabled) return;

  try {
    const result = await Updates.checkForUpdateAsync();
    if (!result.isAvailable) return;

    await new Promise<void>((resolve) => {
      Alert.alert(
        'Mise à jour disponible',
        'Une nouvelle version du contenu a été publiée. Veux-tu l’appliquer maintenant ?',
        [
          { text: 'Plus tard', style: 'cancel', onPress: () => resolve() },
          {
            text: 'Mettre à jour',
            onPress: async () => {
              try {
                await Updates.fetchUpdateAsync();
                await Updates.reloadAsync();
              } catch {
                // reloadAsync peut échouer si l’app est en arrière-plan
              } finally {
                resolve();
              }
            },
          },
        ]
      );
    });
  } catch {
    // Pas de réseau ou serveur EAS indisponible
  }
}

/**
 * Au démarrage : garde-fou APK natif (Firestore), puis invite OTA (EAS Update).
 * Au retour au premier plan : revérifie les mises à jour OTA.
 */
export function useAppStartupUpdates(): void {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      await checkNativeApkGateFromFirestore();
      if (cancelled) return;
      await promptOtaReload();
    })();

    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        void promptOtaReload();
      }
      appState.current = next;
    });

    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);
}
