import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

const Header = () => {
    const { user } = useAuth();
    const insets = useSafeAreaInsets();

    const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
    const email     = user?.email ?? '';
    const initial   = email.charAt(0).toUpperCase();

    return (
        <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
            {/* Logo */}
            <Text style={styles.logo}>بودكاست</Text>

            {/* Right — avatar or login */}
            {user ? (
                <TouchableOpacity
                    onPress={() => router.push('/(tabs)/profile')}
                    style={styles.avatarBtn}
                    activeOpacity={0.8}
                >
                    {avatarUrl ? (
                        <Image
                            source={{ uri: avatarUrl }}
                            style={styles.avatarImage}
                        />
                    ) : (
                        <View style={styles.avatarFallback}>
                            <Text style={styles.avatarInitial}>{initial}</Text>
                        </View>
                    )}
                    <View style={styles.onlineDot} />
                </TouchableOpacity>
            ) : (
                <TouchableOpacity
                    style={styles.loginBtn}
                    onPress={() => router.push('/(auth)/login')}
                >
                    <Text style={styles.loginText}>تسجيل الدخول</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 12,
        backgroundColor: '#000000',
    },
    logo: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '700',
        fontFamily: 'IBMPlex-Bold',
    },
    avatarBtn: {
        position: 'relative',
    },
    avatarImage: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: '#0bd46c',
    },
    avatarFallback: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#1A1A1A',
        borderWidth: 2,
        borderColor: '#0bd46c',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitial: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    onlineDot: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#0bd46c',
        borderWidth: 2,
        borderColor: '#000000',
    },
    loginBtn: {
        backgroundColor: '#1A1A1A',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderWidth: 0.5,
        borderColor: '#2A2A2A',
    },
    loginText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '500',
    },
});

export default Header;