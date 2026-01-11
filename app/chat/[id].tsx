import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../utils/supabase';
import { Button } from '../../components/Button';
import CryptoJS from 'crypto-js'; // We use the library we installed earlier!

type Message = {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    created_at: string;
};

export default function ChatScreen() {
    const { id: receiverId } = useLocalSearchParams(); // Get the other user's ID
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [secretKey, setSecretKey] = useState(''); // The "PIN" for this chat
    const [isKeySet, setIsKeySet] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const [myId, setMyId] = useState('');

    // 1. Setup: Get my ID and start listening
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) {
                setMyId(data.user.id);
                fetchMessages(data.user.id);
                subscribeToMessages(data.user.id);
            }
        });
    }, []);

    // 2. Fetch old messages
    async function fetchMessages(userId: string) {
        const { data } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${userId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${userId})`)
            .order('created_at', { ascending: true });

        if (data) setMessages(data);
    }

    // 3. Real-time Subscription (Live Chat!)
    function subscribeToMessages(userId: string) {
        supabase
            .channel('chat-room')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
                const newMessage = payload.new as Message;
                // Only add if it belongs to this conversation
                if (
                    (newMessage.sender_id === userId && newMessage.receiver_id === receiverId) ||
                    (newMessage.sender_id === receiverId && newMessage.receiver_id === userId)
                ) {
                    setMessages((prev) => [...prev, newMessage]);
                    // Scroll to bottom
                    setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
                }
            })
            .subscribe();
    }

    // 4. Send Encrypted Message
    async function sendMessage() {
        if (!inputText.trim()) return;

        // ENCRYPT HERE
        const encrypted = CryptoJS.AES.encrypt(inputText, secretKey).toString();

        const { error } = await supabase.from('messages').insert({
            sender_id: myId,
            receiver_id: receiverId,
            content: encrypted, // We send the scrambled text
        });

        if (error) Alert.alert("Error", error.message);
        else setInputText('');
    }

    // 5. Decrypt Helper
    function getDecryptedText(cipherText: string) {
        if (!isKeySet) return "🔒 Enter Key to Decrypt";
        try {
            const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
            const originalText = bytes.toString(CryptoJS.enc.Utf8);
            return originalText || "⛔ Wrong Key";
        } catch (e) {
            return "⛔ Wrong Key";
        }
    }

    // --- RENDER ---

    // State 1: Ask for the Secret Key first
    if (!isKeySet) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center p-6 gap-4">
                <Stack.Screen options={{ title: "Secure Channel" }} />
                <Text className="text-2xl font-bold text-center">🔐 Enter Secret Key</Text>
                <Text className="text-gray-500 text-center">
                    To read and write messages in this chat, enter the shared secret code you agreed upon with this user.
                </Text>
                <TextInput
                    className="border border-gray-300 p-4 rounded-xl text-center text-xl"
                    placeholder="e.g. 'BlueSky'"
                    value={secretKey}
                    onChangeText={setSecretKey}
                    secureTextEntry
                />
                <Button title="Enter Chat" onPress={() => setIsKeySet(true)} disabled={!secretKey} />
            </SafeAreaView>
        );
    }

    // State 2: The Chat Room
    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom', 'left', 'right']}>
            <Stack.Screen options={{ title: "Private Chat" }} />

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16, gap: 12 }}
                renderItem={({ item }) => {
                    const isMe = item.sender_id === myId;
                    return (
                        <View className={`p-3 rounded-2xl max-w-[80%] ${isMe ? 'bg-blue-600 self-end' : 'bg-gray-200 self-start'}`}>
                            <Text className={isMe ? 'text-white' : 'text-gray-900'}>
                                {getDecryptedText(item.content)}
                            </Text>
                        </View>
                    );
                }}
            />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={100}>
                <View className="flex-row p-4 bg-white border-t border-gray-200 gap-2">
                    <TextInput
                        className="flex-1 bg-gray-100 p-3 rounded-xl"
                        placeholder="Type a secure message..."
                        value={inputText}
                        onChangeText={setInputText}
                    />
                    <Button title="Send" onPress={sendMessage} className="w-20" />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}