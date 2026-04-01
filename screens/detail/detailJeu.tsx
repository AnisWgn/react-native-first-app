import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, ScrollView } from 'react-native';
import { auth } from '../../fireBaseConfig.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// Detail d'un jeu :
export default function DetailJeu({ route, navigation }) {
  const { jeu } = route.params;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('pageConnexion');
    } catch (err) {
      console.log('Erreur deconnexion :', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) navigation.replace('pageConnexion');
    });
    return () => unsubscribe();
  }, [navigation]);

  const line = (label: string, value: string | undefined) => (
    <View style={styles.row} key={label}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value?.trim() ? value : '—'}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={[styles.accentBar, { backgroundColor: '#10B981' }]} />
          <Text style={styles.label}>Jeu</Text>
          <Text style={styles.title}>Nom : {jeu.nom}</Text>
          <Text style={styles.text}>Description : {jeu.description || '—'}</Text>
          <Text style={styles.text}>Prix : {jeu.prix || '—'} €</Text>
          <Text style={styles.text}>Date de parution : {jeu.dateParution || '—'}</Text>
          <Text style={styles.text}>Âge limite : {jeu.ageLimite || '—'}</Text>
          <Text style={styles.text}>Genre : {jeu.libGenre || '—'}</Text>
          <Text style={styles.text}>Plateforme : {jeu.libPlateforme || '—'}</Text>
          <Text style={styles.text}>Marque : {jeu.nomMarque || '—'}</Text>
          <View style={styles.idBadge}>
            <Text style={styles.idText}>#{jeu.id}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.btnPressed]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backBtnText}>Retour a la liste</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.logoutBtn, pressed && styles.logoutBtnPressed]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Quitter</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingHorizontal: 24, paddingTop: 56 },
  scrollContent: { paddingBottom: 24 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 28, shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 8, alignItems: 'center' },
  accentBar: { width: 48, height: 4, borderRadius: 2, marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: '800', color: '#1E293B', textAlign: 'center', marginBottom: 16 },
  row: { width: '100%', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 10 },
  rowLabel: { fontSize: 12, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  rowValue: { fontSize: 16, color: '#1E293B' },
  idBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, marginTop: 8 },
  idText: { fontSize: 14, color: '#64748B', fontWeight: '600', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  footer: { flexDirection: 'row', gap: 10, marginTop: 16, paddingBottom: 32 },
  backBtn: { flex: 1, backgroundColor: '#6366F1', borderRadius: 14, paddingVertical: 14, alignItems: 'center', shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  btnPressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
  backBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  logoutBtn: { backgroundColor: '#FEE2E2', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center', borderWidth: 1, borderColor: '#FECACA' },
  logoutBtnPressed: { backgroundColor: '#FECACA' },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#DC2626' },
  text: { fontSize: 18, color: '#334155', textAlign: 'center', lineHeight: 24, paddingBottom: 16, width: '100%' },
});
