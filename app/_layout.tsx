import 'react-native-get-random-values';
import { useEffect, useState } from 'react';
import { AppState, View, Text } from 'react-native'; // <--- Import AppState
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import "../global.css";

export default function RootLayout() {
  const [isBackground, setIsBackground] = useState(false);

  useEffect(() => {
    // Listen for state changes (Active vs Background)
    const subscription = AppState.addEventListener('change', nextAppState => {
      // If the app is NOT active (background or inactive), show the curtain
      setIsBackground(nextAppState !== 'active');
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />

      {/* The Main App */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>

      {/* THE PRIVACY CURTAIN */}
      {/* This renders ON TOP of everything else when isBackground is true */}
      {isBackground && (
        <View className="absolute inset-0 bg-blue-600 items-center justify-center z-50">
          <Ionicons name="shield-checkmark" size={100} color="white" />
          <Text className="text-white text-2xl font-bold mt-4">
            Privacy App
          </Text>
          <Text className="text-blue-100 mt-2">
            Content Hidden
          </Text>
        </View>
      )}

    </SafeAreaProvider>
  );
}