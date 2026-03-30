import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import type { Session } from "@supabase/supabase-js";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider, useApp } from "@/contexts/AppContext";
import { supabase } from "@/lib/supabase";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootNavigation({ session }: { session: Session | null }) {
  const { isSetupComplete } = useApp();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const inSetup = segments[0] === "setup";
    const inLogin = segments[0] === "login";

    if (!session) {
      // Not logged in — go to login
      if (!inLogin) router.replace("/login");
    } else if (!isSetupComplete) {
      // Logged in, setup not done
      if (!inSetup) router.replace("/setup");
    } else {
      // Logged in and setup done — go to tabs
      if (inSetup || inLogin) router.replace("/(tabs)");
    }
  }, [session, isSetupComplete, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="setup" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [session, setSession] = useState<Session | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoaded(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && authLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, authLoaded]);

  if ((!fontsLoaded && !fontError) || !authLoaded) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AppProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <KeyboardProvider>
                <RootNavigation session={session} />
              </KeyboardProvider>
            </GestureHandlerRootView>
          </AppProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
