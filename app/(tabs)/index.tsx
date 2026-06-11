import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import {
    ActivityIndicator,
    FlatList,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

import { Book } from '../../components/BookCard';
import BookCardSmall from '../../components/Bookcardsmall';
import RecentSections from '../../components/RecentSections';
import SaveButton from '../../components/SavedButton';
import Text from '../../components/Text';
import EpisodeListCard from '../../components/mainCardComponent';
import { useArabicPodcast } from '../../hooks/useArabicPodcast';
import { useBooks } from '../../hooks/useBook';
import { Episode, useHome } from '../../hooks/useHome';

type Pair = {
    key: string;
    top: Episode;
    bottom?: Episode;
};

type SectionProps = {
    title: string;
    isSubscriber?: boolean;
    episodes: Episode[];
    onSeeAll: () => void;
    onPressCard: (id: string) => void;
};

const toPairs = (episodes: Episode[]): Pair[] => {
    const result: Pair[] = [];
    for (let i = 0; i < episodes.length; i += 2) {
        result.push({ key: `pair-${i}`, top: episodes[i], bottom: episodes[i + 1] });
    }
    return result;
};

const HorizontalSection: React.FC<SectionProps> = ({
    title, isSubscriber, episodes, onSeeAll, onPressCard,
}) => {
    const pairs = toPairs(episodes);

    const renderPair = ({ item }: { item: Pair }) => (
        <View style={styles.pairContainer}>

            {/* TOP */}
            <View style={styles.episodeRow}>
                <TouchableOpacity
                    onPress={() => onPressCard(item.top.id)}
                    activeOpacity={0.75}
                >
                    <EpisodeListCard
                        id={item.top.id}
                        poster={item.top.poster}
                        title={item.top.title}
                        description={item.top.description}
                        duration={item.top.duration}
                        publishedAt={item.top.publishedAt}
                        isSaved={false}
                        onSaveToggle={() => { }}
                        onPress={() => onPressCard(item.top.id)}
                    />
                </TouchableOpacity>

                <View style={styles.saveOverlay}>
                    <SaveButton
                        podcastId={item.top.id}
                        title={item.top.title}
                        poster={item.top.poster ?? ''}
                        duration={item.top.duration}
                        publishedAt={item.top.publishedAt}
                    />
                </View>
            </View>

            {/* BOTTOM */}
            {item.bottom && (
                <View style={styles.episodeRow}>
                    <TouchableOpacity
                        onPress={() => onPressCard(item.bottom!.id)}
                        activeOpacity={0.75}
                    >
                        <EpisodeListCard
                            id={item.bottom.id}
                            poster={item.bottom.poster}
                            title={item.bottom.title}
                            description={item.bottom.description}
                            duration={item.bottom.duration}
                            publishedAt={item.bottom.publishedAt}
                            isSaved={false}
                            onSaveToggle={() => { }}
                            onPress={() => onPressCard(item.bottom!.id)}
                        />
                    </TouchableOpacity>

                    <View style={styles.saveOverlay}>
                        <SaveButton
                            podcastId={item.bottom.id}
                            title={item.bottom.title}
                            poster={item.bottom.poster ?? ''}
                            duration={item.bottom.duration}
                            publishedAt={item.bottom.publishedAt}
                        />
                    </View>
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <TouchableOpacity onPress={onSeeAll} style={styles.seeAllBtn}>
                    <Text style={styles.seeAllText}>عرض الكل</Text>
                    <Ionicons name="chevron-back" size={14} color="#888" />
                </TouchableOpacity>

                <View style={styles.sectionTitleRow}>
                    {isSubscriber && <Ionicons name="star" size={14} color="#F5C842" />}
                    <Text style={styles.sectionTitle}>{title}</Text>
                </View>
            </View>

            <FlatList
                data={pairs}
                keyExtractor={(item) => item.key}
                renderItem={renderPair}
                horizontal
                inverted
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.list}
                ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
            />
        </View>
    );
};

// do not forget to put this comp to the right folder it is done for the testing !!
const BooksSection = () => {
    const { books, loading } = useBooks();
    const preview = books.slice(0, 20);

    const handlePress = useCallback((book: Book) => {
        router.push({ pathname: '/BookDetail', params: { bookId: book.id } });
    }, []);

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <TouchableOpacity
                    onPress={() => router.push('/(tabs)/library')}
                    style={styles.seeAllBtn}
                >
                    <Text style={styles.seeAllText}>عرض الكل</Text>
                    <Ionicons name="chevron-back" size={14} color="#888" />
                </TouchableOpacity>

                <View style={styles.sectionTitleRow}>
                    <Ionicons name="book-outline" size={14} color="#888" />
                    <Text style={styles.sectionTitle}>كتب مجانية</Text>
                </View>
            </View>

            {loading && preview.length === 0 ? (
                <View style={styles.booksLoader}>
                    <ActivityIndicator size="small" color="green" />
                </View>
            ) : (
                <FlatList
                    data={preview}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <BookCardSmall item={item} onPress={handlePress} />
                    )}
                    horizontal
                    inverted
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.list}
                    ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
                />
            )}
        </View>
    );
};

const HomeScreen = () => {
    const { hearFirst, youMightLike, loading, error, retry } = useHome();
    const { podcasts } = useArabicPodcast();

    if (loading) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator color="green" />
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.center}>
                <Text style={{ color: 'green' }}>حدث خطأ</Text>
                <TouchableOpacity onPress={retry}>
                    <Text style={{ color: '#F5C842' }}>إعادة المحاولة</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <RecentSections />

                <HorizontalSection
                    title="اسمعها أولاً"
                    isSubscriber
                    episodes={hearFirst}
                    onSeeAll={() => router.push('/HearItFirst' as any)}
                    onPressCard={(id) =>
                        router.push({
                            pathname: '/podcastdetail',
                            params: { podcastId: id },
                        })
                    }
                />

                <BooksSection />

                <HorizontalSection
                    title="قد يعجبك"
                    episodes={youMightLike}
                    onSeeAll={() => router.push('/YouMightLike' as any)}
                    onPressCard={(id) =>
                        router.push({
                            pathname: '/podcastdetail',
                            params: { podcastId: id },
                        })
                    }
                />

                <HorizontalSection
                    title="بودكاست عربي"
                    episodes={podcasts}
                    onSeeAll={() => router.push('/YouMightLike' as any)}
                    onPressCard={(id) =>
                        router.push({
                            pathname: '/podcastdetail',
                            params: { podcastId: id },
                        })
                    }
                />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#000',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
    },
    scrollContent: {
        paddingBottom: 120,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    seeAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    seeAllText: {
        color: '#888',
        fontSize: 13,
    },
    list: {
        paddingHorizontal: 16,
    },
    pairContainer: {
        width: 300,
        gap: 12,
    },
    episodeRow: {
        position: 'relative',
    },
    saveOverlay: {
        position: 'absolute',
        top: 8,
        left: 8,
        zIndex: 10,
        elevation: 10,
    },
    booksLoader: {
        height: 180,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default HomeScreen;