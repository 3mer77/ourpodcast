import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Book } from './BookCard';

type Props = {
    item: Book;
    onPress: (book: Book) => void;
};

const formatAuthor = (authors: Book['authors']) => {
    if (!authors?.length) return '';
    const raw = authors[0].name;
    const parts = raw.split(',');
    return parts.length > 1 ? `${parts[1].trim()} ${parts[0].trim()}` : raw;
};

const BookCardSmall: React.FC<Props> = ({ item, onPress }) => (
    <TouchableOpacity
        style={styles.card}
        onPress={() => onPress(item)}
        activeOpacity={0.75}
    >
        {item.cover_image ? (
            <Image
                source={{ uri: item.cover_image }}
                style={styles.cover}
                resizeMode="cover"
            />
        ) : (
            <View style={styles.coverFallback}>
                <Ionicons name="book-outline" size={24} color="#444" />
            </View>
        )}

        <View style={styles.info}>
            <Text style={styles.title} numberOfLines={2}>
                {item.title}
            </Text>
            <Text style={styles.author} numberOfLines={1}>
                {formatAuthor(item.authors)}
            </Text>
            <View style={styles.downloadRow}>
                <Ionicons name="download-outline" size={10} color="#555" />
                <Text style={styles.downloadText}>
                    {item.download_count >= 1000
                        ? `${(item.download_count / 1000).toFixed(0)}k`
                        : item.download_count}
                </Text>
            </View>
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    card: {
        width: 110,
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        overflow: 'hidden',
    },
    cover: {
        width: '100%',
        height: 140,
    },
    coverFallback: {
        width: '100%',
        height: 140,
        backgroundColor: '#2A2A2A',
        alignItems: 'center',
        justifyContent: 'center',
    },
    info: {
        padding: 8,
        gap: 3,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '600',
        lineHeight: 15,
    },
    author: {
        color: '#666',
        fontSize: 10,
    },
    downloadRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        marginTop: 2,
    },
    downloadText: {
        color: '#555',
        fontSize: 10,
    },
});

export default BookCardSmall;