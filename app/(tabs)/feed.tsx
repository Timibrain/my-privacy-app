import { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../utils/supabase';
import { Button } from '../../components/Button';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { TouchableOpacity } from 'react-native'

// Define what a "Post" looks like
type Post = {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    profiles: { username: string } | null; // We join this data
};

export default function FeedScreen() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [newPostText, setNewPostText] = useState('');
    const [loading, setLoading] = useState(false);

    // 1. Load posts when screen opens
    useEffect(() => {
        fetchPosts();
    }, []);

    async function fetchPosts() {
        setLoading(true);
        const { data, error } = await supabase
            .from('posts')
            .select('*, profiles(username)') // MAGIC: Get the username too!
            .order('created_at', { ascending: false });

        if (error) Alert.alert("Error", error.message);
        else if (data) setPosts(data as any);

        setLoading(false);
    }

    async function createPost() {
        if (!newPostText.trim()) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return Alert.alert("Please log in first");

        const { error } = await supabase.from('posts').insert({
            content: newPostText,
            user_id: user.id,
        });

        if (error) {
            Alert.alert("Failed", error.message);
        } else {
            setNewPostText(''); // Clear box
            fetchPosts(); // Refresh list
        }
    }

    // The design for a single post card
    const renderPost = ({ item }: { item: Post }) => (
        <Link href={`/chat/${item.user_id}`} asChild>
            <TouchableOpacity>
                <View className="flex-row items-center mb-2">
                    <View className="h-8 w-8 bg-blue-100 rounded-full items-center justify-center mr-2">
                        <Text className="text-blue-600 font-bold">
                            {item.profiles?.username?.[0].toUpperCase() || "?"}
                        </Text>
                    </View>
                    <Text className="font-bold text-gray-800">
                        @{item.profiles?.username || "Anonymous"}
                    </Text>
                    <Text className="text-gray-400 text-xs ml-auto">
                        {/* We can keep the date here or move it outside the Touchable */}
                        Tap to Chat
                    </Text>
                </View>
            </TouchableOpacity>
        </Link>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="p-4 bg-white border-b border-gray-200">
                <Text className="text-2xl font-bold text-black mb-4">Public Feed</Text>

                {/* Post Creator Box */}
                <View className="flex-row gap-2">
                    <TextInput
                        className="flex-1 bg-gray-100 p-3 rounded-xl"
                        placeholder="What's on your mind?"
                        value={newPostText}
                        onChangeText={setNewPostText}
                    />
                    <Button
                        title="Post"
                        onPress={createPost}
                        className="w-20 bg-blue-600 py-2 px-0" // Compact button
                    />
                </View>
            </View>

            <FlatList
                data={posts}
                renderItem={renderPost}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 16 }}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={fetchPosts} />
                }
            />
        </SafeAreaView>
    );
}