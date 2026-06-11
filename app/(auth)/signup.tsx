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

const SignupScreen = () => {
    const { signUpWithEmail, signInWithGoogle, authLoading, error, clearError } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [localError, setLocalError] = useState('');

    const handleSignup = () => {
        setLocalError('');
        clearError();

        if (!email.trim() || !password.trim()) {
            setLocalError('يرجى ملء جميع الحقول');
            return;
        }
        if (password !== password2) {
            setLocalError('كلمتا المرور غير متطابقتين');
            return;
        }
        if (password.length < 6) {
            setLocalError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            return;
        }

        signUpWithEmail(email.trim(), password);
    };

    const displayError = localError || error;

    return (
        <KeyboardAvoidingView
            style={styles.safe}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.container}>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>إنشاء حساب</Text>
                    <Text style={styles.subtitle}>أنشئ حسابك للاستمتاع بالبودكاست</Text>
                </View>

                {/* Error */}
                {displayError ? (
                    <View style={styles.errorBox}>
                        <Ionicons name="alert-circle" size={16} color="#FF4444" />
                        <Text style={styles.errorText}>{displayError}</Text>
                    </View>
                ) : null}

                {/* Email */}
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

                {/* Password */}
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

                {/* Confirm password */}
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
                        value={password2}
                        onChangeText={setPassword2}
                        placeholder="تأكيد كلمة المرور"
                        placeholderTextColor="#444"
                        secureTextEntry={!showPass}
                        textAlign="right"
                    />
                </View>

                {/* Sign up button */}
                <TouchableOpacity
                    style={[styles.primaryBtn, authLoading && styles.btnDisabled]}
                    onPress={handleSignup}
                    disabled={authLoading}
                >
                    {authLoading
                        ? <ActivityIndicator color="#1A1A00" />
                        : <Text style={styles.primaryBtnText}>إنشاء الحساب</Text>
                    }
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>أو</Text>
                    <View style={styles.dividerLine} />
                </View>

                {/* Google */}
                <TouchableOpacity
                    style={[styles.googleBtn, authLoading && styles.btnDisabled]}
                    onPress={signInWithGoogle}
                    disabled={authLoading}
                >
                    <Ionicons name="logo-google" size={18} color="#fff" />
                    <Text style={styles.googleBtnText}>المتابعة مع Google</Text>
                </TouchableOpacity>

                {/* Go to login */}
                <View style={styles.footer}>
                    <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                        <Text style={styles.linkText}>تسجيل الدخول</Text>
                    </TouchableOpacity>
                    <Text style={styles.footerText}>لديك حساب بالفعل؟</Text>
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

export default SignupScreen;