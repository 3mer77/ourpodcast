import MiniPlayer from '@/components/MiniPlayer';
import { AuthProvider } from '@/context/AuthContext';
import { SubscriptionProvider } from '@/context/Subscriptioncontext';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'IBMPlex-Regular': require('../assets/fonts/IBMPlexSansArabic-Regular.ttf'),
    'IBMPlex-Medium': require('../assets/fonts/IBMPlexSansArabic-Medium.ttf'),
    'IBMPlex-Bold': require('../assets/fonts/IBMPlexSansArabic-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <ActivityIndicator color="#0bd46c" />
      </View>
    );
  }

  return (
    // ✅ Auth wraps everything
    // ✅ Subscription wraps inside Auth so it can access user ID
    <AuthProvider>
      <SubscriptionProvider>
        <View style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }} />
          <MiniPlayer />
        </View>
      </SubscriptionProvider>
    </AuthProvider>
  );
}