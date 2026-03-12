import React, { useEffect } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { auth } from "../fireBaseConfig.js";
import { onAuthStateChanged, signOut } from "firebase/auth";

// Détail d'un dessert : la page où on salive devant les infos (sans les calories en plus, gg)
export default function DessertDetail({ route, navigation }) {
  const { dessert } = route.params;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace("page1");
    } catch (err) {
      console.log("Erreur déconnexion :", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigation.replace("page1");
      }
    });
    return () => unsubscribe();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{dessert.libelleDesserts}</Text>
      <Text style={styles.text}>ID : {dessert.idDesserts}</Text>
      <Button color="gray" title="Retour à la liste" onPress={() => navigation.goBack()} />
      <Button color="#b00020" title="Quitter" onPress={handleLogout} />
    </View>
  );
}
const styles = StyleSheet.create({
container: {
flex: 1,
paddingTop: 50,
paddingHorizontal: 12,
alignItems: "center",
backgroundColor: "lightgreen",
justifyContent: "center",
},
title: {
fontSize: 26,
fontWeight: "bold",
marginBottom: 20,
},
text: {
fontSize: 18,
marginBottom: 40,
},
});