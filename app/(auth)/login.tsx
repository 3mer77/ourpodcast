import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const LoginScreen = () => {
    const { signInWithEmail, signInWithGoogle, authLoading, error, clearError } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);

    const handleLogin = () => {
        if (!email.trim() || !password.trim()) return;
        clearError();
        signInWithEmail(email.trim(), password);
    };

    return (
        <KeyboardAvoidingView
            style={styles.safe}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.container}>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>أهلاً بعودتك</Text>
                    <Text style={styles.subtitle}>سجّل دخولك للاستماع إلى البودكاست</Text>
                </View>

                {/* Error */}
                {error ? (
                    <View style={styles.errorBox}>
                        <Ionicons name="alert-circle" size={16} color="#FF4444" />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : null}

                {/* Email input */}
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="البريد الإلكتروني"
                        placeholderTextColor="#444"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        textAlign="right"
                    />
                </View>

                {/* Password input */}
                <View style={styles.inputWrapper}>
                    <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                        <Ionicons
                            name={showPass ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color="#444"
                        />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="كلمة المرور"
                        placeholderTextColor="#444"
                        secureTextEntry={!showPass}
                        textAlign="right"
                    />
                </View>

                {/* Sign in button */}
                <TouchableOpacity
                    style={[styles.primaryBtn, authLoading && styles.btnDisabled]}
                    onPress={handleLogin}
                    disabled={authLoading}
                >
                    {authLoading
                        ? <ActivityIndicator color="#1A1A00" />
                        : <Text style={styles.primaryBtnText}>تسجيل الدخول</Text>
                    }
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>أو</Text>
                    <View style={styles.dividerLine} />
                </View>

                {/* Google button */}
                <TouchableOpacity
                    style={[styles.googleBtn, authLoading && styles.btnDisabled]}
                    onPress={signInWithGoogle}
                    disabled={authLoading}
                >
                    <Ionicons name="logo-google" size={18} color="#fff" />
                    <Text style={styles.googleBtnText}>المتابعة مع Google</Text>
                </TouchableOpacity>

                {/* Go to sign up */}
                <View style={styles.footer}>
                    <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                        <Text style={styles.linkText}>إنشاء حساب جديد</Text>
                    </TouchableOpacity>
                    <Text style={styles.footerText}>ليس لديك حساب؟</Text>
                </View>

            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#000000',
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
        gap: 14,
    },
    header: {
        alignItems: 'flex-end',
        marginBottom: 8,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'right',
    },
    subtitle: {
        color: '#888',
        fontSize: 14,
        textAlign: 'right',
        marginTop: 4,
    },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#2A1A1A',
        borderRadius: 10,
        padding: 12,
        borderWidth: 0.5,
        borderColor: '#FF4444',
    },
    errorText: {
        color: '#FF4444',
        fontSize: 13,
        flex: 1,
        textAlign: 'right',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 4,
        gap: 10,
    },
    input: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 15,
        paddingVertical: 12,
    },
    primaryBtn: {
        backgroundColor: '#F5C842',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 4,
    },
    btnDisabled: {
        opacity: 0.6,
    },
    primaryBtnText: {
        color: '#1A1A00',
        fontSize: 15,
        fontWeight: '700',
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    dividerLine: {
        flex: 1,
        height: 0.5,
        backgroundColor: '#2A2A2A',
    },
    dividerText: {
        color: '#555',
        fontSize: 13,
    },
    googleBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        paddingVertical: 14,
        borderWidth: 0.5,
        borderColor: '#2A2A2A',
    },
    googleBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
        marginTop: 8,
    },
    footerText: {
        color: '#555',
        fontSize: 13,
    },
    linkText: {
        color: '#F5C842',
        fontSize: 13,
        fontWeight: '600',
    },
});

export default LoginScreen;