import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { PaperProvider } from 'react-native-paper';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';

import OnboardingScreen from './screen/OnboardingScreen';
import LoginSignupScreen from './screen/LoginSignupScreen';
import GatekeepingScreen from './screen/GatekeepingScreen';
import MainTabs from './screen/MainTabs';
import { supabase } from './lib/supabase';
import { COLORS, paperTheme } from './theme';

const Stack = createStackNavigator();

// Pre-auth / pre-verification flow: Onboarding -> Login/Signup ->
// Gatekeeping (awaiting manual verification) -> Home (once verified).
// This is a plain stack — no persistent nav chrome — because none of
// Onboarding/Login/Gatekeeping should be reachable once a user is
// authenticated and verified. Once the real app exists, Home becomes the
// entry point into a separate tab navigator (Meetings / Slots / New /
// Links / Profile, per the design); for now it's an intentionally blank
// screen that only exists so verification has somewhere to route to.
export default function App() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  // Supabase (via AsyncStorage) does persist the session across app
  // restarts on its own — this just reads that back on launch, and also
  // checks the matching Users.verified flag, so a returning verified user
  // lands on Home instead of Gatekeeping (or Onboarding).
  const [initialRoute, setInitialRoute] = useState(null); // null = still checking

  useEffect(() => {
    let cancelled = false;

    async function resolveInitialRoute(session) {
      if (!session) {
        if (!cancelled) setInitialRoute('Onboarding');
        return;
      }
      const { data: userRow } = await supabase
        .from('Users')
        .select('verified')
        .eq('uid', session.user.id)
        .maybeSingle();
      if (!cancelled) setInitialRoute(userRow?.verified ? 'Home' : 'Gatekeeping');
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      resolveInitialRoute(session);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      resolveInitialRoute(session);
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, []);

  if (!fontsLoaded || initialRoute === null) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer>
        <Stack.Navigator
          // `key` forces the navigator to remount (and re-evaluate
          // initialRouteName) whenever the resolved route changes —
          // otherwise signing out (or getting verified) from deep in the
          // stack wouldn't bounce to the right screen, since
          // initialRouteName is only read on first mount.
          key={initialRoute}
          initialRouteName={initialRoute}
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: COLORS.background },
          }}
        >
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Login / Signup" component={LoginSignupScreen} />
          <Stack.Screen name="Gatekeeping" component={GatekeepingScreen} />
          <Stack.Screen name="Home" component={MainTabs} />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="dark" />
    </PaperProvider>
  );
}
