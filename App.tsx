import React, { useCallback } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import ConnexionScreen from './screens/connexion';
import MenuScreen from './screens/menu';

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

// Chargement différé des écrans grâce à React.lazy le GOAT 🐐 (no cap, best perf ever)
const GererLesJeuxScreen = React.lazy(() => import('./screens/gererLesJeux'));
const DetailJeuScreen = React.lazy(() => import('./screens/detailJeu'));
const EditJeuScreen = React.lazy(() => import('./screens/editJeu'));
const GererLesGenresScreen = React.lazy(() => import('./screens/gererLesGenres'));
const DetailGenreScreen = React.lazy(() => import('./screens/detailGenre'));
const EditGenreScreen = React.lazy(() => import('./screens/editGenre'));
const GererLesPegisScreen = React.lazy(() => import('./screens/gererLesPegis'));
const DetailPegiScreen = React.lazy(() => import('./screens/detailPegi'));
const EditPegiScreen = React.lazy(() => import('./screens/editPegi'));
const GererLesMarquesScreen = React.lazy(() => import('./screens/gererLesMarques'));
const DetailMarqueScreen = React.lazy(() => import('./screens/detailMarque'));
const EditMarqueScreen = React.lazy(() => import('./screens/editMarque'));
const GererLesPlateformesScreen = React.lazy(() => import('./screens/gererLesPlateformes'));
const DetailPlateformeScreen = React.lazy(() => import('./screens/detailPlateforme'));
const EditPlateformeScreen = React.lazy(() => import('./screens/editPlateforme'));

function MainStack() {
  return (
    <Stack.Navigator id="main-stack" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="page1" component={ConnexionScreen} />
      <Stack.Screen name="pageMenu" component={MenuScreen} />
      <Stack.Screen name="gererLesJeux" component={GererLesJeuxScreen} />
      <Stack.Screen name="detailJeu" component={DetailJeuScreen} />
      <Stack.Screen name="editJeu" component={EditJeuScreen} />
      <Stack.Screen name="gererLesGenres" component={GererLesGenresScreen} />
      <Stack.Screen name="detailGenre" component={DetailGenreScreen} />
      <Stack.Screen name="editGenre" component={EditGenreScreen} />
      <Stack.Screen name="gererLesPegis" component={GererLesPegisScreen} />
      <Stack.Screen name="detailPegi" component={DetailPegiScreen} />
      <Stack.Screen name="editPegi" component={EditPegiScreen} />
      <Stack.Screen name="gererLesMarques" component={GererLesMarquesScreen} />
      <Stack.Screen name="detailMarque" component={DetailMarqueScreen} />
      <Stack.Screen name="editMarque" component={EditMarqueScreen} />
      <Stack.Screen name="gererLesPlateformes" component={GererLesPlateformesScreen} />
      <Stack.Screen name="detailPlateforme" component={DetailPlateformeScreen} />
      <Stack.Screen name="editPlateforme" component={EditPlateformeScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const onReady = useCallback(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <NavigationContainer onReady={onReady}>
      <React.Suspense fallback={
        <View style={loadingStyles.container}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={loadingStyles.text}>Chargement...</Text>
        </View>
      }>
        <MainStack />
      </React.Suspense>
    </NavigationContainer>
  );
}

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  text: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
});
