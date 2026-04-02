import React, { useCallback, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';

import ConnexionScreen from './screens/connexion';
import MenuScreen from './screens/menu';
import GererLesJeuxScreen from './screens/gerer/gererLesJeux';
import DetailJeuScreen from './screens/detail/detailJeu';
import EditJeuScreen from './screens/edit/editJeu';
import GererLesGenresScreen from './screens/gerer/gererLesGenres';
import DetailGenreScreen from './screens/detail/detailGenre';
import EditGenreScreen from './screens/edit/editGenre';
import GererLesPegisScreen from './screens/gerer/gererLesPegis';
import DetailPegiScreen from './screens/detail/detailPegi';
import EditPegiScreen from './screens/edit/editPegi';
import GererLesMarquesScreen from './screens/gerer/gererLesMarques';
import DetailMarqueScreen from './screens/detail/detailMarque';
import EditMarqueScreen from './screens/edit/editMarque';
import GererLesPlateformesScreen from './screens/gerer/gererLesPlateformes';
import DetailPlateformeScreen from './screens/detail/detailPlateforme';
import EditPlateformeScreen from './screens/edit/editPlateforme';

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

function MainStack() {
  return (
    <Stack.Navigator id="main-stack" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="pageConnexion" component={ConnexionScreen} />
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
  const hideSplash = useCallback(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    hideSplash();
  }, [hideSplash]);

  return (
    <NavigationContainer onReady={hideSplash}>
      <MainStack />
    </NavigationContainer>
  );
}
