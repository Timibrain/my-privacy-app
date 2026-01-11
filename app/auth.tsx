import { useState } from 'react';
import { View, Text, TextInput, Alert, AppState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '../utils/supabase'; // Import the file we made earlier
import { Button } from '../components/Button';

// Tells Supabase to NOT auto-refresh tokens while app is in background
AppState.addEventListener('change', (state) => {
    if (state === 'active') {
        supabase.auth.startAutoRefresh();
    } else {
        supabase.auth.stopAutoRefresh();
    }
});

export default function AuthScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Function to Create Account
    async function signUpWithEmail() {
        setLoading(true);
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) {
            Alert.alert("Sign Up Error", error.message);
        } else {
            Alert.alert("Success", "Check your email for the confirmation link!");
        }
        setLoading(false);
    }

    // Function to Login
    async function signInWithEmail() {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            Alert.alert("Login Failed", error.message);
        } else {
            // If successful, go back to Home
            Alert.alert("Success", "You are now logged in.");
            router.replace('/');
        }
        setLoading(false);
    }

    return (
        <SafeAreaView className="flex-1 bg-white p-6 justify-center">
            <Stack.Screen options={{ title: "Account", headerBackTitle: "Back" }} />

            <View className="gap-4">
                <Text className="text-3xl font-bold text-gray-900 mb-4">
                    Join the Network
                </Text>

                <View className="gap-2">
                    <Text className="text-gray-600 font-medium">Email</Text>
                    <TextInput
                        className="border border-gray-300 p-4 rounded-xl text-lg"
                        placeholder="anon@privacy.com"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                    />
                </View>

                <View className="gap-2">
                    <Text className="text-gray-600 font-medium">Password</Text>
                    <TextInput
                        className="border border-gray-300 p-4 rounded-xl text-lg"
                        placeholder="Strong password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        autoCapitalize="none"
                    />
                </View>

                <View className="mt-4 gap-4">
                    <Button
                        title={loading ? "Loading..." : "Sign In"}
                        onPress={signInWithEmail}
                        disabled={loading}
                    />

                    <Button
                        title="Create Account"
                        variant="secondary"
                        onPress={signUpWithEmail}
                        disabled={loading}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}