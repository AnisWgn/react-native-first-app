import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Button } from 'react-native';
import { auth } from '../fireBaseConfig.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// Le menu principal : le carrefour de toutes les routes (comme un hub mais en mieux)
export default function Menu({ navigation }) {
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
      if (!user) {
        navigation.replace('page1');
      }
    });
    return () => unsubscribe();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Menu</Text>
      <Text style={styles.textStyle}>Connecté : {auth.currentUser?.email}</Text>

      <Pressable style={styles.menuItem} onPress={() => navigation.navigate('page2')}>
        <Text style={styles.menuText}>Liste des desserts</Text>
      </Pressable>
      <Pressable style={styles.menuItem} onPress={() => navigation.navigate('gererLesJeux')}>
        <Text style={styles.menuText}>Gérer les jeux</Text>
      </Pressable>
      <Pressable style={styles.menuItem} onPress={() => navigation.navigate('gererLesGenres')}>
        <Text style={styles.menuText}>Gérer les genres</Text>
      </Pressable>
      <Pressable style={styles.menuItem} onPress={() => navigation.navigate('gererLesPegis')}>
        <Text style={styles.menuText}>Gérer les PEGI</Text>
      </Pressable>
      <Pressable style={styles.menuItem} onPress={() => navigation.navigate('gererLesMarques')}>
        <Text style={styles.menuText}>Gérer les marques</Text>
      </Pressable>
      <Pressable style={styles.menuItem} onPress={() => navigation.navigate('gererLesPlateformes')}>
        <Text style={styles.menuText}>Gérer les plateformes</Text>
      </Pressable>

      <Button color="#b00020" title="Quitter" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 12,
    backgroundColor: '#F2F6F4',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  textStyle: {
    fontSize: 15,
    textAlign: 'center',
    color: 'black',
    padding: 12,
    marginBottom: 20,
  },
  menuItem: {
    width: '80%',
    padding: 16,
    marginVertical: 8,
    backgroundColor: 'gray',
    borderRadius: 12,
    alignItems: 'center',
  },
  menuText: {
    color: 'white',
    fontSize: 16,
  },
});
