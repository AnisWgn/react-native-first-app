/**
 * Force roles + role en chaîne "admin" sur utilisateurs/{uid} (contourne types bizarres / champs manquants).
 * Usage : npm run set-admin -- VOTRE_UID_AUTH
 * L’UID est celui affiché dans l’alerte Permission refusée ou Firebase Authentication.
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const uid = process.argv[2];
if (!uid || uid.length < 10) {
  console.error('Usage: npm run set-admin -- <UID_FIREBASE_AUTH>');
  process.exit(1);
}

const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('Fichier serviceAccountKey.json introuvable à la racine du projet.');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

(async () => {
  const ref = db.collection('utilisateurs').doc(uid);
  await ref.set(
    {
      roles: 'admin',
      role: 'admin',
    },
    { merge: true }
  );
  console.log('OK — utilisateurs/' + uid + ' : roles et role = chaîne "admin".');
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
