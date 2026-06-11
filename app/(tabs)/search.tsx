import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import {
    ActivityIndicator,
    FlatList,
    ListRenderItem,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import EpisodeListCard from '../../components/mainCardComponent';
import { SearchResult, useSearch } from '../../hooks/useSaerch';

// ─── Empty / idle state ───────────────────────────────────────────────────────

const IdleState = () => (
    <View style={styles.centered}>
        <Ionicons name="search" size={48} color="#2A2A2A" />
        <Text style={styles.idleText}>ابحث عن بودكاست</Text>
        <Text style={styles.idleSubText}>اكتب اسم البودكاست أو الموضوع</Text>
    </View>
);

const EmptyState = () => (
    <View style={styles.centered}>
        <Ionicons name="sad-outline" size={48} color="#2A2A2A" />
        <Text style={styles.idleText}>لا توجد نتائج</Text>
        <Text style={styles.idleSubText}>جرّب كلمة بحث مختلفة</Text>
    </View>
);

const ErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
    <View style={styles.centered}>
        <Ionicons name="cloud-offline-outline" size={48} color="#2A2A2A" />
        <Text style={styles.idleText}>حدث خطأ ما</Text>
        <Text style={styles.idleSubText}>{message}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
            <Text style={styles.retryTxt}>إعادة المحاولة</Text>
        </TouchableOpacity>
    </View>
);

// ─── Search screen ────────────────────────────────────────────────────────────

const SearchScreen = () => {
    const { query, setQuery, results, loading, error } = useSearch();

    const handlePressCard = useCallback((id: string) => {
        router.push({
            pathname: '/podcastdetail',
            params: { podcastId: id },
        });
    }, []);

    const handleClear = useCallback(() => setQuery(''), [setQuery]);

    const renderItem: ListRenderItem<SearchResult> = useCallback(
        ({ item }) => (
            <EpisodeListCard
                id={item.id}
                poster={item.image}
                title={item.title}
                description={item.description}
                onPress={() => handlePressCard(item.id)}
            />
        ),
        [handlePressCard]
    );

    // ── Decide what to show in the body ──────────────────────────────────────
    const renderBody = () => {
        if (loading) {
            return (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#F5C842" />
                </View>
            );
        }

        if (error) {
            return (
                <ErrorState
                    message={error}
                    onRetry={() => setQuery(query)} // re-trigger the same query
                />
            );
        }

        if (!query.trim()) return <IdleState />;

        if (results.length === 0) return <EmptyState />;

        return (
            <FlatList
                data={results}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled" // keeps keyboard open while scrolling
            />
        );
    };

    return (
        <SafeAreaView style={styles.safe}>

            {/* Search bar */}
            <View style={styles.searchBar}>
                <Ionicons name="search" size={18} color="#555" />

                <TextInput
                    style={styles.input}
                    value={query}
                    onChangeText={setQuery}
                    placeholder="ابحث..."
                    placeholderTextColor="#444"
                    returnKeyType="search"
                    autoCorrect={false}
                    autoCapitalize="none"
                    textAlign="right"       // ✅ RTL input
                />

                {/* Clear button — only shows when there is text */}
                {query.length > 0 && (
                    <TouchableOpacity onPress={handleClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Ionicons name="close-circle" size={18} color="#555" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Body */}
            {renderBody()}

        </SafeAreaView>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#000000',
    },

    // ── Search bar ────────────────────────────────────
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        marginHorizontal: 16,
        marginVertical: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    input: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 15,
        padding: 0,             // remove default TextInput padding
    },

    // ── States ────────────────────────────────────────
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingBottom: 80,
    },
    idleText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 12,
    },
    idleSubText: {
        color: '#555',
        fontSize: 13,
        textAlign: 'center',
        paddingHorizontal: 32,
    },
    retryBtn: {
        marginTop: 12,
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

    // ── List ──────────────────────────────────────────
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    separator: {
        height: 10,
    },
});

export default SearchScreen;