import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    ListRenderItem,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Book } from '../../components/BookCard';
import { useBooks } from '../../hooks/useBook';
import { BOOK_CATEGORIES } from '../../services/books';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 16 * 2 - 10) / 3;
const CARD_HEIGHT = CARD_WIDTH * 1.5;

// ─── Skeleton placeholder card ───────────────────────────────────────────────

const SkeletonCard = () => (
    <View style={[styles.card, styles.skeletonCard]}>
        <View style={styles.skeletonCover} />
        <View style={styles.spine} />
    </View>
);

// ─── Book grid card ───────────────────────────────────────────────────────────

const BookShelfCard = ({ item, onPress }: { item: Book; onPress: () => void }) => (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
        {item.cover_image ? (
            <Image
                source={{ uri: item.cover_image }}
                style={styles.cover}
                resizeMode="cover"
            />
        ) : (
            <View style={styles.coverFallback}>
                <Ionicons name="book-outline" size={28} color="#444" />
                <Text style={styles.fallbackTitle} numberOfLines={3}>
                    {item.title}
                </Text>
            </View>
        )}
        <View style={styles.spine} />
        {item.download_count > 50000 && (
            <View style={styles.popularBadge}>
                <Ionicons name="flame" size={9} color="#fff" />
            </View>
        )}
    </TouchableOpacity>
);

// ─── Category pill ────────────────────────────────────────────────────────────

type Category = typeof BOOK_CATEGORIES[number];

const CategoryPill = ({
    cat,
    selected,
    onPress,
}: {
    cat: Category;
    selected: boolean;
    onPress: () => void;
}) => (
    <TouchableOpacity
        style={[styles.pill, selected && styles.pillActive]}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <Text style={[styles.pillText, selected && styles.pillTextActive]}>
            {cat.label}
        </Text>
    </TouchableOpacity>
);

// ─── Library screen ───────────────────────────────────────────────────────────

export default function LibraryScreen() {
    const [selectedCat, setSelectedCat] = useState<Category>(BOOK_CATEGORIES[0]);
    const [rawSearch, setRawSearch] = useState('');
    const [search, setSearch] = useState('');

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => setSearch(rawSearch), 500);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [rawSearch]);

    useEffect(() => {
        if (rawSearch.trim()) setSelectedCat(BOOK_CATEGORIES[0]);
    }, [rawSearch]);

    const { books, loading, loadingMore, error, loadMore, retry } = useBooks(
        search.trim() ? '' : selectedCat.query,
        search.trim()
    );

    const handlePress = useCallback((book: Book) => {
        router.push({ pathname: '/BookDetail', params: { bookId: book.id } });
    }, []);

    const renderBook: ListRenderItem<Book> = useCallback(
        ({ item }) => (
            <BookShelfCard item={item} onPress={() => handlePress(item)} />
        ),
        [handlePress]
    );

    const skeletonData = Array.from({ length: 9 }, (_, i) => `skeleton-${i}`);

    if (error) {
        return (
            <SafeAreaView style={[styles.safe, styles.center]}>
                <Ionicons name="cloud-offline-outline" size={48} color="#2A2A2A" />
                <Text style={styles.stateTitle}>حدث خطأ ما</Text>
                <Text style={styles.stateSub}>{error}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={retry}>
                    <Text style={styles.retryTxt}>إعادة المحاولة</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>

            {/* ── Search bar ─────────────────────────────────────────────── */}
            <View style={styles.searchBar}>
                <Ionicons name="search" size={16} color="#555" />
                <TextInput
                    style={styles.searchInput}
                    value={rawSearch}
                    onChangeText={setRawSearch}
                    placeholder="ابحث عن كتاب..."
                    placeholderTextColor="#444"
                    returnKeyType="search"
                    autoCorrect={false}
                    autoCapitalize="none"
                    textAlign="right"
                />
                {rawSearch.length > 0 && (
                    <TouchableOpacity onPress={() => setRawSearch('')}>
                        <Ionicons name="close-circle" size={16} color="#555" />
                    </TouchableOpacity>
                )}
            </View>

            {/* ── Category pills — FIXED: no flex, natural height ───────── */}
            {!rawSearch.trim() && (
                <View style={styles.pillsContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.pillsRow}
                    >
                        {BOOK_CATEGORIES.map((cat) => (
                            <CategoryPill
                                key={cat.id}
                                cat={cat}
                                selected={selectedCat.id === cat.id}
                                onPress={() => setSelectedCat(cat)}
                            />
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* ── Section header ───────────────────────────────────────────── */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionCount}>
                    {loading ? '...' : `${books.length} كتاب`}
                </Text>
                <Text style={styles.sectionTitle}>
                    {rawSearch.trim()
                        ? `نتائج: "${rawSearch}"`
                        : selectedCat.label}
                </Text>
            </View>

            {/* ── Grid area — FIXED: flex:1 so it fills remaining space ───── */}
            <View style={styles.gridArea}>
                {loading && books.length === 0 ? (
                    <FlatList
                        data={skeletonData}
                        keyExtractor={(item) => item}
                        renderItem={() => <SkeletonCard />}
                        numColumns={3}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.grid}
                        columnWrapperStyle={styles.row}
                    />
                ) : (
                    <FlatList
                        data={books}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderBook}
                        numColumns={3}
                        onEndReached={loadMore}
                        onEndReachedThreshold={0.4}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.grid}
                        columnWrapperStyle={styles.row}
                        ListEmptyComponent={
                            <View style={styles.center}>
                                <Ionicons name="search-outline" size={48} color="#2A2A2A" />
                                <Text style={styles.stateTitle}>لا توجد نتائج</Text>
                                <Text style={styles.stateSub}>جرّب كلمة بحث مختلفة</Text>
                            </View>
                        }
                        ListFooterComponent={
                            loadingMore ? (
                                <View style={styles.footer}>
                                    <ActivityIndicator size="small" color="#16C47F" />
                                </View>
                            ) : null
                        }
                        removeClippedSubviews
                    />
                )}

                {/* Overlay for refresh loading */}
                {loading && books.length > 0 && (
                    <View style={styles.overlayLoading}>
                        <ActivityIndicator size="large" color="#16C47F" />
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#000000',
    },

    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingBottom: 80,
    },

    // ── Search ────────────────────────────────────────
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        marginHorizontal: 16,
        marginTop: 12,
        marginBottom: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },

    searchInput: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 14,
        padding: 0,
    },

    // ── Category Pills — FIXED ──────────────────────
    pillsContainer: {
        // NO flex: 1 here! Natural height only
        marginBottom: 10,
    },

    pillsRow: {
        paddingHorizontal: 16,
        gap: 12,
        alignItems: 'center',
        paddingVertical: 4, // small internal padding
    },

    pill: {
        backgroundColor: '#1A1A1A',
        borderRadius: 20,
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderWidth: 0.5,
        borderColor: '#2A2A2A',
        minHeight: 36,
        justifyContent: 'center',
    },

    pillActive: {
        backgroundColor: '#16C47F',
        borderColor: '#16C47F',
    },

    pillText: {
        color: '#888',
        fontSize: 14,
        fontWeight: '500',
    },

    pillTextActive: {
        color: '#ffffff',
        fontWeight: '700',
    },

    // ── Section header ────────────────────────────────
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
        marginTop: 4,
    },

    sectionTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },

    sectionCount: {
        color: '#555',
        fontSize: 12,
    },

    // ── Grid area — FIXED ───────────────────────────
    gridArea: {
        flex: 1, // Only THIS part expands to fill remaining space
        position: 'relative',
    },

    // ── Grid ──────────────────────────────────────────
    grid: {
        paddingHorizontal: 16,
        paddingBottom: 120,
    },

    row: {
        gap: 10,
        marginBottom: 10,
    },

    // ── Skeleton ──────────────────────────────────────
    skeletonCard: {
        backgroundColor: '#1A1A1A',
    },

    skeletonCover: {
        width: '100%',
        height: '100%',
        backgroundColor: '#252525',
        borderRadius: 6,
    },

    // ── Book card ─────────────────────────────────────
    card: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#1A1A1A',
        shadowColor: '#000',
        shadowOffset: { width: 3, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
        elevation: 8,
    },

    cover: {
        width: '100%',
        height: '100%',
    },

    coverFallback: {
        width: '100%',
        height: '100%',
        backgroundColor: '#1E1E2E',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        gap: 8,
    },

    fallbackTitle: {
        color: '#888',
        fontSize: 9,
        textAlign: 'center',
        lineHeight: 13,
    },

    spine: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        backgroundColor: 'rgba(0,0,0,0.35)',
    },

    popularBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#FF6B35',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // ── Overlay loading ─────────────────────────────
    overlayLoading: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },

    // ── States ────────────────────────────────────────
    stateTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 8,
    },

    stateSub: {
        color: '#555',
        fontSize: 13,
        textAlign: 'center',
        paddingHorizontal: 32,
        marginTop: 4,
    },

    retryBtn: {
        backgroundColor: '#F5C842',
        borderRadius: 20,
        paddingHorizontal: 24,
        paddingVertical: 10,
        marginTop: 8,
    },

    retryTxt: {
        color: '#1A1A00',
        fontWeight: '600',
        fontSize: 14,
    },

    footer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
});