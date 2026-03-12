import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Button } from 'react-native';
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
      console.log('Erreur déconnexion :', err);
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
      <Text style={styles.title}>Gérer les genres</Text>
      <Text style={styles.subtitle}>Connecté : {auth.currentUser?.email}</Text>
      {loading ? (
        <ActivityIndicator size="large" style={{ marginVertical: 20 }} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : genres.length === 0 ? (
        <Text style={styles.emptyText}>Aucun genre dans la collection</Text>
      ) : (
        <FlatList
          style={styles.list}
          data={genres}
          keyExtractor={(item, index) => item.id ?? index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => navigation.navigate('detailGenre', { genre: item })}
            >
              <Text style={styles.cardTitle}>{item.libelle ?? item.nom ?? item.id}</Text>
              <Text style={styles.cardSubtitle}>ID : {item.id}</Text>
            </TouchableOpacity>
          )}
        />
      )}
      <Button color="gray" title="Retour au menu" onPress={() => navigation.goBack()} />
      <Button color="#b00020" title="Quitter" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, paddingHorizontal: 12, backgroundColor: '#F2F6F4', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 14, marginBottom: 20, color: '#666' },
  list: { flex: 1, width: '100%' },
  item: { width: '100%', padding: 12, marginBottom: 8, backgroundColor: '#fff', borderRadius: 8 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: '#666' },
  errorText: { color: 'red', padding: 20, textAlign: 'center' },
  emptyText: { color: '#666', padding: 20, textAlign: 'center' },
});
