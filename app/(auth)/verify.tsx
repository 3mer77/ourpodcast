import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const VerifyScreen = () => (
    <View style={styles.safe}>
        <View style={styles.container}>

            <View style={styles.iconCircle}>
                <Ionicons name="mail-outline" size={48} color="#F5C842" />
            </View>

            <Text style={styles.title}>تحقق من بريدك الإلكتروني</Text>

            <Text style={styles.body}>
                أرسلنا لك رابط تأكيد على بريدك الإلكتروني.{'\n'}
                افتح البريد الإلكتروني واضغط على الرابط للتحقق من حسابك.
            </Text>

            <Text style={styles.note}>
                بعد التحقق، عُد إلى التطبيق وسجّل دخولك.
            </Text>

            {/* Go to login */}
            <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => router.replace('/(auth)/login')}
            >
                <Text style={styles.primaryBtnText}>تسجيل الدخول</Text>
            </TouchableOpacity>

        </View>
    </View>
);

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#000000',
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        gap: 16,
    },
    iconCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: '#1A1A1A',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
    },
    body: {
        color: '#888',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
    },
    note: {
        color: '#555',
        fontSize: 13,
        textAlign: 'center',
    },
    primaryBtn: {
        backgroundColor: '#F5C842',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 40,
        alignItems: 'center',
        marginTop: 8,
    },
    primaryBtnText: {
        color: '#1A1A00',
        fontSize: 15,
        fontWeight: '700',
    },
});

export default VerifyScreen;