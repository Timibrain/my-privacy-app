import { useState, useEffect, useRef } from 'react';
import { View, Text, Alert, AppState, AppStateStatus } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import { Link } from 'expo-router';
import { Button } from '../../components/Button';
import { Ionicons } from '@expo/vector-icons';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Keep track of the current app state (active/background)
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // 1. Initial Auth on Load
    authenticate();

    // 2. NEW: Auto-Lock Listener
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/active/) &&
        (nextAppState === 'background' || nextAppState === 'inactive')
      ) {
        // App went to background -> LOCK IT
        console.log("App backgrounded. Locking...");
        setIsAuthenticated(false);
      }

      // If app comes back to foreground, we could optionally auto-prompt again
      // but for now, we just force them to tap the "Unlock" button.

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const authenticate = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        // Fallback for simulators without FaceID setup
        setIsAuthenticated(true);
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Privacy App',
        fallbackLabel: 'Enter Passcode',
      });

      if (result.success) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // --- RENDER LOCKED STATE ---
  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
        <View className="items-center gap-6">
          <Ionicons name="lock-closed" size={80} color="#dc2626" />
          <Text className="text-2xl font-bold text-gray-900">
            App Locked
          </Text>
          <Text className="text-gray-500 text-center">
            Your content is hidden while the app is in the background.
          </Text>
          <Button
            title="Tap to Unlock"
            onPress={authenticate}
            className="bg-red-600 w-48"
          />
        </View>
      </SafeAreaView>
    );
  }

  // --- RENDER UNLOCKED CONTENT ---
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center p-6 gap-8">

        <View className="items-center gap-2">
          <Ionicons name="lock-open" size={50} color="#16a34a" />
          <Text className="text-4xl font-bold text-black text-center">
            Privacy App
          </Text>
          <Text className="text-lg text-gray-500">
            Secure Session Active
          </Text>
        </View>

        <View className="w-full gap-4">
          <Link href="/modal" asChild>
            <Button title="View Secrets" />
          </Link>

          <Button
            title="Lock Now"
            variant="secondary"
            onPress={() => setIsAuthenticated(false)}
          />
        </View>

      </View>
    </SafeAreaView>
  );
}