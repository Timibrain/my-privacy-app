import { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Link, useRouter } from 'expo-router';
import { Button } from '../components/Button';
import { saveSecret, getSecret, deleteSecret } from '../utils/storage';

export default function ModalScreen() {
  const router = useRouter();
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load the secret when the modal opens
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const savedNote = await getSecret();
    if (savedNote) {
      setNote(savedNote);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    await saveSecret(note);
    Alert.alert("Success", "Your secret has been encrypted and saved.");
    Keyboard.dismiss();
  };

  const handleClear = async () => {
    await deleteSecret();
    setNote('');
    Alert.alert("Deleted", "The secret has been wiped from secure storage.");
  };

  return (
    // Dismiss keyboard when tapping outside
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-gray-50 dark:bg-gray-900 p-6">
        <StatusBar style="light" />

        <View className="items-center mb-6">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            Secret Notes
          </Text>
          <Text className="text-gray-500">
            Encrypted with device hardware
          </Text>
        </View>

        {/* The Input Area */}
        <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 h-64">
          <TextInput
            className="text-lg text-gray-800 h-full"
            multiline
            placeholder="Type your secrets here..."
            placeholderTextColor="#9ca3af"
            value={note}
            onChangeText={setNote}
            textAlignVertical="top" // Important for Android multiline
          />
        </View>

        {/* Action Buttons */}
        <View className="gap-4">
          <Button
            title="Save Encrypted"
            onPress={handleSave}
          />

          <Button
            title="Wipe Data"
            variant="secondary"
            onPress={handleClear}
            className="bg-red-100" // Optional override for red tint
          />

          <Button
            title="Close"
            variant="secondary"
            onPress={() => router.back()}
          />
        </View>

      </View>
    </TouchableWithoutFeedback>
  );
}