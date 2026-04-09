import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform } from 'react-native';
import { auth } from '../fireBaseConfig.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { fetchUserRole, isAdmin } from '../utils/userRole';

const menuItems = [
  { label: 'Gerer les jeux', route: 'gererLesJeux', accent: '#10B981', adminOnly: false },
  { label: 'Gerer les genres', route: 'gererLesGenres', accent: '#3B82F6', adminOnly: false },
  { label: 'Gerer les activites', route: 'gererLesActivites', accent: '#0EA5E9', adminOnly: false },
  { label: 'Carte & distance', route: 'carteDistance', accent: '#14B8A6', adminOnly: false },
  { label: 'Jeu gyroscope', route: 'jeuGyroscope', accent: '#F43F5E', adminOnly: false },
  { label: 'Gerer les PEGI', route: 'gererLesPegis', accent: '#F97316', adminOnly: true },
  { label: 'Gerer les marques', route: 'gererLesMarques', accent: '#EC4899', adminOnly: true },
  { label: 'Gerer les plateformes', route: 'gererLesPlateformes', accent: '#8B5CF6', adminOnly: true },
];

// Le menu principal : le carrefour de toutes les routes 
export default function Menu({ navigation }) {
  const [role, setRole] = useState<string | null>(null);
  const [authUid, setAuthUid] = useState<string | null>(null);

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
        setAuthUid(null);
        navigation.replace('pageConnexion');
        return;
      }
      setAuthUid(user.uid);
      const r = await fetchUserRole(user.uid, user.email);
      setRole(r);
    });
    return () => unsubscribe();
  }, [navigation]);

  const visibleMenuItems = menuItems.filter((item) => !item.adminOnly || isAdmin(role));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {auth.currentUser?.email}
            {isAdmin(role) ? ' (admin)' : ' (utilisateur)'}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {visibleMenuItems.map((item, index) => (
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
        style={({ pressed }) => [styles.scanBtn, pressed && styles.scanBtnPressed]}
        onPress={() => navigation.navigate('scanQr')}
      >
        <Text style={styles.scanText}>Scanner un QR</Text>
      </Pressable>

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
  badgeText: {
    fontSize: 13,
    color: '#6366F1',
    fontWeight: '600',
  },
  uidHint: {
    marginTop: 10,
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  uidMono: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: 11,
    color: '#334155',
  },
  uidHelp: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
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
  scanBtn: {
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  scanBtnPressed: {
    backgroundColor: '#E0E7FF',
  },
  scanText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4338CA',
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
