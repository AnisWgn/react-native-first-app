import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Pressable, Platform } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../fireBaseConfig.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// Gestion des genres : RPG, FPS, indie... Firestore les stocke tous sans discrimination
export default function GererLesGenres({ navigation }) {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('page1');
    } catch (err) {
      console.log('Erreur deconnexion :', err);
    }
  };

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setLoading(true);
        setError(null);
        const ref = collection(db, 'genres');
        const snapshot = await getDocs(ref);
        const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setGenres(list);
      } catch (err) {
        console.error('Erreur Firestore:', err);
        setError(err instanceof Error ? err.message : 'Impossible de charger les genres');
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) navigation.replace('page1');
      else fetchGenres();
    });
    return () => unsubscribe();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Genres</Text>
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>{auth.currentUser?.email}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : genres.length === 0 ? (
        <View style={styles.centerBox}>
          <Text style={styles.emptyText}>Aucun genre dans la collection</Text>
        </View>
      ) : (
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={genres}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, index) => item.id ?? index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('detailGenre', { genre: item })}
            >
              <View style={styles.cardAccent} />
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{item.libelle ?? item.nom ?? item.id}</Text>
                <Text style={styles.cardId}>#{item.id}</Text>
              </View>
              <Text style={styles.cardArrow}>›</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.btnPressed]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backBtnText}>Retour au menu</Text>
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

const ACCENT = '#3B82F6';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: 60, paddingHorizontal: 20 },
  header: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '800', color: '#1E293B', letterSpacing: 0.5 },
  badge: { flexDirection: 'row', alignItems: 'center', marginTop: 8, backgroundColor: '#EEF2FF', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 8 },
  badgeText: { fontSize: 13, color: '#6366F1', fontWeight: '600' },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#64748B' },
  list: { flex: 1 },
  listContent: { paddingBottom: 8 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 10, shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardAccent: { width: 4, height: 32, borderRadius: 2, backgroundColor: ACCENT, marginRight: 14 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
  cardId: { fontSize: 13, color: '#94A3B8', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  cardArrow: { fontSize: 24, color: '#94A3B8', fontWeight: '300' },
  footer: { flexDirection: 'row', gap: 10, paddingVertical: 16, paddingBottom: 32 },
  backBtn: { flex: 1, backgroundColor: '#6366F1', borderRadius: 14, paddingVertical: 14, alignItems: 'center', shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  btnPressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
  backBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  logoutBtn: { backgroundColor: '#FEE2E2', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center', borderWidth: 1, borderColor: '#FECACA' },
  logoutBtnPressed: { backgroundColor: '#FECACA' },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#DC2626' },
  errorText: { color: '#DC2626', fontSize: 15, textAlign: 'center', padding: 20 },
  emptyText: { color: '#64748B', fontSize: 15, textAlign: 'center' },
});
