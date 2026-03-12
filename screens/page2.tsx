import React, {useEffect, useState} from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, ActivityIndicator, TouchableOpacity, Button } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../fireBaseConfig.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// Liste des desserts : quand Firestore et le sucre font bon ménage 🍰
export default function Page2Screen({navigation, route}) {
    const [desserts, setDesserts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigation.replace('page1');
        } catch (err) {
            console.log('Erreur déconnexion :', err);
        }
    };

    useEffect(() => {
        const fetchDesserts = async () => {
            try {
                setLoading(true);
                setError(null);
                const dessertsRef = collection(db, '1');
                const dessertsSnapshot = await getDocs(dessertsRef);
                const dessertsList = dessertsSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setDesserts(dessertsList);
            } catch (err) {
                console.error('Erreur Firestore:', err);
                setError(err.message || 'Impossible de charger les desserts');
            } finally {
                setLoading(false);
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                navigation.replace('page1');
            } else {
                fetchDesserts();
            }
        });

        return () => unsubscribe();
    }, [navigation]);

    return (
        <View style={styles.viewStyle}>
            <Text style={styles.textStyle}>Connecté : {auth.currentUser?.email}</Text>
            <Text style={styles.title}>Liste des desserts</Text>
            {loading ? (
                <ActivityIndicator size="large" style={{ marginVertical: 20 }} />
            ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : desserts.length === 0 ? (
                <Text style={styles.emptyText}>Aucun dessert dans la collection "1"</Text>
            ) : (
            <FlatList
                style={styles.list}
                data={desserts}
                keyExtractor={(item, index) => item.id ?? item.idDesserts?.toString() ?? index.toString()}
                renderItem={({item}) => (
                    <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('page3', { dessert: item })}>
                        <Text style={styles.cardTitle}>{item.libelleDesserts}</Text>
                        <Text style={styles.cardSubtitle}>Id : {item.idDesserts}</Text>
                    </TouchableOpacity>
                )}
            />
            )}
            <Pressable
                style={styles.buttonStyle}
                onPress={() => navigation.navigate('pageMenu')}
            >
                <Text style={styles.buttonText}>Retour au menu</Text>
            </Pressable>
            <Button color="#b00020" title="Quitter" onPress={handleLogout} />
        </View>
    );
}


const styles = StyleSheet.create({
    viewStyle: {
        flex: 1,
        paddingTop: 50,
        paddingHorizontal: 12,
        backgroundColor: '#F2F6F4',
        alignItems: 'center',
    },
    list: {
        flex: 1,
        width: '100%',
    },
    errorText: {
        color: 'red',
        padding: 20,
        textAlign: 'center',
    },
    emptyText: {
        color: '#666',
        padding: 20,
        textAlign: 'center',
    },
    textStyle: {
        fontSize: 15,
        textAlign: 'center',
        color: 'black',
        padding: 12,
    },
    buttonStyle:{
        width: '80%',
        height: 45,
        borderRadius: 12,
        backgroundColor: 'gray',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 12,
        marginVertical: 8,
    },
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    item: {
    fontSize: 18, 
    marginBottom: 10,
    color: '#333',
    },
    card: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#666',
    },
});