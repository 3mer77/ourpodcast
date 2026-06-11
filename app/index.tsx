import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import './global.css';

export default function Index() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    const check = async () => {
      const onboardingDone = await AsyncStorage.getItem('onboardingDone');

      if (onboardingDone !== 'true') {
        router.replace('/onboarding');
        return;
      }

      // ✅ onboarding done — go to tabs regardless of auth
      // auth is checked per-screen (e.g. Player uses useRequireAuth)
      router.replace('/(tabs)');
    };

    check();
  }, [user, loading]);

  return (
    <View style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator color="green" />
    </View>
  );
}