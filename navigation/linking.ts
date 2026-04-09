import * as Linking from 'expo-linking';
import type { LinkingOptions } from '@react-navigation/native';

const webHost = process.env.EXPO_PUBLIC_APP_LINK_HOST || '';

const prefixes = [
  Linking.createURL('/'),
  'monsite://',
  'exp://',
  ...(webHost ? [`https://${webHost}`, `http://${webHost}`] : []),
];

/**
 * Chemins courts pour les deep links (monsite://menu, monsite://carte, …).
 * @see https://reactnavigation.org/docs/configuring-links/
 */
export const linking: LinkingOptions<Record<string, object | undefined>> = {
  prefixes,
  config: {
    screens: {
      pageConnexion: 'connexion',
      pageMenu: 'menu',
      gererLesJeux: 'admin/jeux',
      gererLesGenres: 'admin/genres',
      gererLesActivites: 'admin/activites',
      gererLesPegis: 'admin/pegi',
      gererLesMarques: 'admin/marques',
      gererLesPlateformes: 'admin/plateformes',
      carteDistance: 'carte',
      jeuGyroscope: 'jeu',
      scanQr: 'scan',
      editJeu: 'edit-jeu',
    },
  },
};
