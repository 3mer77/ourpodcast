import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useAudioStore } from "../store/useAudioStore";
import PaywallScreen from '../components/PayWallScreen';
import { useContentGate } from "../hooks/useContentgate"; // ✅ Import the gate

export default function Player() {
    const { audioUrl, title, image, podcastId } = useLocalSearchParams(); // ✅ Added podcastId
    const { user, loading } = useAuth();

    const {
        sound,
        isPlaying,
        pause,
        resume,
        play,
        currentEpisode,
    } = useAudioStore();

    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(1);
    const [speed, setSpeed] = useState(1);
    
    // ✅ Subscription gate
    const { 
        showPaywall, 
        setShowPaywall, 
        paywallReason, 
        checkAndGatePodcast 
    } = useContentGate();
    
    const [hasAccess, setHasAccess] = useState(false);
    const [checkingAccess, setCheckingAccess] = useState(true);

    // ✅ Check access to this podcast
    useEffect(() => {
        if (!audioUrl || !user) return;
        
        // Get podcast ID from params or generate from URL
        const id = podcastId as string || audioUrl.toString();
        const canAccess = checkAndGatePodcast(id);
        setHasAccess(canAccess);
        setCheckingAccess(false);
    }, [audioUrl, user, podcastId]);

    // ✅ Auth gate — redirect to login if not signed in
    useEffect(() => {
        if (loading) return;
        if (!user) {
            router.replace('/(auth)/login');
        }
    }, [user, loading]);

    // 🎧 START PLAY ONLY IF ACCESS GRANTED
    useEffect(() => {
        if (!audioUrl || !user) return;
        if (!hasAccess) return; // ✅ Don't play if no access
        if (checkingAccess) return; // ✅ Wait for access check

        const isSame = currentEpisode?.url === audioUrl;

        if (!sound || !isSame) {
            play({
                url: audioUrl as string,
                title: title as string,
                image: image as string,
            });
        }
    }, [audioUrl, user, hasAccess, checkingAccess]);

    // 🎧 REAL-TIME SYNC
    useEffect(() => {
        if (!sound) return;

        const update = (status: any) => {
            if (status.isLoaded) {
                setPosition(status.positionMillis);
                setDuration(status.durationMillis || 1);
            }
        };

        sound.setOnPlaybackStatusUpdate(update);
        return () => { sound.setOnPlaybackStatusUpdate(null); };
    }, [sound]);

    // ── Show spinner while checking auth ─────────────────────────────────────
    if (loading || checkingAccess) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#F5C842" />
            </View>
        );
    }

    // ── Not logged in — show login prompt ─────────────────────────────
    if (!user) {
        return (
            <View style={[styles.container, styles.center]}>
                <Ionicons name="lock-closed-outline" size={48} color="#F5C842" />
                <Text style={styles.lockTitle}>تسجيل الدخول مطلوب</Text>
                <Text style={styles.lockSubtitle}>
                    سجّل دخولك للاستماع إلى البودكاست
                </Text>
                <TouchableOpacity
                    style={styles.loginBtn}
                    onPress={() => router.replace('/(auth)/login')}
                >
                    <Text style={styles.loginBtnText}>تسجيل الدخول</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backBtnText}>العودة</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // ── No access — show paywall ─────────────────────────────────────────────
    if (!hasAccess && !checkingAccess) {
        return (
            <View style={[styles.container, styles.center]}>
                <Ionicons name="star-outline" size={64} color="#F5C842" />
                <Text style={styles.lockTitle}>وصول محدود</Text>
                <Text style={styles.lockSubtitle}>
                    لقد وصلت إلى حد البودكاست المجاني لهذا الشهر
                </Text>
                <TouchableOpacity
                    style={styles.loginBtn}
                    onPress={() => setShowPaywall(true)}
                >
                    <Text style={styles.loginBtnText}>ترقية إلى المميز</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backBtnText}>العودة</Text>
                </TouchableOpacity>
                
                {/* Paywall Modal */}
                <PaywallScreen
                    visible={showPaywall}
                    onClose={() => {
                        setShowPaywall(false);
                        // Re-check access after purchase/restore
                        if (audioUrl) {
                            const id = podcastId as string || audioUrl.toString();
                            const canAccess = checkAndGatePodcast(id);
                            setHasAccess(canAccess);
                        }
                    }}
                    reason={paywallReason}
                />
            </View>
        );
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    const handleSeek = async (value: number) => {
        if (!sound) return;
        await sound.setPositionAsync(value);
    };

    const toggleSpeed = async () => {
        if (!sound) return;
        const newSpeed = speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1;
        setSpeed(newSpeed);
        await sound.setRateAsync(newSpeed, true);
    };

    const seekForward = async () => {
        if (!sound) return;
        await sound.setPositionAsync(position + 15000);
    };

    const seekBackward = async () => {
        if (!sound) return;
        await sound.setPositionAsync(Math.max(position - 15000, 0));
    };

    const format = (ms: number) => {
        const min = Math.floor(ms / 60000);
        const sec = Math.floor((ms % 60000) / 1000);
        return `${min}:${sec < 10 ? "0" : ""}${sec}`;
    };

    // ── Player UI (has access) ────────────────────────────────────────────────
    return (
        <View style={styles.container}>
            {/* Premium badge (optional) */}
            <View style={styles.premiumBadge}>
                <Ionicons name="diamond" size={14} color="#F5C842" />
                <Text style={styles.premiumBadgeText}>
                    {useSubscription().isPremium ? "مميز ⭐" : "مجاني"}
                </Text>
            </View>

            <Image
                source={{ uri: currentEpisode?.image || (image as string) }}
                style={styles.image}
            />

            <Text style={styles.title}>
                {currentEpisode?.title || title}
            </Text>

            <Slider
                value={position}
                maximumValue={duration}
                onSlidingComplete={handleSeek}
                minimumTrackTintColor="#0bd46c"
                maximumTrackTintColor="#333"
                thumbTintColor="#0bd46c"
                style={{ width: "90%", marginTop: 20 }}
            />

            <View style={styles.timeRow}>
                <Text style={styles.time}>{format(position)}</Text>
                <Text style={styles.time}>{format(duration)}</Text>
            </View>

            <View style={styles.controls}>
                <TouchableOpacity onPress={seekBackward}>
                    <Ionicons name="play-back" size={30} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={isPlaying ? pause : resume}
                    style={styles.playBtn}
                >
                    <Ionicons
                        name={isPlaying ? "pause" : "play"}
                        size={28}
                        color="#000"
                    />
                </TouchableOpacity>

                <TouchableOpacity onPress={seekForward}>
                    <Ionicons name="play-forward" size={30} color="#fff" />
                </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={toggleSpeed} style={styles.speedBtn}>
                <Text style={{ color: "#F5C842" }}>{speed}x</Text>
            </TouchableOpacity>
        </View>
    );
}

// Add this helper function at the top or inside component
import { useSubscription } from "../context/Subscriptioncontext";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0B0B0B",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    center: {
        gap: 16,
    },

    // ── Auth gate UI ──────────────────────────────────
    lockTitle: {
        color: "#FFFFFF",
        fontSize: 20,
        fontWeight: "700",
        textAlign: "center",
    },
    lockSubtitle: {
        color: "#888",
        fontSize: 14,
        textAlign: "center",
        paddingHorizontal: 32,
    },
    loginBtn: {
        backgroundColor: "#F5C842",
        borderRadius: 12,
        paddingVertical: 13,
        paddingHorizontal: 40,
        marginTop: 8,
    },
    loginBtnText: {
        color: "#1A1A00",
        fontWeight: "700",
        fontSize: 15,
    },
    backBtn: {
        paddingVertical: 10,
    },
    backBtnText: {
        color: "#555",
        fontSize: 14,
    },

    // ── Player UI ─────────────────────────────────────
    image: {
        width: 220,
        height: 220,
        borderRadius: 20,
    },
    title: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
        marginTop: 15,
        textAlign: "center",
    },
    timeRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "90%",
        marginTop: 10,
    },
    time: {
        color: "#888",
        fontSize: 12,
    },
    controls: {
        flexDirection: "row",
        alignItems: "center",
        gap: 30,
        marginTop: 30,
    },
    playBtn: {
        backgroundColor: "#0bd46c",
        padding: 18,
        borderRadius: 50,
    },
    speedBtn: {
        marginTop: 25,
        borderWidth: 1,
        borderColor: "#333",
        paddingHorizontal: 15,
        paddingVertical: 6,
        borderRadius: 20,
    },
    premiumBadge: {
        position: 'absolute',
        top: 50,
        right: 20,
        flexDirection: 'row',
        backgroundColor: '#1A1A1A',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        gap: 5,
        alignItems: 'center',
    },
    premiumBadgeText: {
        color: '#F5C842',
        fontSize: 11,
        fontWeight: '600',
    },
});