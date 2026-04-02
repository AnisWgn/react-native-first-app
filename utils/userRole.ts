import { doc, getDoc } from 'firebase/firestore';
import { db } from '../fireBaseConfig.js';

/** Rôle depuis la collection Firestore `utilisateurs` (document id = uid auth). */
export async function fetchUserRole(uid: string): Promise<string> {
  try {
    const userDoc = await getDoc(doc(db, 'utilisateurs', uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return (data?.role as string) ?? 'inconnu';
    }
    console.log('Document utilisateur introuvable !');
    return 'inconnu';
  } catch (error) {
    console.log('Erreur lecture Firestore :', error);
    return 'inconnu';
  }
}

export function isAdmin(role: string | null): boolean {
  return role === 'admin';
}
