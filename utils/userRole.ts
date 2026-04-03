import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../fireBaseConfig.js';

/**
 * Rôle depuis la collection Firestore `utilisateurs` (document id = uid auth).
 * Champs acceptés : `roles` (recommandé) ou ancien `role` (rétrocompatibilité).
 * Si le document n’existe pas encore, il est créé avec `roles: 'user'` (première connexion).
 *
 * Règles Firestore conseillées : l’utilisateur peut lire/écrire uniquement `utilisateurs/{uid}` où uid == auth.uid.
 */
export async function fetchUserRole(uid: string, email?: string | null): Promise<string> {
  try {
    const ref = doc(db, 'utilisateurs', uid);
    const userDoc = await getDoc(ref);
    if (userDoc.exists()) {
      const data = userDoc.data() as { roles?: unknown; role?: unknown };
      const raw = data?.roles ?? data?.role;
      const str = raw == null ? '' : String(raw).trim().toLowerCase();
      if (str === 'admin') {
        return 'admin';
      }
      return 'user';
    }

    await setDoc(ref, {
      roles: 'user',
      role: 'user',
      email: email ?? null,
      createdAt: serverTimestamp(),
    });

    return 'user';
  } catch (error) {
    console.warn('Firestore utilisateurs :', error);
    return 'user';
  }
}

export function isAdmin(role: string | null): boolean {
  return role?.trim().toLowerCase() === 'admin';
}
