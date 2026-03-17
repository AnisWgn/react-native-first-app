/**
 * Script de seed Firestore - Nettoie et remplit les collections
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('Fichier serviceAccountKey.json introuvable !');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const DATA = {
  genres: [
    { libelle: 'RPG', description: 'Jeu de rôle' },
    { libelle: 'FPS', description: 'Jeu de tir à la première personne' },
    { libelle: 'Indie', description: 'Jeu indépendant' },
    { libelle: 'Action', description: 'Jeu d\'action' },
    { libelle: 'Aventure', description: 'Jeu d\'aventure' },
    { libelle: 'Stratégie', description: 'Jeu de stratégie' },
    { libelle: 'Sport', description: 'Jeu de sport' },
  ],
  jeux: [
    { nom: 'The Legend of Zelda: Breath of the Wild', description: 'Jeu d\'aventure action en 3D développé par Nintendo.' },
    { nom: 'Elden Ring', description: 'Jeu de rôle action en 3D développé par FromSoftware.' },
    { nom: 'Minecraft', description: 'Jeu de construction sandbox développé par Mojang.' },
    { nom: 'Super Mario Odyssey', description: 'Jeu d\'aventure platformer développé par Nintendo.' },
    { nom: 'Hades', description: 'Jeu d\'action roguelike développé par Supergiant Games.' },
  ],
  marques: [
    { libelle: 'Nintendo', description: 'Compagnie de jeux vidéo japonaise.' },
    { libelle: 'Sony', description: 'Compagnie de technologie et de divertissement japonaise.' },
    { libelle: 'Microsoft', description: 'Compagnie de technologie américaine.' },
    { libelle: 'Sega', description: 'Compagnie de jeux vidéo japonaise.' },
    { libelle: 'Ubisoft', description: 'Compagnie de jeux vidéo française.' },
  ],
  pegis: [
    { libelle: 'PEGI 3', description: 'Recommandé pour les enfants de 3 ans et plus.' },
    { libelle: 'PEGI 7', description: 'Recommandé pour les enfants de 7 ans et plus.' },
    { libelle: 'PEGI 12', description: 'Recommandé pour les enfants de 12 ans et plus.' },
    { libelle: 'PEGI 16', description: 'Recommandé pour les adolescents de 16 ans et plus.' },
    { libelle: 'PEGI 18', description: 'Recommandé pour les adultes.' },
  ],
  plateformes: [
    { libelle: 'PC', description: 'Ordinateur personnel.' },
    { libelle: 'Nintendo Switch', description: 'Console hybride de Nintendo.' },
    { libelle: 'PlayStation 5', description: 'Console de Sony.' },
    { libelle: 'Xbox Series X', description: 'Console de Microsoft.' },
    { libelle: 'Steam Deck', description: 'Console portable de Valve.' },
  ],
};

/**
 * Supprime tous les documents d'une collection
 */
async function deleteCollection(collectionPath, batchSize = 100) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.orderBy('__name__').limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(query, resolve).catch(reject);
  });
}

async function deleteQueryBatch(query, resolve) {
  const snapshot = await query.get();

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    resolve();
    return;
  }

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  process.nextTick(() => {
    deleteQueryBatch(query, resolve);
  });
}

/**
 * Fonction principale
 */
async function seed() {
  console.log('🚀 Démarrage de la réinitialisation Firestore...\n');

  for (const collectionName of Object.keys(DATA)) {
    try {
      // 1. Suppression
      console.log(`  🗑️ Nettoyage de la collection "${collectionName}"...`);
      await deleteCollection(collectionName);

      // 2. Ajout des données
      const collectionRef = db.collection(collectionName);
      const documents = DATA[collectionName];
      
      for (const doc of documents) {
        await collectionRef.add(doc);
      }

      console.log(`  ✅ ${collectionName}: ${documents.length} document(s) recréé(s)\n`);
    } catch (err) {
      console.error(`  ❌ Erreur sur ${collectionName}:`, err.message);
    }
  }

  console.log('✨ Nettoyage et Seed terminés avec succès !');
  process.exit(0);
}

seed().catch((err) => {
  console.error('💥 Erreur fatale:', err);
  process.exit(1);
});