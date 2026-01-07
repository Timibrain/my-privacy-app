import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
// Make sure this path matches where you created your Button component
import { Button } from '../../components/Button'

export default function Home() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center p-6 gap-8">

        {/* Header */}
        <View className="items-center gap-2">
          <Text className="text-4xl font-bold text-black">
            Privacy App
          </Text>
          <Text className="text-lg text-gray-500">
            Secure. Fast. Private.
          </Text>
        </View>

        {/* Buttons */}
        <View className="w-full gap-4">
          <Button
            title="Authenticate"
            onPress={() => console.log("Auth Pressed")}
          />

          <Link href="/modal" asChild>
            <Button title="Open Info" variant="secondary" />
          </Link>
        </View>

      </View>
    </SafeAreaView>
  );
}