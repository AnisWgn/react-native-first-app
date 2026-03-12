import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, TextInput, Pressable, Alert } from 'react-native';
import { useState } from 'react';
import { auth } from '../fireBaseConfig.js';
import { signInWithEmailAndPassword } from 'firebase/auth';

// Écran de connexion : l'entrée VIP vers l'app (mot de passe oublié = skill issue)
export default function Page1Screen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        navigation.navigate('pageMenu');
      })
      .catch((error) => {
        Alert.alert('Erreur de connexion', error.message);
      });
  };

  return (
    <View style={styles.container}>
      <Text>Connexion</Text>
      <TextInput
        placeholder="Adresse e-mail"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
      />
      <TextInput
        placeholder="Mot de passe"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      <Pressable style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Se connecter</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F6F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    width: '80%',
    height: 45,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginVertical: 8,
  },
  image: {
    width: 100,
    height: 100,
    paddingVertical: 100,
  },
  button: {
    width: '80%',
    height: 45,
    backgroundColor: 'gray',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});
