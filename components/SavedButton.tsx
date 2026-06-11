import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useSaved } from '../hooks/useSaved';

type Props = {
    podcastId: string;
    title: string;
    poster?: string;
    duration?: string;
    publishedAt?: string;
    size?: number;
};

/**
 * SaveButton
 *
 * Drop-in save button that reads/writes directly to Supabase.
 * If not logged in, tapping redirects to login.
 * Optimistically updates UI before API call completes.
 *
 * Usage:
 *   <SaveButton
 *       podcastId={episode.id}
 *       title={episode.title}
 *       poster={episode.poster}
 *       duration={episode.duration}
 *       publishedAt={episode.publishedAt}
 *   />
 */
const SaveButton: React.FC<Props> = ({
    podcastId,
    title,
    poster = '',
    duration = '',
    publishedAt = '',
    size = 18,
}) => {
    const { user } = useAuth();
    const { savedIds, toggleSave } = useSaved();

    const isSaved = savedIds.has(podcastId);

    const handlePress = () => {
        if (!user) {
            const { router } = require('expo-router');
            router.push('/auth/login');
            return;
        }
        console.log('🔥 SAVE BUTTON PRESSED')

        toggleSave(podcastId, !isSaved, {
            title,
            poster,
            duration,
            published_at: publishedAt,
        });
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.btn}
            accessibilityLabel={isSaved ? 'إزالة من المحفوظات' : 'حفظ'}
        >
            <Ionicons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={size}
                color={isSaved ? '#F5C842' : '#555'}
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    btn: {
        flexShrink: 0,
    },
});

export default SaveButton;