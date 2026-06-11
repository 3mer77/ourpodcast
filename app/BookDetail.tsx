import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBookDetail } from '../hooks/useBookdetail';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Theme definitions ────────────────────────────────────────────────────────

type Theme = 'dark' | 'sepia' | 'white';

const THEMES: Record<Theme, { bg: string; text: string; surface: string; label: string }> = {
    dark: { bg: '#0D0D0D', text: '#E8E8E8', surface: '#1A1A1A', label: 'داكن' },
    sepia: { bg: '#F5ECD7', text: '#3B2F1E', surface: '#EAD9BB', label: 'بيج' },
    white: { bg: '#FFFFFF', text: '#1A1A1A', surface: '#F2F2F2', label: 'فاتح' },
};

// ─── Reading settings panel ───────────────────────────────────────────────────

type SettingsProps = {
    visible: boolean;
    onClose: () => void;
    fontSize: number;
    setFontSize: (n: number) => void;
    lineHeight: number;
    setLineHeight: (n: number) => void;
    theme: Theme;
    setTheme: (t: Theme) => void;
};

const SettingsPanel: React.FC<SettingsProps> = ({
    visible, onClose,
    fontSize, setFontSize,
    lineHeight, setLineHeight,
    theme, setTheme,
}) => {
    const t = THEMES[theme];

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    style={[styles.panel, { backgroundColor: t.surface }]}
                >
                    <Text style={[styles.panelTitle, { color: t.text }]}>
                        إعدادات القراءة
                    </Text>

                    {/* Font size */}
                    <View style={styles.settingRow}>
                        <Text style={[styles.settingLabel, { color: t.text }]}>
                            حجم الخط
                        </Text>
                        <View style={styles.stepper}>
                            <TouchableOpacity
                                style={[styles.stepBtn, { backgroundColor: t.bg }]}
                                onPress={() => setFontSize(Math.max(12, fontSize - 1))}
                            >
                                <Ionicons name="remove" size={18} color={t.text} />
                            </TouchableOpacity>
                            <Text style={[styles.stepValue, { color: t.text }]}>
                                {fontSize}
                            </Text>
                            <TouchableOpacity
                                style={[styles.stepBtn, { backgroundColor: t.bg }]}
                                onPress={() => setFontSize(Math.min(28, fontSize + 1))}
                            >
                                <Ionicons name="add" size={18} color={t.text} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Line height */}
                    <View style={styles.settingRow}>
                        <Text style={[styles.settingLabel, { color: t.text }]}>
                            تباعد الأسطر
                        </Text>
                        <View style={styles.stepper}>
                            <TouchableOpacity
                                style={[styles.stepBtn, { backgroundColor: t.bg }]}
                                onPress={() => setLineHeight(Math.max(1.2, parseFloat((lineHeight - 0.1).toFixed(1))))}
                            >
                                <Ionicons name="remove" size={18} color={t.text} />
                            </TouchableOpacity>
                            <Text style={[styles.stepValue, { color: t.text }]}>
                                {lineHeight.toFixed(1)}
                            </Text>
                            <TouchableOpacity
                                style={[styles.stepBtn, { backgroundColor: t.bg }]}
                                onPress={() => setLineHeight(Math.min(2.5, parseFloat((lineHeight + 0.1).toFixed(1))))}
                            >
                                <Ionicons name="add" size={18} color={t.text} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Theme */}
                    <Text style={[styles.settingLabel, { color: t.text, marginBottom: 10 }]}>
                        المظهر
                    </Text>
                    <View style={styles.themeRow}>
                        {(Object.keys(THEMES) as Theme[]).map((key) => (
                            <TouchableOpacity
                                key={key}
                                style={[
                                    styles.themeBtn,
                                    {
                                        backgroundColor: THEMES[key].bg,
                                        borderColor: theme === key ? '#0bd46c' : '#333',
                                        borderWidth: theme === key ? 2 : 1,
                                    },
                                ]}
                                onPress={() => setTheme(key)}
                            >
                                <Text style={[
                                    styles.themeBtnLabel,
                                    { color: THEMES[key].text }
                                ]}>
                                    {THEMES[key].label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

// ─── BookDetail screen ────────────────────────────────────────────────────────

const BookDetailScreen = () => {
    const { bookId } = useLocalSearchParams<{ bookId: string }>();
    const insets = useSafeAreaInsets();



    const {
        book, pages, currentPage, totalPages,
        loading, error, retry, nextPage, prevPage,
    } = useBookDetail(Number(bookId));


    // ── Reading settings state ────────────────────────────────────────────────
    const [theme, setTheme] = useState<Theme>('dark');
    const [fontSize, setFontSize] = useState(16);
    const [lineHeight, setLineHeight] = useState(1.8);
    const [showSettings, setShowSettings] = useState(false);
    const [readingMode, setReadingMode] = useState(false);

    const t = THEMES[theme];

    const formatAuthor = (authors: BookDetail['authors']) => {
        if (!authors?.length) return '';
        const raw = authors[0].name;
        const parts = raw.split(',');
        return parts.length > 1 ? `${parts[1].trim()} ${parts[0].trim()}` : raw;
    };

    // ── Loading ───────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: '#000' }]}>
                <ActivityIndicator size="large" color="green" />
                <Text style={styles.loadingText}>جارٍ تحميل الكتاب...</Text>
            </View>
        );
    }

    // ── Error ─────────────────────────────────────────────────────────────────
    if (error || !book) {
        return (
            <View style={[styles.center, { backgroundColor: '#000' }]}>
                <Ionicons name="cloud-offline-outline" size={48} color="#333" />
                <Text style={[styles.loadingText, { color: '#fff' }]}>
                    حدث خطأ ما
                </Text>
                <TouchableOpacity style={styles.retryBtn} onPress={retry}>
                    <Text style={styles.retryTxt}>إعادة المحاولة</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // ── Reading mode ──────────────────────────────────────────────────────────
    if (readingMode) {
        return (
            <View style={[styles.reader, { backgroundColor: t.bg, paddingTop: insets.top }]}>

                {/* Reading toolbar */}
                <View style={[styles.readerToolbar, { backgroundColor: t.surface }]}>
                    <TouchableOpacity onPress={() => setReadingMode(false)}>
                        <Ionicons name="arrow-back" size={22} color={t.text} />
                    </TouchableOpacity>

                    <Text style={[styles.readerTitle, { color: t.text }]} numberOfLines={1}>
                        {book.title}
                    </Text>

                    <TouchableOpacity onPress={() => setShowSettings(true)}>
                        <Ionicons name="settings-outline" size={22} color={t.text} />
                    </TouchableOpacity>
                </View>

                {/* Page text */}
                <ScrollView
                    style={styles.pageScroll}
                    contentContainerStyle={styles.pageContent}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={[
                        styles.pageText,
                        {
                            color: t.text,
                            fontSize,
                            lineHeight: fontSize * lineHeight,
                        }
                    ]}>
                        {pages[currentPage] ?? ''}
                    </Text>
                </ScrollView>

                {/* Page navigation */}
                <View style={[
                    styles.pageNav,
                    { backgroundColor: t.surface, paddingBottom: insets.bottom + 8 }
                ]}>
                    <TouchableOpacity
                        style={[styles.navBtn, currentPage >= totalPages - 1 && styles.navBtnDisabled]}
                        onPress={nextPage}
                        disabled={currentPage >= totalPages - 1}
                    >
                        <Ionicons name="chevron-back" size={22} color={currentPage >= totalPages - 1 ? '#555' : t.text} />
                    </TouchableOpacity>

                    <Text style={[styles.pageCounter, { color: t.text }]}>
                        {currentPage + 1} / {totalPages}
                    </Text>

                    <TouchableOpacity
                        style={[styles.navBtn, currentPage <= 0 && styles.navBtnDisabled]}
                        onPress={prevPage}
                        disabled={currentPage <= 0}
                    >
                        <Ionicons name="chevron-forward" size={22} color={currentPage <= 0 ? '#555' : t.text} />
                    </TouchableOpacity>
                </View>

                {/* Settings panel */}
                <SettingsPanel
                    visible={showSettings}
                    onClose={() => setShowSettings(false)}
                    fontSize={fontSize}
                    setFontSize={setFontSize}
                    lineHeight={lineHeight}
                    setLineHeight={setLineHeight}
                    theme={theme}
                    setTheme={setTheme}
                />
            </View>
        );
    }

    // ── Book info screen ──────────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.infoContent}
            >
                {/* Back */}
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="chevron-forward" size={22} color="#fff" />
                </TouchableOpacity>

                {/* Cover */}
                {book.cover_image ? (
                    <View style={styles.coverWrapper}>
                        <Text
                            style={styles.coverImage}
                        // using Text as image fallback wrapper
                        />
                        {/* eslint-disable-next-line react-native/no-inline-styles */}
                        <View style={{ width: 160, height: 220, borderRadius: 12, overflow: 'hidden', backgroundColor: '#1A1A1A' }}>
                            {/* Image */}
                            {React.createElement(
                                require('react-native').Image,
                                {
                                    source: { uri: book.cover_image },
                                    style: { width: 160, height: 220 },
                                    resizeMode: 'cover',
                                }
                            )}
                        </View>
                    </View>
                ) : (
                    <View style={styles.coverFallback}>
                        <Ionicons name="book-outline" size={64} color="#333" />
                    </View>
                )}

                {/* Title + author */}
                <Text style={styles.bookTitle}>{book.title}</Text>
                <Text style={styles.bookAuthor}>
                    {formatAuthor(book.authors)}
                </Text>

                {/* Stats row */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Ionicons name="document-text-outline" size={16} color="#0bd46c" />
                        <Text style={styles.statValue}>{totalPages}</Text>
                        <Text style={styles.statLabel}>صفحة</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Ionicons name="download-outline" size={16} color="#F5C842" />
                        <Text style={styles.statValue}>
                            {book.download_count >= 1000
                                ? `${(book.download_count / 1000).toFixed(0)}k`
                                : book.download_count}
                        </Text>
                        <Text style={styles.statLabel}>تحميل</Text>
                    </View>
                    {book.reading_ease_score && (
                        <>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Ionicons name="speedometer-outline" size={16} color="#888" />
                                <Text style={styles.statValue}>
                                    {parseFloat(book.reading_ease_score).toFixed(0)}
                                </Text>
                                <Text style={styles.statLabel}>سهولة</Text>
                            </View>
                        </>
                    )}
                </View>

                {/* Subjects */}
                {book.subjects?.length > 0 && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.subjectsScroll}
                        contentContainerStyle={styles.subjectsContent}
                    >
                        {book.subjects.slice(0, 6).map((s, i) => (
                            <View key={i} style={styles.subjectPill}>
                                <Text style={styles.subjectText} numberOfLines={1}>
                                    {s.replace(/--.*/, '').trim()}
                                </Text>
                            </View>
                        ))}
                    </ScrollView>
                )}

                {/* Summary */}
                {book.summary ? (
                    <View style={styles.summaryBox}>
                        <Text style={styles.summaryTitle}>الملخص</Text>
                        <Text style={styles.summaryText}>{book.summary}</Text>
                    </View>
                ) : null}

                {/* Read button */}
                <TouchableOpacity
                    style={styles.readBtn}
                    onPress={() => setReadingMode(true)}
                >
                    <Ionicons name="book-outline" size={20} color="#1A1A00" />
                    <Text style={styles.readBtnText}>ابدأ القراءة</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

type BookDetail = {
    authors: { id: number; name: string }[];
};

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#000000',
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    loadingText: {
        color: '#888',
        fontSize: 14,
        marginTop: 8,
    },
    retryBtn: {
        backgroundColor: '#F5C842',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 32,
        marginTop: 8,
    },
    retryTxt: {
        color: '#1A1A00',
        fontWeight: '700',
        fontSize: 14,
    },

    // ── Info screen ───────────────────────────────────
    infoContent: {
        paddingBottom: 120,
        alignItems: 'center',
    },
    backBtn: {
        alignSelf: 'flex-start',
        marginLeft: 16,
        marginTop: 8,
        marginBottom: 16,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#1A1A1A',
        alignItems: 'center',
        justifyContent: 'center',
    },
    coverWrapper: {
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.6,
        shadowRadius: 16,
        elevation: 10,
    },
    coverImage: {},
    coverFallback: {
        width: 160,
        height: 220,
        borderRadius: 12,
        backgroundColor: '#1A1A1A',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    bookTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        paddingHorizontal: 24,
        lineHeight: 28,
        marginBottom: 8,
    },
    bookAuthor: {
        color: '#888',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A1A1A',
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 24,
        marginHorizontal: 24,
        marginBottom: 16,
        gap: 20,
    },
    statItem: {
        alignItems: 'center',
        gap: 4,
        flex: 1,
    },
    statValue: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    statLabel: {
        color: '#555',
        fontSize: 11,
    },
    statDivider: {
        width: 0.5,
        height: 36,
        backgroundColor: '#2A2A2A',
    },
    subjectsScroll: {
        marginBottom: 16,
    },
    subjectsContent: {
        paddingHorizontal: 24,
        gap: 8,
    },
    subjectPill: {
        backgroundColor: '#1A1A1A',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    subjectText: {
        color: '#666',
        fontSize: 12,
    },
    summaryBox: {
        backgroundColor: '#1A1A1A',
        borderRadius: 14,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 24,
        gap: 8,
    },
    summaryTitle: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'right',
    },
    summaryText: {
        color: '#888',
        fontSize: 13,
        lineHeight: 20,
        textAlign: 'left',
    },
    readBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#F5C842',
        borderRadius: 14,
        paddingVertical: 16,
        paddingHorizontal: 48,
        marginHorizontal: 16,
    },
    readBtnText: {
        color: '#1A1A00',
        fontSize: 16,
        fontWeight: '700',
    },

    // ── Reader ────────────────────────────────────────
    reader: {
        flex: 1,
    },
    readerToolbar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    readerTitle: {
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 12,
    },
    pageScroll: {
        flex: 1,
    },
    pageContent: {
        paddingHorizontal: 24,
        paddingVertical: 20,
    },
    pageText: {
        fontFamily: 'IBMPlex-Regular',
    },
    pageNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 32,
        paddingTop: 12,
    },
    navBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    navBtnDisabled: {
        opacity: 0.3,
    },
    pageCounter: {
        fontSize: 14,
        fontWeight: '600',
    },

    // ── Settings panel ────────────────────────────────
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    panel: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        gap: 16,
    },
    panelTitle: {
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 8,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    settingLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    stepper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    stepBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepValue: {
        fontSize: 16,
        fontWeight: '700',
        minWidth: 32,
        textAlign: 'center',
    },
    themeRow: {
        flexDirection: 'row',
        gap: 12,
    },
    themeBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    themeBtnLabel: {
        fontSize: 13,
        fontWeight: '600',
    },
});

export default BookDetailScreen;