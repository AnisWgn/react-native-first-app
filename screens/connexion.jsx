import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useState } from 'react';
import { auth } from '../fireBaseConfig.js';
import { signInWithEmailAndPassword } from 'firebase/auth';

// Ecran de connexion : l'entree VIP vers l'app (mot de passe oublie = skill issue)
export default function ConnexionScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    if (!trimmedEmail || !trimmedPassword) {
      Alert.alert('Champs requis', 'Renseigne ton email et ton mot de passe.');
      return;
    }
    setLoading(true);
    signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword)
      .then(() => {
        navigation.navigate('pageMenu');
      })
      .catch((error) => {
        Alert.alert('Erreur de connexion', error.message || String(error));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>GG</Text>
          <Text style={styles.appName}>GameGestion</Text>
          <Text style={styles.tagline}>Votre dashboard gaming</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Connexion</Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="dev@gamesgestion.io"
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
            editable={!loading}
          />

          <Text style={styles.label}>Mot de passe</Text>
          <TextInput
            placeholder="••••••••"
            placeholderTextColor="#94A3B8"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            editable={!loading}
            onSubmitEditing={handleLogin}
            returnKeyType="go"
          />

          <Pressable
            style={({ pressed }) => [
              styles.button,
              (pressed || loading) && styles.buttonPressed,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Se connecter</Text>
            )}
          </Pressable>
        </View>

        <Text style={styles.footer}>Propulse par Firebase & React Native</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 40,
    fontWeight: '900',
    color: '#6366F1',
    letterSpacing: 4,
    marginBottom: 4,
  },
  appName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
    marginLeft: 4,
  },
  input: {
    width: '100%',
    height: 48,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 15,
    color: '#1E293B',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#6366F1',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonPressed: {
    backgroundColor: '#4F46E5',
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.85,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 32,
  },
});
