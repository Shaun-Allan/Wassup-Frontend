import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';
import { UserProvider } from '../context/UserContext';

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <PaperProvider>
      <UserProvider>
        <Stack initialRouteName='login'>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="dm" options={{ headerShown: false }} />
          <Stack.Screen name="create-group" options={{ headerShown: false }} />
          <Stack.Screen name="groupchat" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </UserProvider>
    </PaperProvider>
  );
}
