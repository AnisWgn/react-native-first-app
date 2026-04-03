import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, Alert, ScrollView } from 'react-native';
import { doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../fireBaseConfig.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { fetchUserRole, isAdmin } from '../../utils/userRole';

function libelleActivite(a: Record<string, unknown>) {
  return (a.libActivités ?? a.libActivité ?? a.nom ?? '') as string;
}

export default function DetailActivite({ route, navigation }) {
  const activite = route?.params?.activite ?? null;
  const [role, setRole] = useState<string | null>(null);

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
        setRole(null);
        navigation.replace('pageConnexion');
        return;
      }
      const r = await fetchUserRole(user.uid, user.email);
      setRole(r);
    });
    return () => unsubscribe();
  }, [navigation]);

  const handleDelete = () => {
    if (!activite?.id) return;
    const label = libelleActivite(activite) || activite.id;
    Alert.alert('Confirmer la suppression', `Supprimer l’activité « ${label} » ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'activites', activite.id));
            navigation.goBack();
          } catch (error) {
            console.log('Erreur suppression :', error);
            Alert.alert('Erreur', 'Impossible de supprimer l’activité.');
          }
        },
      },
    ]);
  };

  if (!activite) {
    return null;
  }

  const age = activite.ageMinimum;
  const dateD = activite.dateDémarrage ?? activite.dateDemarrage;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        <View style={[styles.accentBar, { backgroundColor: '#0EA5E9' }]} />
        <Text style={styles.label}>Activité</Text>
        <Text style={styles.title}>{libelleActivite(activite) || '—'}</Text>

        <View style={styles.row}>
          <Text style={styles.fieldLabel}>Âge minimum</Text>
          <Text style={styles.fieldValue}>{age != null && age !== '' ? String(age) : '—'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.fieldLabel}>Date de démarrage</Text>
          <Text style={styles.fieldValue}>{dateD != null && dateD !== '' ? String(dateD) : '—'}</Text>
        </View>

        <View style={styles.idBadge}>
          <Text style={styles.idText}>#{activite.id}</Text>
        </View>

        {isAdmin(role) && (
          <Pressable
            style={({ pressed }) => [styles.btnSupprimer, pressed && styles.btnPressed]}
            onPress={handleDelete}
          >
            <Text style={styles.btnSupprimerText}>Supprimer l’activité</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.btnPressed]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backBtnText}>Retour à la liste</Text>
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
  scroll: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 32 },
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
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
    textAlign: 'center',
  },
  title: { fontSize: 24, fontWeight: '800', color: '#1E293B', textAlign: 'center', marginBottom: 20 },
  row: { marginBottom: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 12 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#94A3B8', marginBottom: 4 },
  fieldValue: { fontSize: 17, color: '#1E293B', fontWeight: '600' },
  idBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 8,
  },
  idText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  btnSupprimer: {
    marginTop: 22,
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  btnSupprimerText: { color: '#DC2626', fontSize: 15, fontWeight: '700' },
  btnPressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
  footer: { flexDirection: 'row', gap: 10, marginTop: 28 },
  backBtn: {
    flex: 1,
    backgroundColor: '#6366F1',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
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
