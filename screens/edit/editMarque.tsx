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
import {
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, auth } from '../../fireBaseConfig.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function EditMarque({ route, navigation }) {
  const marque = route?.params?.marque ?? null;
  const [libelle, setLibelle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) navigation.replace('pageConnexion');
    });
    return () => unsubscribe();
  }, [navigation]);

  useEffect(() => {
    if (marque) {
      setLibelle(marque.libelle ?? '');
      setDescription(marque.description ?? '');
    }
  }, [marque]);

  const handleCreate = async () => {
    try {
      if (!libelle.trim()) return;
      const marquesCol = collection(db, 'marques');
      let payload: Record<string, unknown> = { libelle: libelle.trim(), description: description.trim() };
      try {
        const q = query(marquesCol, orderBy('idMarque', 'desc'), limit(1));
        const snapshot = await getDocs(q);
        payload.idMarque = snapshot.empty ? 1 : ((snapshot.docs[0].data().idMarque ?? 0) + 1);
      } catch {
        payload.idMarque = 1;
      }
      await addDoc(marquesCol, payload);
      navigation.goBack();
    } catch (error) {
      console.log('Erreur création :', error);
      Alert.alert('Erreur', 'Impossible de créer la marque.');
    }
  };

  const handleUpdate = async () => {
    if (!marque?.id) return;
    try {
      if (!libelle.trim()) return;
      await updateDoc(doc(db, 'marques', marque.id), {
        libelle: libelle.trim(),
        description: description.trim(),
      });
      navigation.goBack();
    } catch (error) {
      console.log('Erreur modification :', error);
      Alert.alert('Erreur', 'Impossible de modifier la marque.');
    }
  };

  const handleDelete = () => {
    if (!marque?.id) return;
    Alert.alert(
      'Confirmer la suppression',
      `Supprimer la marque "${libelle || marque.libelle}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'marques', marque.id));
              navigation.goBack();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer la marque.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={[styles.accentBar, { backgroundColor: '#EC4899' }]} />
        <Text style={styles.title}>{marque ? 'Modifier la marque' : 'Créer une marque'}</Text>
        <TextInput
          style={styles.input}
          value={libelle}
          onChangeText={setLibelle}
          placeholder="Libellé (ex: Nintendo)"
          placeholderTextColor="#94A3B8"
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Description"
          placeholderTextColor="#94A3B8"
          multiline
        />
        {marque ? (
          <View style={styles.actions}>
            <Pressable style={({ pressed }) => [styles.btnModifier, pressed && styles.btnPressed]} onPress={handleUpdate}>
              <Text style={styles.btnText}>Modifier</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.btnSupprimer, pressed && styles.btnPressed]} onPress={handleDelete}>
              <Text style={styles.btnSupprimerText}>Supprimer</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={({ pressed }) => [styles.btnCreer, pressed && styles.btnPressed]} onPress={handleCreate}>
            <Text style={styles.btnText}>Créer</Text>
          </Pressable>
        )}
      </View>
      <View style={styles.footer}>
        <Pressable style={({ pressed }) => [styles.backBtn, pressed && styles.btnPressed]} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Retour à la liste des marques</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [styles.logoutBtn, pressed && styles.logoutBtnPressed]} onPress={async () => { await signOut(auth); navigation.replace('pageConnexion'); }}>
          <Text style={styles.logoutText}>Quitter</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 24, paddingTop: 60 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 28, shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 8, alignItems: 'center' },
  accentBar: { width: 48, height: 4, borderRadius: 2, marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '800', color: '#1E293B', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#E2E8F0', width: '100%', padding: 14, marginBottom: 16, backgroundColor: '#FFFFFF', borderRadius: 12, fontSize: 16, color: '#1E293B' },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  actions: { flexDirection: 'row', gap: 12, width: '100%', marginBottom: 12 },
  btnCreer: { backgroundColor: '#6366F1', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 14, width: '100%', alignItems: 'center' },
  btnModifier: { flex: 1, backgroundColor: '#6366F1', paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  btnSupprimer: { flex: 1, backgroundColor: '#FEE2E2', paddingVertical: 14, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: '#FECACA' },
  btnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  btnSupprimerText: { color: '#DC2626', fontSize: 15, fontWeight: '700' },
  btnPressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
  footer: { flexDirection: 'row', gap: 10, marginTop: 24 },
  backBtn: { flex: 1, backgroundColor: '#94A3B8', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  backBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  logoutBtn: { backgroundColor: '#FEE2E2', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center', borderWidth: 1, borderColor: '#FECACA' },
  logoutBtnPressed: { backgroundColor: '#FECACA' },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#DC2626' },
});
