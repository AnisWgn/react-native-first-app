import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { auth } from '../fireBaseConfig.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const menuItems = [
  { label: 'Gerer les jeux', route: 'gererLesJeux', accent: '#10B981' },
  { label: 'Gerer les genres', route: 'gererLesGenres', accent: '#3B82F6' },
  { label: 'Gerer les PEGI', route: 'gererLesPegis', accent: '#F97316' },
  { label: 'Gerer les marques', route: 'gererLesMarques', accent: '#EC4899' },
  { label: 'Gerer les plateformes', route: 'gererLesPlateformes', accent: '#8B5CF6' },
];

// Le menu principal : le carrefour de toutes les routes (comme un hub mais en mieux)
export default function Menu({ navigation }) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('page1');
    } catch (err) {
      console.log('Erreur deconnexion :', err);
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
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>{auth.currentUser?.email}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {menuItems.map((item, index) => (
          <Pressable
            key={index}
            style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
            onPress={() => navigation.navigate(item.route)}
          >
            <View style={[styles.menuAccent, { backgroundColor: item.accent }]} />
            <Text style={styles.menuText}>{item.label}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </Pressable>
        ))}
      </ScrollView>

      <Pressable
        style={({ pressed }) => [styles.logoutBtn, pressed && styles.logoutBtnPressed]}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Deconnexion</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: 0.5,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#EEF2FF',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  badgeText: {
    fontSize: 13,
    color: '#6366F1',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItemPressed: {
    backgroundColor: '#F1F5F9',
    transform: [{ scale: 0.98 }],
  },
  menuAccent: {
    width: 4,
    height: 28,
    borderRadius: 2,
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  menuArrow: {
    fontSize: 24,
    color: '#94A3B8',
    fontWeight: '300',
  },
  logoutBtn: {
    backgroundColor: '#FEE2E2',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutBtnPressed: {
    backgroundColor: '#FECACA',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#DC2626',
  },
});
