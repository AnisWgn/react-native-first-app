import React, { useCallback } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import Page1Screen from './screens/App';
import MenuScreen from './screens/menu';
import Page3Screen from './screens/page3';


SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

// Chargement différé des écrans grâce à React.lazy le GOAT 🐐 (no cap, best perf ever)
const Page2Screen = React.lazy(() => import('./screens/page2'));
const GererLesJeuxScreen = React.lazy(() => import('./screens/gererLesJeux'));
const DetailJeuScreen = React.lazy(() => import('./screens/detailJeu'));
const GererLesGenresScreen = React.lazy(() => import('./screens/gererLesGenres'));
const DetailGenreScreen = React.lazy(() => import('./screens/detailGenre'));
const GererLesPegisScreen = React.lazy(() => import('./screens/gererLesPegis'));
const DetailPegiScreen = React.lazy(() => import('./screens/detailPegi'));
const GererLesMarquesScreen = React.lazy(() => import('./screens/gererLesMarques'));
const DetailMarqueScreen = React.lazy(() => import('./screens/detailMarque'));
const GererLesPlateformesScreen = React.lazy(() => import('./screens/gererLesPlateformes'));
const DetailPlateformeScreen = React.lazy(() => import('./screens/detailPlateforme'));

function MainStack() {
  return (
    <Stack.Navigator id="main-stack" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="page1" component={Page1Screen} />
      <Stack.Screen name="pageMenu" component={MenuScreen} />
      <Stack.Screen name="page2" component={Page2Screen} />
      <Stack.Screen name="page3" component={Page3Screen} />
      <Stack.Screen name="gererLesJeux" component={GererLesJeuxScreen} />
      <Stack.Screen name="detailJeu" component={DetailJeuScreen} />
      <Stack.Screen name="gererLesGenres" component={GererLesGenresScreen} />
      <Stack.Screen name="detailGenre" component={DetailGenreScreen} />
      <Stack.Screen name="gererLesPegis" component={GererLesPegisScreen} />
      <Stack.Screen name="detailPegi" component={DetailPegiScreen} />
      <Stack.Screen name="gererLesMarques" component={GererLesMarquesScreen} />
      <Stack.Screen name="detailMarque" component={DetailMarqueScreen} />
      <Stack.Screen name="gererLesPlateformes" component={GererLesPlateformesScreen} />
      <Stack.Screen name="detailPlateforme" component={DetailPlateformeScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const onReady = useCallback(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <NavigationContainer onReady={onReady}>
      <React.Suspense fallback={<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" /></View>}>
        <MainStack />
      </React.Suspense>
    </NavigationContainer>
  );
}
