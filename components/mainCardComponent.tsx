import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';


/**
 * EpisodeListCard
 *
 * Layout: [Image] | [Title, Description, Duration + Date]
 *
 * Props:
 * - id           : string
 * - poster       : string  — image URI
 * - title        : string  — episode title (Arabic)
 * - description  : string  — optional short description
 * - duration     : string  — e.g. "١ س ٤ د"
 * - publishedAt  : string  — e.g. "١٣ يوليو ٢٠٢٤"
 * - isSaved      : boolean
 * - onSaveToggle : (id: string, isSaved: boolean) => void
 * - onPress      : () => void
 */

type EpisodeListCardProps = {
    id: string;
    poster?: string;
    title: string;
    description?: string;
    duration?: string;
    publishedAt?: string;
    isSaved?: boolean;
    onSaveToggle?: (id: string, isSaved: boolean) => void;
    onPress?: () => void;
};

const EpisodeListCard: React.FC<EpisodeListCardProps> = ({
    id,
    poster,
    title,
    description,
    duration,
    publishedAt,
    isSaved = false,
    onSaveToggle,
    onPress,
}) => {
    const [saved, setSaved] = useState(isSaved);

    const handleSave = () => {
        const next = !saved;
        setSaved(next);
        onSaveToggle?.(id, next);
    };

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.75}
        >
            {/* Left — Poster */}
            <View style={styles.imageWrapper}>
                {poster ? (
                    <Image
                        source={{ uri: poster }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={[styles.image, styles.imagePlaceholder]}>
                        <Ionicons name="mic" size={24} color="#444" />
                    </View>
                )}
            </View>

            {/* Right — Content */}
            <View style={styles.content}>

                {/* Top: title + bookmark on same row */}
                <View style={styles.titleRow}>
                    <TouchableOpacity
                        onPress={handleSave}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        accessibilityLabel={saved ? 'إزالة من المحفوظات' : 'حفظ'}
                        style={styles.bookmarkBtn}
                    >
                        <Ionicons
                            name={saved ? 'bookmark' : 'bookmark-outline'}
                            size={16}
                            color={saved ? 'green' : '#555'}
                        />
                    </TouchableOpacity>

                    {/* Title — strictly 1 line, truncates with ellipsis */}
                    <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                        {title}
                    </Text>
                </View>

                {/* Description — 2 lines max, only if provided */}
                {description ? (
                    <Text style={styles.description} numberOfLines={2} ellipsizeMode="tail">
                        {description} 
                    </Text>
                ) : null}

                {/* Bottom — date left, duration pill right */}
                <View style={styles.bottomRow}>
                    {publishedAt ? (
                        <Text style={styles.date} numberOfLines={1}>
                            {publishedAt}
                        </Text>
                    ) : null}

                    {duration ? (
                        <View style={styles.durationPill}>
                            <Ionicons name="play" size={9} color="black" />
                            <Text style={styles.durationText}>{duration}</Text>
                        </View>
                    ) : null}
                </View>

            </View>
        </TouchableOpacity>
    );
};

const CARD_HEIGHT = 90; // fixed — image is 70px, card has 10px padding top+bottom

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: '#0000001w',
        borderRadius: 12,
        padding: 10,
        gap: 10,
        alignItems: 'center',   // vertically center image with content
        height: CARD_HEIGHT,    // ✅ fixed height — no more expanding cards
    },

    // ── Image ──────────────────────────────────────────
    imageWrapper: {
        borderRadius: 8,
        overflow: 'hidden',
        flexShrink: 0,
    },
    image: {
        width: 70,
        height: 70,
    },
    imagePlaceholder: {
        backgroundColor: '#2A2A2A',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // ── Content ────────────────────────────────────────
    content: {
        flex: 1,
        height: 70,             // match image height exactly
        justifyContent: 'space-between',
        overflow: 'hidden',
    },

    // Title row: title + bookmark side by side
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    title: {
        flex: 1,                // takes all width except bookmark
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'right',
        writingDirection: 'rtl',
    },
    bookmarkBtn: {
        flexShrink: 0,
    },

    description: {
        color: '#666',
        fontSize: 10,
        textAlign: 'right',
        writingDirection: 'rtl',
        lineHeight: 14,
    },

    // ── Bottom row: date left, duration right ──────────
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    date: {
        color: '#555',
        fontSize: 10,
        flexShrink: 1,          // shrinks if date is long
        marginRight: 4,
    },
    durationPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: '#0bd46c',
        borderRadius: 20,
        paddingHorizontal: 7,
        paddingVertical: 3,
        flexShrink: 0,
    },
    durationText: {
        color: 'black',
        fontSize: 10,
    },
});

export default EpisodeListCard;