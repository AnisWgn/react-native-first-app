import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  Pressable,
  ScrollView,
} from 'react-native';
import { addDoc, collection, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../fireBaseConfig.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { fetchUserRole, isAdmin } from '../../utils/userRole';

/** Création uniquement : pas de modification d’activité. */
export default function EditActivite({ route, navigation }) {
  const existing = route?.params?.activite ?? null;
  const [libActivités, setLibActivités] = useState('');
  const [ageMinimum, setAgeMinimum] = useState('');
  const [dateDémarrage, setDateDémarrage] = useState('');

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('pageConnexion');
    } catch (err) {
      console.log('Erreur deconnexion :', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigation.replace('pageConnexion');
        return;
      }
      const r = await fetchUserRole(user.uid, user.email);
      if (!isAdmin(r)) {
        navigation.goBack();
      }
    });
    return () => unsubscribe();
  }, [navigation]);

  useEffect(() => {
    if (existing) {
      navigation.goBack();
    }
  }, [existing, navigation]);

  const handleCreate = async () => {
    const lib = libActivités.trim();
    if (!lib) {
      Alert.alert('Champs requis', 'Indiquez le libellé de l’activité.');
      return;
    }
    const age = parseInt(ageMinimum.trim(), 10);
    if (Number.isNaN(age) || age < 0) {
      Alert.alert('Âge minimum', 'Indiquez un âge minimum valide (nombre entier ≥ 0).');
      return;
    }
    const dateStr = dateDémarrage.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      Alert.alert('Date', 'Utilisez le format AAAA-MM-JJ pour la date de démarrage.');
      return;
    }
    try {
      await addDoc(collection(db, 'activites'), {
        libActivités: lib,
        ageMinimum: age,
        dateDémarrage: dateStr,
      });
      navigation.goBack();
    } catch (error: unknown) {
      console.log('Erreur création activité :', error);
      const code =
        error && typeof error === 'object' && 'code' in error
          ? String((error as { code?: string }).code)
          : '';
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message?: string }).message)
          : String(error);
      if (code === 'permission-denied') {
        const uid = auth.currentUser?.uid;
        let diagnostic = '';
        if (uid) {
          try {
            const snap = await getDoc(doc(db, 'utilisateurs', uid));
            if (!snap.exists()) {
              diagnostic =
                '\n\n— Diagnostic —\nAucun document à la collection « utilisateurs » avec cet ID.\nCréez le document manuellement (ID = UID ci-dessus) ou reconnectez-vous.';
            } else {
              const d = snap.data() as Record<string, unknown>;
              const keys = Object.keys(d || {}).join(', ') || '(aucun champ)';
              const rv = d?.roles;
              const r2 = d?.role;
              const fmt = (v: unknown) =>
                v === undefined ? '(champ absent)' : JSON.stringify(v);
              diagnostic =
                '\n\n— Diagnostic —\nChamps vus par l’app : ' +
                keys +
                '\nroles = ' +
                fmt(rv) +
                '\nrole = ' +
                fmt(r2) +
                '\n\nLes règles exigent roles ou role = admin (chaîne, avec espaces/casse OK, ou tableau d’un seul "admin").\nCollection exacte : utilisateurs (tout en minuscules).';
            }
          } catch {
            diagnostic = '\n\n— Diagnostic —\nImpossible de lire utilisateurs/{uid}.';
          }
        }
        Alert.alert(
          'Permission refusée',
          `UID : ${uid ?? '(non connecté)'}\n\n` +
            'Si le diagnostic ci-dessous ne montre pas roles = "admin", corrigez le document dans la console Firebase (Firestore), puis republiez les règles du fichier rule.txt.' +
            diagnostic
        );
      } else {
        Alert.alert('Erreur', message || 'Impossible de créer l’activité.');
      }
    }
  };

  if (existing) {
    return null;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={[styles.accentBar, { backgroundColor: '#0EA5E9' }]} />
        <Text style={styles.title}>Créer une activité</Text>

        <Text style={styles.inputLabel}>Libellé de l’activité</Text>
        <TextInput
          style={styles.input}
          value={libActivités}
          onChangeText={setLibActivités}
          placeholder="Ex. Atelier jeux vidéo junior"
          placeholderTextColor="#94A3B8"
        />

        <Text style={styles.inputLabel}>Âge minimum</Text>
        <TextInput
          style={styles.input}
          value={ageMinimum}
          onChangeText={setAgeMinimum}
          placeholder="Ex. 8"
          placeholderTextColor="#94A3B8"
          keyboardType="number-pad"
        />

        <Text style={styles.inputLabel}>Date de démarrage (AAAA-MM-JJ)</Text>
        <TextInput
          style={styles.input}
          value={dateDémarrage}
          onChangeText={setDateDémarrage}
          placeholder="2026-09-01"
          placeholderTextColor="#94A3B8"
        />

        <Pressable
          style={({ pressed }) => [styles.btnCreer, pressed && styles.btnPressed]}
          onPress={handleCreate}
        >
          <Text style={styles.btnText}>Créer</Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.btnPressed]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backBtnText}>Retour à la liste des activités</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.logoutBtn, pressed && styles.logoutBtnPressed]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Quitter</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 24, paddingTop: 60 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
    alignItems: 'stretch',
  },
  accentBar: { width: 48, height: 4, borderRadius: 2, marginBottom: 20, alignSelf: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: '#1E293B', marginBottom: 20, textAlign: 'center' },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#64748B', marginBottom: 6, alignSelf: 'flex-start' },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: '100%',
    padding: 14,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  btnCreer: {
    backgroundColor: '#6366F1',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  btnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  btnPressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
  footer: { flexDirection: 'row', gap: 10, marginTop: 24 },
  backBtn: {
    flex: 1,
    backgroundColor: '#94A3B8',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  backBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  logoutBtn: {
    backgroundColor: '#FEE2E2',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutBtnPressed: { backgroundColor: '#FECACA' },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#DC2626' },
});
