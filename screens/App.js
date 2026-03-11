import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, TextInput, Pressable, Alert } from 'react-native';
import { useState } from 'react';
import { auth } from '../fireBaseConfig.js';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function Page1Screen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handlelogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        navigation.navigate('page2', { email });
      })
      .catch((error) => {
        Alert.alert('Erreur', error.message);
      });
  }

  const afficheMessage = () => {
    alert(`Message envoyé \nEmail : ${email}`);
  };

  return (
    <View style={styles.container}>
      <Text>Connexion</Text>
      <TextInput
        placeholder="Adresse email"
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

      <Pressable style={styles.button} title="Se connecter" onPress={handlelogin}></Pressable>
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
