import React, { useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { auth } from '../fireBaseConfig.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// Détail d'une plateforme : PC master race, Switch, PS5... toutes égales ici (enfin presque)
export default function DetailPlateforme({ route, navigation }) {
  const { plateforme } = route.params;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('page1');
    } catch (err) {
      console.log('Erreur déconnexion :', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) navigation.replace('page1');
    });
    return () => unsubscribe();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{plateforme.libelle ?? plateforme.nom ?? plateforme.id}</Text>
      <Text style={styles.text}>ID : {plateforme.id}</Text>
      <Button color="gray" title="Retour à la liste" onPress={() => navigation.goBack()} />
      <Button color="#b00020" title="Quitter" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, paddingHorizontal: 12, alignItems: 'center', backgroundColor: '#E8EAF6', justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20 },
  text: { fontSize: 18, marginBottom: 40 },
});
