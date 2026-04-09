/* eslint-env node */
/**
 * Config Expo : EAS Update (OTA) + runtimeVersion.
 * Après `eas init`, renseigne extra.eas.projectId (ou variable EAS_PROJECT_ID au build).
 * @see https://docs.expo.dev/eas-update/getting-started/
 */

/** ID du projet Expo (expo.dev) — complété après `eas init`. */
const EAS_PROJECT_ID_DEFAULT = 'b4359ce6-f360-43ab-93bf-6ae9aa5ce589';

const projectId =
  process.env.EAS_PROJECT_ID ||
  process.env.EXPO_PUBLIC_EAS_PROJECT_ID ||
  EAS_PROJECT_ID_DEFAULT;

const updates = {
  enabled: true,
  checkAutomatically: 'ON_LOAD',
  fallbackToCacheTimeout: 0,
  ...(projectId ? { url: `https://u.expo.dev/${projectId}` } : {}),
};

const appLinkHost = process.env.EXPO_PUBLIC_APP_LINK_HOST || '';

module.exports = {
  expo: {
    name: 'my-app',
    slug: 'my-app',
    scheme: 'monsite',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
    updates,
    plugins: [
      [
        'expo-location',
        {
          locationWhenInUsePermission:
            "GameGestion utilise ta position pour afficher la carte et calculer la distance à vol d'oiseau jusqu'au point choisi.",
        },
      ],
      [
        'expo-camera',
        {
          cameraPermission: "L'app utilise la caméra pour scanner les codes QR.",
          recordAudioAndroid: false,
        },
      ],
    ],
    ios: {
      bundleIdentifier: 'com.anis511.myapp',
      supportsTablet: true,
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          "GameGestion utilise ta position pour afficher la carte et calculer la distance à vol d'oiseau jusqu'au point choisi.",
      },
    },
    android: {
      package: 'com.anis511.myapp',
      permissions: ['ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION', 'CAMERA'],
      ...(appLinkHost
        ? {
            intentFilters: [
              {
                action: 'VIEW',
                autoVerify: true,
                data: [
                  {
                    scheme: 'https',
                    host: appLinkHost,
                    pathPrefix: '/app',
                  },
                ],
                category: ['BROWSABLE', 'DEFAULT'],
              },
            ],
          }
        : {}),
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
    },
    web: {
      favicon: './assets/favicon.png',
    },
    extra: {
      eas: projectId ? { projectId } : {},
    },
  },
};
