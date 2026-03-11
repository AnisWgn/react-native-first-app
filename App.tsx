import React, { useCallback } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import Page1Screen from './screens/App';
import Page3Screen from './screens/page3';


// Empêche le splash de se cacher automatiquement
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

// Chargement différé de la page 2 (Firebase) pour ne pas bloquer le démarrage
const Page2Screen = React.lazy(() => import('./screens/page2'));

function MainStack() {
  return (
    <Stack.Navigator id="main-stack" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="page1" component={Page1Screen} />
      <Stack.Screen name="page2" component={Page2Screen} />
      <Stack.Screen name="page3" component={Page3Screen} />
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
