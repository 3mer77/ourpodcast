import { useAudioStore } from "@/store/useAudioStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MiniPlayer() {
    const { currentEpisode, isPlaying, pause, resume, stop } = useAudioStore();
    const insets = useSafeAreaInsets();

    if (!currentEpisode) return null;

    const handlePressBar = () => {
        router.push({
            pathname: '/Player',
            params: {
                episodeId: currentEpisode.episodeId,
                audioUrl:  currentEpisode.url,
                title:     currentEpisode.title,
                image:     currentEpisode.image,
                podcastId: currentEpisode.podcastId,
            },
        });
    };

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={handlePressBar}
            style={[
                styles.container,
                { bottom: Math.max(70, insets.bottom + 60) }
            ]}
        >
            <Image
                source={{ uri: currentEpisode.image }}
                style={styles.cover}
            />

            <View style={styles.info}>
                <Text numberOfLines={1} style={styles.title}>
                    {currentEpisode.title}
                </Text>
                <Text style={styles.statusText}>
                    {isPlaying ? "جارٍ التشغيل..." : "متوقف مؤقتاً"}
                </Text>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    onPress={isPlaying ? pause : resume}
                    style={styles.playBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons
                        name={isPlaying ? "pause" : "play"}
                        size={22}
                        color="#1A1A00"
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={stop}
                    style={styles.closeBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons
                        name="close"
                        size={18}
                        color="#888"
                    />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        left: 12,
        right: 12,
        backgroundColor: "#1A1A1A",
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 14,
        zIndex: 999,
        elevation: 10,
        borderWidth: 1,
        borderColor: "#2A2A2A",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
    },
    cover: {
        width: 44,
        height: 44,
        borderRadius: 10,
    },
    info: {
        flex: 1,
        marginHorizontal: 12,
    },
    title: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "600",
        textAlign: "right",
    },
    statusText: {
        color: "#888",
        fontSize: 11,
        textAlign: "right",
        marginTop: 2,
    },
    actions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    playBtn: {
        backgroundColor: "#0bd46c",
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: "center",
        justifyContent: "center",
    },
    closeBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#2A2A2A",
        alignItems: "center",
        justifyContent: "center",
    },
});