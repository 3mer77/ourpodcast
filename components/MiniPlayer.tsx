import { useAudioStore } from "@/store/useAudioStore";
import { Ionicons } from "@expo/vector-icons";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function MiniPlayer() {
    const { currentEpisode, isPlaying, pause, resume } = useAudioStore();

    // 🧠 IMPORTANT: if nothing is playing
    if (!currentEpisode) return null;

    return (
        <View
            style={{
                position: "absolute",
                bottom: 90,
                left: 10,
                right: 10,
                backgroundColor: "#1A1A1A",
                flexDirection: "row",
                alignItems: "center",
                padding: 10,
                borderRadius: 12,
                zIndex: 999,
                elevation: 10,
            }}
        >
            <Image
                source={{ uri: currentEpisode.image }}
                style={{ width: 45, height: 45, borderRadius: 8 }}
            />

            <View style={{ flex: 1, marginLeft: 10 }}>
                <Text
                    numberOfLines={1}
                    style={{ color: "#fff", fontSize: 13 }}
                >
                    {currentEpisode.title}
                </Text>
            </View>

            <TouchableOpacity onPress={isPlaying ? pause : resume}>
                <Ionicons
                    name={isPlaying ? "pause" : "play"}
                    size={22}
                    color="green"
                />
            </TouchableOpacity>
        </View>
    );
}