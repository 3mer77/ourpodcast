import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useSaved } from '../../hooks/useSaved';
import { useSavedBooks } from '../../hooks/useSavedbooks';
import { SavedBook, SavedPodcast } from '../../services/supabaselibrary';

import { useFocusEffect } from 'expo-router';

// ─── Tab switcher ─────────────────────────────────────────────────────────────

type Tab = 'podcasts' | 'books';

const TabBar = ({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) => (
    <View style={styles.tabBar}>
        <TouchableOpacity
            style={[styles.tab, active === 'podcasts' && styles.tabActive]}
            onPress={() => onChange('podcasts')}
        >
            <Ionicons
                name="headset-outline"
                size={16}
                color={active === 'podcasts' ? '#0bd46c' : '#555'}
            />
            <Text style={[styles.tabText, active === 'podcasts' && styles.tabTextActive]}>
                بودكاست
            </Text>
        </TouchableOpacity>

        <TouchableOpacity
            style={[styles.tab, active === 'books' && styles.tabActive]}
            onPress={() => onChange('books')}
        >
            <Ionicons
                name="book-outline"
                size={16}
                color={active === 'books' ? '#0bd46c' : '#555'}
            />
            <Text style={[styles.tabText, active === 'books' && styles.tabTextActive]}>
                كتب
            </Text>
        </TouchableOpacity>
    </View>
);

// ─── Saved podcast row ────────────────────────────────────────────────────────

const PodcastRow = ({
    item,
    onPress,
    onUnsave,
}: {
    item: SavedPodcast;
    onPress: () => void;
    onUnsave: () => void;
}) => (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.75}>
        {item.poster ? (
            <Image source={{ uri: item.poster }} style={styles.rowImage} resizeMode="cover" />
        ) : (
            <View style={[styles.rowImage, styles.rowImageFallback]}>
                <Ionicons name="headset-outline" size={24} color="#444" />
            </View>
        )}

        <View style={styles.rowContent}>
            <Text style={styles.rowTitle} numberOfLines={2}>{item.title}</Text>
            <View style={styles.rowMeta}>
                {item.duration ? (
                    <View style={styles.durationPill}>
                        <Ionicons name="play" size={9} color="#aaa" />
                        <Text style={styles.durationText}>{item.duration}</Text>
                    </View>
                ) : null}
                {item.published_at ? (
                    <Text style={styles.dateText}>{item.published_at}</Text>
                ) : null}
            </View>
        </View>

        <TouchableOpacity
            onPress={onUnsave}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.unsaveBtn}
        >
            <Ionicons name="bookmark" size={20} color="#F5C842" />
        </TouchableOpacity>
    </TouchableOpacity>
);

// ─── Saved book row ───────────────────────────────────────────────────────────

const BookRow = ({
    item,
    onPress,
    onUnsave,
}: {
    item: SavedBook;
    onPress: () => void;
    onUnsave: () => void;
}) => (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.75}>
        {item.cover_image ? (
            <Image source={{ uri: item.cover_image }} style={styles.bookImage} resizeMode="cover" />
        ) : (
            <View style={[styles.bookImage, styles.rowImageFallback]}>
                <Ionicons name="book-outline" size={20} color="#444" />
            </View>
        )}

        <View style={styles.rowContent}>
            <Text style={styles.rowTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.dateText}>
                {new Date(item.created_at).toLocaleDateString('ar-SA', {
                    day: 'numeric', month: 'long', year: 'numeric',
                })}
            </Text>
        </View>

        <TouchableOpacity
            onPress={onUnsave}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.unsaveBtn}
        >
            <Ionicons name="bookmark" size={20} color="#F5C842" />
        </TouchableOpacity>
    </TouchableOpacity>
);

// ─── Empty state ──────────────────────────────────────────────────────────────

const Empty = ({ type }: { type: Tab }) => (
    <View style={styles.empty}>
        <Ionicons
            name={type === 'podcasts' ? 'headset-outline' : 'book-outline'}
            size={56}
            color="#2A2A2A"
        />
        <Text style={styles.emptyTitle}>
            {type === 'podcasts' ? 'لا توجد حلقات محفوظة' : 'لا توجد كتب محفوظة'}
        </Text>
        <Text style={styles.emptySub}>
            {type === 'podcasts'
                ? 'احفظ الحلقات التي تريد سماعها لاحقاً'
                : 'احفظ الكتب التي تريد قراءتها لاحقاً'}
        </Text>
    </View>
);

// ─── Not logged in ────────────────────────────────────────────────────────────

const NotLoggedIn = () => (
    <View style={styles.empty}>
        <Ionicons name="lock-closed-outline" size={56} color="#2A2A2A" />
        <Text style={styles.emptyTitle}>تسجيل الدخول مطلوب</Text>
        <Text style={styles.emptySub}>سجّل دخولك لحفظ المحتوى والوصول إليه</Text>
        <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.push('/(auth)/login')}
        >
            <Text style={styles.loginBtnText}>تسجيل الدخول</Text>
        </TouchableOpacity>
    </View>
);

// ─── Favorites screen ─────────────────────────────────────────────────────────

export default function FavoritesScreen() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('podcasts');

    const { saved, loading: loadingPodcasts, toggleSave, loadSaved } = useSaved();
    const { savedBooks, loading: loadingBooks, toggleSaveBook, loadSavedBooks } = useSavedBooks();

    const [refreshing, setRefreshing] = useState(false);


    useFocusEffect(
    React.useCallback(() => {
        if (!user) return;

        loadSaved();
        loadSavedBooks();
    }, [user])
);

    // load full lists when screen mounts
    useEffect(() => {
        if (!user) return;
        loadSaved();
        loadSavedBooks();
    }, [user]);

    if (!user) return (
        <SafeAreaView style={styles.safe}>
            <Text style={styles.screenTitle}>المحفوظات</Text>
            <NotLoggedIn />
        </SafeAreaView>
    );

    const isLoading = activeTab === 'podcasts' ? loadingPodcasts : loadingBooks;

    return (
        <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>

            <Text style={styles.screenTitle}>المحفوظات</Text>

            <TabBar active={activeTab} onChange={setActiveTab} />

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#F5C842" />
                </View>
            ) : activeTab === 'podcasts' ? (
                <FlatList
                    data={saved}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <PodcastRow
                            item={item}
                            onPress={() => router.push({
                                pathname: '/podcastdetail',
                                params: { podcastId: item.podcast_id },
                            })}
                            onUnsave={() => toggleSave(item.podcast_id, false)}
                        />
                    )}
                    ListEmptyComponent={<Empty type="podcasts" />}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                              
                />
            ) : (
                <FlatList
                    data={savedBooks}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <BookRow
                            item={item}
                            onPress={() => router.push({
                                pathname: '/BookDetail',
                                params: { bookId: item.book_id },
                            })}
                            onUnsave={() => toggleSaveBook(item.book_id, false)}
                        />
                    )}
                    ListEmptyComponent={<Empty type="books" />}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                              
                />
            )}
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#000000',
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    screenTitle: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'right',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
    },

    // ── Tab bar ───────────────────────────────────────
    tabBar: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginBottom: 16,
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 4,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 10,
    },
    tabActive: {
        backgroundColor: '#0D0D0D',
    },
    tabText: {
        color: '#555',
        fontSize: 14,
        fontWeight: '500',
    },
    tabTextActive: {
        color: '#0bd46c',
        fontWeight: '700',
    },

    // ── Rows ──────────────────────────────────────────
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 120,
    },
    separator: {
        height: 10,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 10,
        gap: 12,
    },
    rowImage: {
        width: 70,
        height: 70,
        borderRadius: 8,
        flexShrink: 0,
    },
    bookImage: {
        width: 52,
        height: 72,
        borderRadius: 6,
        flexShrink: 0,
    },
    rowImageFallback: {
        backgroundColor: '#2A2A2A',
        alignItems: 'center',
        justifyContent: 'center',
    },
    rowContent: {
        flex: 1,
        gap: 6,
        justifyContent: 'center',
    },
    rowTitle: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'right',
        lineHeight: 18,
    },
    rowMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 8,
    },
    durationPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: '#2A2A2A',
        borderRadius: 20,
        paddingHorizontal: 7,
        paddingVertical: 3,
    },
    durationText: {
        color: '#aaa',
        fontSize: 10,
    },
    dateText: {
        color: '#555',
        fontSize: 10,
    },
    unsaveBtn: {
        flexShrink: 0,
        padding: 4,
    },

    // ── Empty ─────────────────────────────────────────
    empty: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingBottom: 80,
        paddingHorizontal: 32,
    },
    emptyTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 8,
        textAlign: 'center',
    },
    emptySub: {
        color: '#555',
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 20,
    },
    loginBtn: {
        backgroundColor: '#F5C842',
        borderRadius: 12,
        paddingVertical: 13,
        paddingHorizontal: 32,
        marginTop: 8,
    },
    loginBtnText: {
        color: '#1A1A00',
        fontWeight: '700',
        fontSize: 14,
    },
});