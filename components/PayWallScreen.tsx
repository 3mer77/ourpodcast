import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { purchasePremium, restorePurchases } from '../lib/revenuecat';
import { useSubscription } from '../context/Subscriptioncontext';

// ─── Feature row ─────────────────────────────────────────────────────────────

const Feature = ({ icon, title, subtitle, premium }: {
    icon: string;
    title: string;
    subtitle: string;
    premium?: boolean;
}) => (
    <View style={styles.feature}>
        <View style={styles.featureRight}>
            <Text style={styles.featureTitle}>{title}</Text>
            <Text style={styles.featureSub}>{subtitle}</Text>
        </View>
        <View style={[styles.featureIcon, premium && styles.featureIconPremium]}>
            <Ionicons name={icon as any} size={20} color={premium ? '#1A1A00' : '#0bd46c'} />
        </View>
    </View>
);

// ─── Comparison row ───────────────────────────────────────────────────────────

const CompareRow = ({ label, free, premium }: {
    label: string;
    free: string;
    premium: string;
}) => (
    <View style={styles.compareRow}>
        <View style={styles.compareCell}>
            <Text style={styles.comparePremium}>{premium}</Text>
        </View>
        <Text style={styles.compareLabel}>{label}</Text>
        <View style={styles.compareCell}>
            <Text style={styles.compareFree}>{free}</Text>
        </View>
    </View>
);

// ─── Paywall ─────────────────────────────────────────────────────────────────

type PaywallProps = {
    visible: boolean;
    onClose: () => void;
    reason?: 'podcast' | 'book' | 'general';
};

const PaywallScreen: React.FC<PaywallProps> = ({ visible, onClose, reason = 'general' }) => {
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(false);
    const [restoring, setRestoring] = useState(false);
    const { devTogglePremium } = useSubscription();

    const reasonText = {
        podcast: 'لقد وصلت إلى حد البودكاست المجاني هذا الشهر',
        book: 'لقد وصلت إلى حد الكتب المجانية هذا الشهر',
        general: 'قم بالترقية للوصول إلى كل المحتوى',
    }[reason];

    const handlePurchase = async () => {
        setLoading(true);
        try {
            const success = await purchasePremium();
            if (success) {
                onClose();
                // refresh app state
                router.replace('/(tabs)');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async () => {
        setRestoring(true);
        try {
            const success = await restorePurchases();
            if (success) onClose();
        } finally {
            setRestoring(false);
        }
    };

    const handleDevToggle = () => {
        devTogglePremium();
        onClose();
        router.replace('/(tabs)');
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>

                {/* Close button */}
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                    <Ionicons name="close" size={22} color="#888" />
                </TouchableOpacity>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scroll}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.crownCircle}>
                            <Ionicons name="star" size={36} color="#1A1A00" />
                        </View>
                        <Text style={styles.heading}>ترقية إلى المميز</Text>
                        <Text style={styles.subheading}>{reasonText}</Text>
                    </View>

                    {/* Features */}
                    <View style={styles.featuresBox}>
                        <Feature
                            icon="infinite-outline"
                            title="بودكاست بلا حدود"
                            subtitle="استمع لأي عدد من البودكاست"
                            premium
                        />
                        <View style={styles.divider} />
                        <Feature
                            icon="book-outline"
                            title="كتب غير محدودة"
                            subtitle="اقرأ أي كتاب في أي وقت"
                            premium
                        />
                        <View style={styles.divider} />
                        <Feature
                            icon="bookmark-outline"
                            title="حفظ غير محدود"
                            subtitle="احفظ كل ما تريد"
                            premium
                        />
                        <View style={styles.divider} />
                        <Feature
                            icon="sync-outline"
                            title="مزامنة عبر الأجهزة"
                            subtitle="تابع من حيث توقفت على أي جهاز"
                            premium
                        />
                    </View>

                    {/* Comparison table */}
                    <View style={styles.compareBox}>
                        <View style={styles.compareHeader}>
                            <Text style={styles.compareHeaderPremium}>مميز ⭐</Text>
                            <Text style={styles.compareHeaderLabel}>المزايا</Text>
                            <Text style={styles.compareHeaderFree}>مجاني</Text>
                        </View>
                        <CompareRow label="البودكاست" free="٢ شهرياً" premium="غير محدود" />
                        <CompareRow label="الكتب" free="١ شهرياً" premium="غير محدود" />
                        <CompareRow label="الحلقات" free="٢ لكل بودكاست" premium="غير محدود" />
                        <CompareRow label="الحفظ" free="محدود" premium="غير محدود" />
                    </View>

                    {/* Price */}
                    <View style={styles.priceBox}>
                        <Text style={styles.priceAmount}>7.99$</Text>
                        <Text style={styles.pricePeriod}>شهرياً · ≈ 29.99 ريال</Text>
                        <Text style={styles.priceNote}>يمكن إلغاء الاشتراك في أي وقت</Text>
                    </View>

                </ScrollView>

                {/* CTA */}
                <TouchableOpacity
                    style={[styles.ctaBtn, loading && styles.ctaBtnDisabled]}
                    onPress={handlePurchase}
                    disabled={loading}
                >
                    {loading
                        ? <ActivityIndicator color="#1A1A00" />
                        : <Text style={styles.ctaBtnText}>اشترك الآن</Text>
                    }
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.restoreBtn}
                    onPress={handleRestore}
                    disabled={restoring}
                >
                    <Text style={styles.restoreBtnText}>
                        {restoring ? 'جارٍ الاسترداد...' : 'استرداد المشتريات'}
                    </Text>
                </TouchableOpacity>

                {/* ✅ Dev toggle button (only in development) */}
                {__DEV__ && (
                    <TouchableOpacity
                        style={[styles.restoreBtn, { marginTop: 10, backgroundColor: '#1A1A1A' }]}
                        onPress={handleDevToggle}
                    >
                        <Text style={[styles.restoreBtnText, { color: '#F5C842' }]}>
                            🔧 DEV: تفعيل المميز (تجريبي)
                        </Text>
                    </TouchableOpacity>
                )}

            </View>
        </Modal>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D0D0D',
    },
    closeBtn: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 10,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#1A1A1A',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scroll: {
        padding: 24,
        paddingTop: 48,
        gap: 20,
    },

    // ── Header ────────────────────────────────────────
    header: {
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
    },
    crownCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F5C842',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    heading: {
        color: '#FFFFFF',
        fontSize: 26,
        fontWeight: '700',
        textAlign: 'center',
    },
    subheading: {
        color: '#888',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },

    // ── Features ──────────────────────────────────────
    featuresBox: {
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        padding: 4,
    },
    feature: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
        gap: 12,
    },
    featureIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#0D2A1A',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    featureIconPremium: {
        backgroundColor: '#F5C842',
    },
    featureRight: {
        flex: 1,
        alignItems: 'flex-end',
        gap: 3,
    },
    featureTitle: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'right',
    },
    featureSub: {
        color: '#666',
        fontSize: 12,
        textAlign: 'right',
    },
    divider: {
        height: 0.5,
        backgroundColor: '#2A2A2A',
        marginHorizontal: 14,
    },

    // ── Compare ───────────────────────────────────────
    compareBox: {
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        overflow: 'hidden',
    },
    compareHeader: {
        flexDirection: 'row',
        backgroundColor: '#222',
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    compareHeaderPremium: {
        flex: 1,
        color: '#F5C842',
        fontSize: 13,
        fontWeight: '700',
        textAlign: 'center',
    },
    compareHeaderLabel: {
        flex: 1,
        color: '#555',
        fontSize: 12,
        textAlign: 'center',
    },
    compareHeaderFree: {
        flex: 1,
        color: '#555',
        fontSize: 13,
        fontWeight: '700',
        textAlign: 'center',
    },
    compareRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderTopWidth: 0.5,
        borderTopColor: '#2A2A2A',
    },
    compareCell: {
        flex: 1,
        alignItems: 'center',
    },
    compareLabel: {
        flex: 1,
        color: '#888',
        fontSize: 13,
        textAlign: 'center',
    },
    comparePremium: {
        color: '#0bd46c',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
    compareFree: {
        color: '#555',
        fontSize: 12,
        textAlign: 'center',
    },

    // ── Price ─────────────────────────────────────────
    priceBox: {
        alignItems: 'center',
        gap: 4,
    },
    priceAmount: {
        color: '#FFFFFF',
        fontSize: 36,
        fontWeight: '700',
    },
    pricePeriod: {
        color: '#888',
        fontSize: 14,
    },
    priceNote: {
        color: '#555',
        fontSize: 12,
    },

    // ── CTA ───────────────────────────────────────────
    ctaBtn: {
        backgroundColor: '#F5C842',
        borderRadius: 14,
        paddingVertical: 16,
        marginHorizontal: 24,
        alignItems: 'center',
        marginTop: 8,
    },
    ctaBtnDisabled: {
        opacity: 0.6,
    },
    ctaBtnText: {
        color: '#1A1A00',
        fontSize: 17,
        fontWeight: '700',
    },
    restoreBtn: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    restoreBtnText: {
        color: '#555',
        fontSize: 13,
    },
});

export default PaywallScreen;