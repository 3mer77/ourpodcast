import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    ListRenderItem,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import EpisodeListCard from '../components/mainCardComponent';
import { Episode, usePodcastDetail } from '../hooks/usePodcastDetail';

// ─── Podcast header ───────────────────────────────────────────────────────────

type HeaderProps = {
    image: string;
    title: string;
    publisher: string;
    description: string;
    totalEpisodes: number;
};

const PodcastHeader: React.FC<HeaderProps> = ({
    image,
    title,
    publisher,
    description,
    totalEpisodes,
}) => (
    <View style={styles.header}>
        <Image source={{ uri: image }} style={styles.cover} resizeMode="cover" />

        <Text style={styles.podcastTitle}>{title}</Text>
        <Text style={styles.publisher}>{publisher}</Text>

        <View style={styles.countPill}>
            <Ionicons name="headset-outline" size={13} color="#888" />
            <Text style={styles.countText}>{totalEpisodes} حلقة</Text>
        </View>

        <Text style={styles.description} numberOfLines={4}>
            {description}
        </Text>

        <Text style={styles.episodesLabel}>الحلقات</Text>
    </View>
);

// ─── Footer loader ────────────────────────────────────────────────────────────

const LoadingFooter = () => (
    <View style={styles.footer}>
        <ActivityIndicator size="small" color="#F5C842" />
    </View>
);

// ─── Main screen ──────────────────────────────────────────────────────────────

const PodcastDetailScreen = () => {
    // ✅ Expo Router — reads params from the URL
    const { podcastId } = useLocalSearchParams<{ podcastId: string }>();

    const {
        info,
        episodes,
        loading,
        loadingMore,
        hasMore,
        error,
        retry,
        loadMore,
    } = usePodcastDetail(podcastId);

    const handleEndReached = useCallback(() => {
        if (hasMore && !loadingMore) loadMore();
    }, [hasMore, loadingMore, loadMore]);

    const renderEpisode: ListRenderItem<Episode> = useCallback(
        ({ item }) => (
            <EpisodeListCard
                id={item.id}
                poster={item.image}
                title={item.title}
                description={item.description}
                duration={item.duration}
                publishedAt={item.publishedAt}
                onPress={() =>
                    router.push({
                        pathname: '/Player',
                        params: {
                            episodeId: item.id,
                            audioUrl:  item.audioUrl,
                            title:     item.title,
                            image:     item.image,
                            podcastId: podcastId,
                        },
                    })
                }
            />
        ),
        [podcastId]
    );

    // ── Loading ───────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <SafeAreaView style={[styles.safe, styles.center]}>
                <ActivityIndicator size="large" color="#F5C842" />
                <Text style={styles.loadingText}>جارٍ التحميل...</Text>
            </SafeAreaView>
        );
    }

    // ── Error ─────────────────────────────────────────────────────────────────
    if (error || !info) {
        return (
            <SafeAreaView style={[styles.safe, styles.center]}>
                <Text style={styles.errorText}>حدث خطأ ما</Text>
                <Text style={styles.errorDetail}>{error}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={retry}>
                    <Text style={styles.retryTxt}>إعادة المحاولة</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    // ── Main ──────────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.safe}>

            {/* ✅ Back button uses router.back() */}
            <TouchableOpacity
                style={styles.backBtn}
                onPress={() => router.back()}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Ionicons name="chevron-forward" size={22} color="#fff" />
            </TouchableOpacity>

            <FlatList
                data={episodes}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                renderItem={renderEpisode}
                ListHeaderComponent={
                    <PodcastHeader
                        image={info.image}
                        title={info.title}
                        publisher={info.publisher}
                        description={info.description}
                        totalEpisodes={info.totalEpisodes}
                    />
                }
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.1}
                ListFooterComponent={loadingMore ? <LoadingFooter /> : null}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>لا توجد حلقات</Text>
                }
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews
            />
        </SafeAreaView>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#000000',
    },
    center: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    backBtn: {
        position: 'absolute',
        top: 56,
        left: 16,
        zIndex: 10,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 24,
    },
    cover: {
        width: 180,
        height: 180,
        borderRadius: 16,
        marginBottom: 20,
    },
    podcastTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        writingDirection: 'rtl',
        marginBottom: 6,
    },
    publisher: {
        color: '#888',
        fontSize: 13,
        textAlign: 'center',
        marginBottom: 12,
    },
    countPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: '#1A1A1A',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 5,
        marginBottom: 16,
    },
    countText: {
        color: '#888',
        fontSize: 12,
    },
    description: {
        color: '#666',
        fontSize: 13,
        textAlign: 'right',
        writingDirection: 'rtl',
        lineHeight: 20,
        marginBottom: 28,
    },
    episodesLabel: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
        textAlign: 'right',
        writingDirection: 'rtl',
        alignSelf: 'flex-end',
        marginBottom: 12,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    separator: {
        height: 10,
    },
    footer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    emptyText: {
        color: '#555',
        textAlign: 'center',
        marginTop: 40,
        fontSize: 14,
    },
    loadingText: {
        color: '#888',
        fontSize: 14,
        marginTop: 8,
    },
    errorText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    errorDetail: {
        color: '#888',
        fontSize: 12,
        textAlign: 'center',
        paddingHorizontal: 32,
    },
    retryBtn: {
        marginTop: 8,
        backgroundColor: '#F5C842',
        borderRadius: 20,
        paddingHorizontal: 24,
        paddingVertical: 10,
    },
    retryTxt: {
        color: '#1A1A00',
        fontWeight: '600',
        fontSize: 14,
    },
});

export default PodcastDetailScreen;