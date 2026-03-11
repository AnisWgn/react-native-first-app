import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
export default function DessertDetail({ route, navigation }) {
const { dessert } = route.params;
return (
<View style={styles.container}>
<Text style={styles.title}>{dessert.libelleDesserts}</Text>
<Text style={styles.text}>ID : {dessert.idDesserts}</Text>
<Button color="gray" title="Retour à la liste" onPress={() => navigation.goBack()} />
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