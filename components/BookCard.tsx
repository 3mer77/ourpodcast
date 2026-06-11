import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type Author = { id: number; name: string };

type Book = {
    id: number;
    title: string;
    authors: Author[];
    cover_image: string | null;
    download_count: number;
    reading_ease_score: string | null;
    subjects: string[];
    summary: string;
};

type Props = {
    item: Book;
    onPress: (book: Book) => void;
};

// ── helpers ───────────────────────────────────────────────────────────────────

const formatAuthor = (authors: Author[]) => {
    if (!authors?.length) return 'مجهول المؤلف';
    const raw = authors[0].name; // "Shelley, Mary Wollstonecraft"
    const parts = raw.split(',');
    return parts.length > 1
        ? `${parts[1].trim()} ${parts[0].trim()}`
        : raw;
};

const formatDownloads = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
    return n.toString();
};

const easeColor = (score: string | null) => {
    if (!score) return '#555';
    const n = parseFloat(score);
    if (n >= 70) return '#0bd46c';
    if (n >= 50) return '#F5C842';
    return '#FF6B6B';
};

// ── component ─────────────────────────────────────────────────────────────────

const BookCard: React.FC<Props> = ({ item, onPress }) => {
    const [saved, setSaved] = useState(false);

    const genre = item.subjects?.[0]
        ?.replace(/--.*/, '')
        .trim() ?? '';

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => onPress(item)}
            activeOpacity={0.75}
        >
            {/* Cover */}
            <View style={styles.coverWrapper}>
                {item.cover_image ? (
                    <Image
                        source={{ uri: item.cover_image }}
                        style={styles.cover}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.coverFallback}>
                        <Ionicons name="book-outline" size={28} color="#444" />
                    </View>
                )}
            </View>

            {/* Content */}
            <View style={styles.content}>

                {/* Title */}
                <Text style={styles.title} numberOfLines={2}>
                    {item.title}
                </Text>

                {/* Author */}
                <Text style={styles.author} numberOfLines={1}>
                    {formatAuthor(item.authors)}
                </Text>

                {/* Genre pill */}
                {genre ? (
                    <View style={styles.genrePill}>
                        <Text style={styles.genreText} numberOfLines={1}>
                            {genre}
                        </Text>
                    </View>
                ) : null}

                {/* Bottom row */}
                <View style={styles.bottomRow}>
                    {/* Downloads */}
                    <View style={styles.metaItem}>
                        <Ionicons name="download-outline" size={11} color="#555" />
                        <Text style={styles.metaText}>
                            {formatDownloads(item.download_count)}
                        </Text>
                    </View>

                    {/* Reading ease */}
                    {item.reading_ease_score ? (
                        <View style={styles.metaItem}>
                            <Ionicons name="speedometer-outline" size={11} color="#555" />
                            <Text style={[
                                styles.metaText,
                                { color: easeColor(item.reading_ease_score) }
                            ]}>
                                {parseFloat(item.reading_ease_score).toFixed(0)}
                            </Text>
                        </View>
                    ) : null}

                    {/* Save button */}
                    <TouchableOpacity
                        onPress={() => setSaved(!saved)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <Ionicons
                            name={saved ? 'bookmark' : 'bookmark-outline'}
                            size={16}
                            color={saved ? '#F5C842' : '#555'}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: '#1A1A1A',
        borderRadius: 14,
        padding: 12,
        gap: 12,
        alignItems: 'flex-start',
    },
    coverWrapper: {
        borderRadius: 8,
        overflow: 'hidden',
        flexShrink: 0,
    },
    cover: {
        width: 72,
        height: 100,
    },
    coverFallback: {
        width: 72,
        height: 100,
        backgroundColor: '#2A2A2A',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        gap: 5,
        minHeight: 100,
        justifyContent: 'space-between',
    },
    title: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
        lineHeight: 18,
    },
    author: {
        color: '#888',
        fontSize: 11,
    },
    genrePill: {
        alignSelf: 'flex-start',
        backgroundColor: '#2A2A2A',
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    genreText: {
        color: '#666',
        fontSize: 10,
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    metaText: {
        color: '#555',
        fontSize: 10,
    },
});

export default BookCard;
export type { Book };