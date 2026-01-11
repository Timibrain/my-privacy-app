import { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '../utils/supabase';
import { Button } from '../components/Button';

export default function ProfileScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [website, setWebsite] = useState('');

    // 1. Fetch Profile on Load
    useEffect(() => {
        getProfile();
    }, []);

    async function getProfile() {
        try {
            setLoading(true);
            // Get current user ID
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error("No user logged in!");

            // Select data from the 'profiles' table
            const { data, error, status } = await supabase
                .from('profiles')
                .select(`username, full_name`) // Add 'website' here if you added it to DB
                .eq('id', user.id)
                .single();

            if (error && status !== 406) {
                throw error;
            }

            if (data) {
                setUsername(data.username || '');
                setFullName(data.full_name || '');
            }
        } catch (error) {
            if (error instanceof Error) Alert.alert(error.message);
        } finally {
            setLoading(false);
        }
    }

    // 2. Update Profile
    async function updateProfile() {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user!");

            const updates = {
                id: user.id,
                username,
                full_name: fullName,
                updated_at: new Date(),
            };

            const { error } = await supabase.from('profiles').upsert(updates);

            if (error) throw error;
            Alert.alert("Success", "Profile updated!");
        } catch (error) {
            if (error instanceof Error) Alert.alert("Update failed", error.message);
        } finally {
            setLoading(false);
        }
    }

    // 3. Sign Out
    async function signOut() {
        await supabase.auth.signOut();
        router.replace('/auth'); // Go back to login screen
    }

    return (
        <SafeAreaView className="flex-1 bg-white p-6">
            <Stack.Screen options={{ title: "Your Profile" }} />

            <View className="gap-6 mt-4">
                {/* Header */}
                <View className="items-center">
                    <View className="h-24 w-24 bg-gray-200 rounded-full items-center justify-center mb-4">
                        <Text className="text-2xl text-gray-500">
                            {username ? username[0].toUpperCase() : "?"}
                        </Text>
                    </View>
                    <Text className="text-xl font-bold text-gray-900">
                        {loading ? "Loading..." : (fullName || "Anonymous")}
                    </Text>
                </View>

                {/* Form Fields */}
                <View className="gap-2">
                    <Text className="text-gray-600 font-medium">Username</Text>
                    <TextInput
                        className="border border-gray-300 p-4 rounded-xl text-lg bg-gray-50"
                        value={username}
                        onChangeText={setUsername}
                        placeholder="Choose a handle"
                    />
                </View>

                <View className="gap-2">
                    <Text className="text-gray-600 font-medium">Full Name</Text>
                    <TextInput
                        className="border border-gray-300 p-4 rounded-xl text-lg bg-gray-50"
                        value={fullName}
                        onChangeText={setFullName}
                        placeholder="Display Name"
                    />
                </View>

                {/* Actions */}
                <View className="mt-8 gap-4">
                    <Button
                        title={loading ? "Saving..." : "Update Profile"}
                        onPress={updateProfile}
                        disabled={loading}
                    />

                    <Button
                        title="Sign Out"
                        variant="secondary"
                        onPress={signOut}
                        className="bg-red-50"
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}