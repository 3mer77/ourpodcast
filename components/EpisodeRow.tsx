import { Ionicons } from '@expo/vector-icons';
import React, { useCallback } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import EpisodeCard from './mainCardComponent';

/**
 * EpisodeRow
 *
 * Renders a section with a title + "see all" link, then a
 * horizontal FlatList that shows episodes in 2 rows (top + bottom).
 *
 * Props:
 * - title        : string  — section heading (Arabic)
 * - episodes     : array   — list of episode objects
 * - onSaveToggle : (id, bool) => void
 * - onSeeAll     : () => void
 * - isSubscriber : bool    — show gold star badge on title
 */

interface Props {
    title: string,
    episodes: any,
    onSaveToggle: (id: string, isSaved: boolean) => void
    onSeeAll: () => void,
    isSubscriber: boolean

}
const EpisodeRow = ({
    title,
    episodes = [],
    onSaveToggle,
    onSeeAll,
    isSubscriber = false,
}: Props) => {

    // Split episodes into pairs so each column = [top, bottom]
    const columns = [];
    for (let i = 0; i < episodes.length; i += 2) {
        columns.push({
            key: `col-${i}`,
            top: episodes[i],
            bottom: episodes[i + 1] || null,
        });
    }

    const renderColumn = useCallback(({ item }: any) => (
        <View style={styles.column}>
            <EpisodeCard
                id={item.top.id}
                poster={item.top.poster}
                title={item.top.title}
                duration={item.top.duration}
                publishedAt={item.top.publishedAt}
                isSaved={item.top.isSaved}
                onSaveToggle={onSaveToggle}
            />
            {item.bottom && (
                <EpisodeCard
                    id={item.bottom.id}
                    poster={item.bottom.poster}
                    title={item.bottom.title}
                    duration={item.bottom.duration}
                    publishedAt={item.bottom.publishedAt}
                    isSaved={item.bottom.isSaved}
                    onSaveToggle={onSaveToggle}
                />
            )}
        </View>
    ), [onSaveToggle]);

    return (
        <View style={styles.container}>
            {/* Section header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onSeeAll} style={styles.seeAll}>
                    <Text style={styles.seeAllText}>عرض الكل</Text>
                    <Ionicons name="chevron-back" size={14} color="#888" />
                </TouchableOpacity>

                <View style={styles.titleRow}>
                    {isSubscriber && (
                        <Ionicons name="star" size={14} color="#F5C842" />
                    )}
                    <Text style={styles.sectionTitle}>{title}</Text>
                </View>
            </View>

            {/* Horizontal 2-row list */}
            <FlatList
                data={columns}
                keyExtractor={(item) => item.key}
                renderItem={renderColumn}
                horizontal
                inverted // RTL scroll direction
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    sectionTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'right',
    },
    seeAll: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    seeAllText: {
        color: '#888',
        fontSize: 13,
    },
    listContent: {
        paddingHorizontal: 16,
    },
    column: {
        gap: 12,
    },
});

export default EpisodeRow;