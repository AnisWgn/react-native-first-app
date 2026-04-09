import * as Linking from 'expo-linking';

/** Hôte HTTPS autorisé pour les liens universels (variable .env EXPO_PUBLIC_APP_LINK_HOST). */
const WEB_LINK_HOST = process.env.EXPO_PUBLIC_APP_LINK_HOST || '';

const ALIASES: Record<string, string> = {
  menu: 'pageMenu',
  connexion: 'pageConnexion',
  carte: 'carteDistance',
  jeu: 'jeuGyroscope',
  scan: 'scanQr',
  jeux: 'gererLesJeux',
  genres: 'gererLesGenres',
  activites: 'gererLesActivites',
  'edit-jeu': 'editJeu',
};

const KNOWN_SCREENS = new Set([
  'pageMenu',
  'pageConnexion',
  'carteDistance',
  'jeuGyroscope',
  'scanQr',
  'gererLesJeux',
  'gererLesGenres',
  'gererLesActivites',
  'gererLesPegis',
  'gererLesMarques',
  'gererLesPlateformes',
  'editJeu',
]);

/**
 * Interprète une URL issue d’un QR (monsite://, ou https vers ton site /app/...).
 * Retourne le nom d’écran React Navigation, ou null si non géré.
 */
export function resolveQrLinkToRouteName(url: string): string | null {
  const raw = url.trim();
  if (!raw) return null;

  try {
    const p = Linking.parse(raw);

    if (p.queryParams && typeof p.queryParams.screen === 'string') {
      const s = p.queryParams.screen;
      if (KNOWN_SCREENS.has(s)) return s;
      if (ALIASES[s.toLowerCase()]) return ALIASES[s.toLowerCase()]!;
    }

    if (p.scheme === 'monsite') {
      const host = (p.hostname || '').replace(/^\/+|\/+$/g, '');
      const pathFirst = (p.path || '').split('/').filter(Boolean)[0] || '';
      const token = (host || pathFirst).split('?')[0];
      if (!token) return 'pageMenu';
      if (KNOWN_SCREENS.has(token)) return token;
      const alias = ALIASES[token.toLowerCase()];
      if (alias) return alias;
      return 'pageMenu';
    }

    if (p.scheme === 'https' || p.scheme === 'http') {
      if (WEB_LINK_HOST && p.hostname === WEB_LINK_HOST) {
        const path = p.path || '';
        const m = path.match(/\/(?:app|open)\/([^/?]+)/i);
        if (m) {
          const seg = m[1];
          if (KNOWN_SCREENS.has(seg)) return seg;
          if (ALIASES[seg.toLowerCase()]) return ALIASES[seg.toLowerCase()]!;
        }
      }
    }
  } catch {
    return null;
  }

  return null;
}
