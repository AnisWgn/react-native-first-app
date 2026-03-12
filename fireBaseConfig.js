import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Firebase + AsyncStorage = le duo de choc pour persister les sessions (et éviter les "t'es qui déjà ?")
const firebaseConfig = {
  apiKey: "AIzaSyBBYpBBQM8dEiilMXqLCkqJH6S5SJ7hO7Q",
  authDomain: "my-first-react-native-67.firebaseapp.com",
  projectId: "my-first-react-native-67",
  storageBucket: "my-first-react-native-67.firebasestorage.app",
  messagingSenderId: "915528462319",
  appId: "1:915528462319:web:3ca706b1528f22e603d01a",
  measurementId: "G-VK5MES9QV5"
};


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); // La DB qui stocke tout (genres, jeux, marques... et les desserts du chef)
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage), // Pour que l'utilisateur reste connecté même après avoir fermé l'app (merci la vie)
});

export {auth};