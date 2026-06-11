import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRecentBooks, useRecentPodcasts } from '../hooks/useRecent';
import { BookProgress, PodcastProgress } from '../services/supabaselibrary';

// ─── Progress bar ─────────────────────────────────────────────────────────────

const ProgressBar = ({ position, total }: { position: number; total: number }) => {
    const pct = total > 0 ? Math.min(position / total, 1) : 0;
    return (
        <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${pct * 100}%` }]} />
        </View>
    );
};

// ─── Recent podcast card ──────────────────────────────────────────────────────

const RecentPodcastCard = ({ item }: { item: PodcastProgress }) => (
    <TouchableOpacity
        style={styles.card}
        activeOpacity={0.75}
        onPress={() => router.push({
            pathname: '/Player',
            params: {
                audioUrl:  '',               // will be fetched by Player
                title:     item.title,
                image:     item.poster,
                episodeId: item.podcast_id,
                resumeMs:  item.position_ms, // ✅ resume position
            },
        })}
    >
        {item.poster ? (
            <Image source={{ uri: item.poster }} style={styles.cardImage} resizeMode="cover" />
        ) : (
            <View style={[styles.cardImage, styles.imageFallback]}>
                <Ionicons name="headset-outline" size={22} color="#444" />
            </View>
        )}

        <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
            <ProgressBar position={item.position_ms} total={item.duration_ms} />
            <Text style={styles.cardSub}>
                {item.completed ? 'مكتمل ✓' : 'متابعة الاستماع'}
            </Text>
        </View>
    </TouchableOpacity>
);

// ─── Recent book card ─────────────────────────────────────────────────────────

const RecentBookCard = ({ item }: { item: BookProgress }) => (
    <TouchableOpacity
        style={styles.card}
        activeOpacity={0.75}
        onPress={() => router.push({
            pathname: '/BookDetail',
            params: { bookId: item.book_id },
        })}
    >
        {item.cover_image ? (
            <Image source={{ uri: item.cover_image }} style={styles.bookImage} resizeMode="cover" />
        ) : (
            <View style={[styles.bookImage, styles.imageFallback]}>
                <Ionicons name="book-outline" size={20} color="#444" />
            </View>
        )}

        <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
            <ProgressBar position={item.current_page} total={item.total_pages} />
            <Text style={styles.cardSub}>
                صفحة {item.current_page} من {item.total_pages}
            </Text>
        </View>
    </TouchableOpacity>
);

// ─── Section wrapper ──────────────────────────────────────────────────────────

const SectionHeader = ({ title, icon }: { title: string; icon: string }) => (
    <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
            <Ionicons name={icon as any} size={14} color="#888" />
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
    </View>
);

// ─── Main component ───────────────────────────────────────────────────────────

const RecentSections = () => {
    const { user } = useAuth();
    const { recent: recentPodcasts } = useRecentPodcasts();
    const { recent: recentBooks }    = useRecentBooks();

    if (!user) return null;
    if (!recentPodcasts.length && !recentBooks.length) return null;

    return (
        <>
            {/* Recent podcasts */}
            {recentPodcasts.length > 0 && (
                <View style={styles.section}>
                    <SectionHeader title="استمعت مؤخراً" icon="headset-outline" />
                    <FlatList
                        data={recentPodcasts}
                        keyExtractor={(item) => item.podcast_id}
                        renderItem={({ item }) => <RecentPodcastCard item={item} />}
                        horizontal
                        inverted
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.list}
                        ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
                    />
                </View>
            )}

            {/* Recent books */}
            {recentBooks.length > 0 && (
                <View style={styles.section}>
                    <SectionHeader title="قرأت مؤخراً" icon="book-outline" />
                    <FlatList
                        data={recentBooks}
                        keyExtractor={(item) => item.book_id}
                        renderItem={({ item }) => <RecentBookCard item={item} />}
                        horizontal
                        inverted
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.list}
                        ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
                    />
                </View>
            )}
        </>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    sectionTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    list: {
        paddingHorizontal: 16,
    },
    card: {
        width: 200,
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        overflow: 'hidden',
        padding: 10,
        gap: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardImage: {
        width: 56,
        height: 56,
        borderRadius: 8,
        flexShrink: 0,
    },
    bookImage: {
        width: 44,
        height: 60,
        borderRadius: 6,
        flexShrink: 0,
    },
    imageFallback: {
        backgroundColor: '#2A2A2A',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardInfo: {
        flex: 1,
        gap: 4,
    },
    cardTitle: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '600',
        textAlign: 'right',
        lineHeight: 16,
    },
    cardSub: {
        color: '#555',
        fontSize: 10,
        textAlign: 'right',
    },
    progressTrack: {
        height: 3,
        backgroundColor: '#2A2A2A',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#0bd46c',
        borderRadius: 2,
    },
});

export default RecentSections;