import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PaywallScreen from '../../components/PayWallScreen';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/Subscriptioncontext';

// ─── Reusable settings row ────────────────────────────────────────────────────

type SettingRowProps = {
    icon: string;
    label: string;
    value?: string;
    onPress?: () => void;
    danger?: boolean;
    badge?: string;
};

const SettingRow: React.FC<SettingRowProps> = ({
    icon, label, value, onPress, danger = false, badge,
}) => (
    <TouchableOpacity
        style={styles.row}
        onPress={onPress}
        activeOpacity={0.7}
        disabled={!onPress}
    >
        <View style={styles.rowLeft}>
            <Ionicons name="chevron-forward" size={16} color="#444" />
            {value ? <Text style={styles.rowValue}>{value}</Text> : null}
            {badge ? (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badge}</Text>
                </View>
            ) : null}
        </View>
        <View style={styles.rowRight}>
            <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>
                {label}
            </Text>
            <View style={[styles.rowIcon, danger && styles.rowIconDanger]}>
                <Ionicons
                    name={icon as any}
                    size={18}
                    color={danger ? '#FF4444' : '#888'}
                />
            </View>
        </View>
    </TouchableOpacity>
);

const SectionLabel = ({ label }: { label: string }) => (
    <Text style={styles.sectionLabel}>{label}</Text>
);

// ─── Profile screen ───────────────────────────────────────────────────────────

const ProfileScreen = () => {
    const { user, signOut } = useAuth();
    const { isPremium, devTogglePremium,
        podcastsRemaining, booksRemaining } = useSubscription();
    const [showPaywall, setShowPaywall] = useState(false);

    const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
    const email = user?.email ?? '';
    const name = user?.user_metadata?.full_name as string | undefined;
    const initial = email.charAt(0).toUpperCase();

    const handleLogout = () => {
        Alert.alert(
            'تسجيل الخروج',
            'هل أنت متأكد أنك تريد تسجيل الخروج؟',
            [
                { text: 'إلغاء', style: 'cancel' },
                { text: 'تسجيل الخروج', style: 'destructive', onPress: signOut },
            ]
        );
    };

    // ── Not logged in ─────────────────────────────────────────────────────────
    if (!user) {
        return (
            <SafeAreaView style={[styles.safe, styles.center]}>
                <Ionicons name="person-circle-outline" size={80} color="#2A2A2A" />
                <Text style={styles.notLoggedTitle}>لم تسجّل دخولك بعد</Text>
                <Text style={styles.notLoggedSub}>
                    سجّل دخولك للوصول إلى ملفك الشخصي
                </Text>
                <TouchableOpacity
                    style={styles.loginBtn}
                    onPress={() => router.push('/(auth)/login')}
                >
                    <Text style={styles.loginBtnText}>تسجيل الدخول</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* ── Avatar + info ────────────────────────────────────── */}
                <View style={styles.profileTop}>
                    {avatarUrl ? (
                        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarFallback}>
                            <Text style={styles.avatarInitial}>{initial}</Text>
                        </View>
                    )}

                    {name ? <Text style={styles.name}>{name}</Text> : null}
                    <Text style={styles.email}>{email}</Text>

                    {/* Premium / free badge */}
                    {isPremium ? (
                        <View style={styles.premiumBadge}>
                            <Ionicons name="star" size={14} color="#1A1A00" />
                            <Text style={styles.premiumBadgeText}>مشترك مميز</Text>
                        </View>
                    ) : (
                        <View style={styles.freeBadge}>
                            <Text style={styles.freeBadgeText}>مجاني</Text>
                        </View>
                    )}

                    {/* ✅ Subscribe banner — only for free users */}
                    {!isPremium && (
                        <TouchableOpacity
                            style={styles.subscribeBanner}
                            onPress={() => setShowPaywall(true)}
                        >
                            <View style={styles.subscribeBannerLeft}>
                                <Text style={styles.subscribeBannerTitle}>
                                    ترقية إلى المميز
                                </Text>
                                <Text style={styles.subscribeBannerSub}>
                                    {podcastsRemaining} بودكاست · {booksRemaining} كتاب متبقي هذا الشهر
                                </Text>
                            </View>
                            <View style={styles.subscribeBannerBadge}>
                                <Ionicons name="star" size={14} color="#1A1A00" />
                                <Text style={styles.subscribeBannerBadgeText}>7.99$</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </View>

                {/* ── Account ──────────────────────────────────────────── */}
                <SectionLabel label="الحساب" />
                <View style={styles.section}>
                    <SettingRow
                        icon="person-outline"
                        label="تعديل الملف الشخصي"
                        onPress={() => { }}
                    />
                    <View style={styles.separator} />
                    <SettingRow
                        icon="notifications-outline"
                        label="الإشعارات"
                        onPress={() => { }}
                    />
                    <View style={styles.separator} />
                    <SettingRow
                        icon="bookmark-outline"
                        label="المحفوظات"
                        onPress={() => router.push('/(tabs)/favorites')}
                    />
                </View>

                {/* ── Subscription ─────────────────────────────────────── */}
                <SectionLabel label="الاشتراك" />
                <View style={styles.section}>
                    {isPremium ? (
                        <SettingRow
                            icon="star"
                            label="إدارة الاشتراك المميز"
                            badge="مميز"
                            onPress={() => { }}
                        />
                    ) : (
                        <SettingRow
                            icon="star-outline"
                            label="ترقية إلى المميز"
                            onPress={() => setShowPaywall(true)}
                        />
                    )}
                </View>

                {/* ── App ──────────────────────────────────────────────── */}
                <SectionLabel label="التطبيق" />
                <View style={styles.section}>
                    <SettingRow
                        icon="language-outline"
                        label="اللغة"
                        value="العربية"
                        onPress={() => { }}
                    />
                    <View style={styles.separator} />
                    <SettingRow
                        icon="moon-outline"
                        label="المظهر"
                        value="داكن"
                        onPress={() => { }}
                    />
                </View>

                {/* ── Support ──────────────────────────────────────────── */}
                <SectionLabel label="الدعم" />
                <View style={styles.section}>
                    <SettingRow
                        icon="help-circle-outline"
                        label="مركز المساعدة"
                        onPress={() => { }}
                    />
                    <View style={styles.separator} />
                    <SettingRow
                        icon="shield-outline"
                        label="سياسة الخصوصية"
                        onPress={() => { }}
                    />
                </View>

                {/* ── Dev tools (remove before production) ─────────────── */}
                <SectionLabel label="🔧 أدوات المطور" />
                <View style={styles.section}>
                    <SettingRow
                        icon="toggle-outline"
                        label={`تبديل المميز (${isPremium ? 'مفعل' : 'مجاني'})`}
                        onPress={devTogglePremium}
                    />
                </View>

                {/* ── Logout ───────────────────────────────────────────── */}
                <View style={styles.section}>
                    <SettingRow
                        icon="log-out-outline"
                        label="تسجيل الخروج"
                        onPress={handleLogout}
                        danger
                    />
                </View>

                <Text style={styles.version}>الإصدار 1.0.0</Text>
            </ScrollView>

            {/* ✅ Paywall modal */}
            <PaywallScreen
                visible={showPaywall}
                onClose={() => setShowPaywall(false)}
                reason="general"
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#000000' },
    center: { alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 32 },
    scrollContent: { paddingBottom: 120 },
    notLoggedTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', textAlign: 'center', marginTop: 8 },
    notLoggedSub: { color: '#555', fontSize: 13, textAlign: 'center' },
    loginBtn: { backgroundColor: '#F5C842', borderRadius: 12, paddingVertical: 13, paddingHorizontal: 40, marginTop: 8 },
    loginBtnText: { color: '#1A1A00', fontWeight: '700', fontSize: 15 },
    profileTop: { alignItems: 'center', paddingTop: 24, paddingHorizontal: 16, paddingBottom: 24, gap: 6 },
    avatar: { width: 88, height: 88, borderRadius: 44, borderWidth: 3, borderColor: '#0bd46c', marginBottom: 8 },
    avatarFallback: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#1A1A1A', borderWidth: 3, borderColor: '#0bd46c', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    avatarInitial: { color: '#FFFFFF', fontSize: 32, fontWeight: '700' },
    name: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
    email: { color: '#888', fontSize: 13, marginBottom: 4 },
    premiumBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#F5C842', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
    premiumBadgeText: { color: '#1A1A00', fontSize: 12, fontWeight: '700' },
    freeBadge: { backgroundColor: '#1A1A1A', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 0.5, borderColor: '#2A2A2A' },
    freeBadgeText: { color: '#555', fontSize: 12 },
    subscribeBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1A1500', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#F5C842', width: '100%', marginTop: 12 },
    subscribeBannerLeft: { flex: 1, gap: 4 },
    subscribeBannerTitle: { color: '#F5C842', fontSize: 14, fontWeight: '700', textAlign: 'right' },
    subscribeBannerSub: { color: '#888', fontSize: 11, textAlign: 'right' },
    subscribeBannerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F5C842', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, marginLeft: 12 },
    subscribeBannerBadgeText: { color: '#1A1A00', fontSize: 12, fontWeight: '700' },
    sectionLabel: { color: '#555', fontSize: 12, fontWeight: '500', textAlign: 'right', paddingHorizontal: 16, marginTop: 24, marginBottom: 8 },
    section: { backgroundColor: '#1A1A1A', borderRadius: 14, marginHorizontal: 16, overflow: 'hidden' },
    separator: { height: 0.5, backgroundColor: '#2A2A2A', marginRight: 16 },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
    rowRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    rowIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center' },
    rowIconDanger: { backgroundColor: '#2A1A1A' },
    rowLabel: { color: '#FFFFFF', fontSize: 14, textAlign: 'right' },
    rowLabelDanger: { color: '#FF4444' },
    rowValue: { color: '#555', fontSize: 13 },
    badge: { backgroundColor: '#F5C842', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
    badgeText: { color: '#000', fontSize: 10, fontWeight: '700' },
    version: { color: '#333', fontSize: 11, textAlign: 'center', marginTop: 24 },
});

export default ProfileScreen;