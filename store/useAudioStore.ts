import { create } from "zustand";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Episode = {
    url: string;
    title: string;
    image: string;
    episodeId?: string;
    podcastId?: string;
};

const LAST_EPISODE_KEY = "@last_played_episode";

type State = {
    sound: Audio.Sound | null;
    isPlaying: boolean;
    currentEpisode: Episode | null;
    lastEpisode: Episode | null;

    play: (episode: Episode) => Promise<void>;
    pause: () => Promise<void>;
    resume: () => Promise<void>;
    stop: () => Promise<void>;
    loadLastEpisode: () => Promise<void>;
};

export const useAudioStore = create<State>((set, get) => ({
    sound: null,
    isPlaying: false,
    currentEpisode: null,
    lastEpisode: null,

    loadLastEpisode: async () => {
        try {
            const json = await AsyncStorage.getItem(LAST_EPISODE_KEY);
            if (json) {
                const ep = JSON.parse(json);
                set({ lastEpisode: ep });
            }
        } catch (e) {
            console.log("loadLastEpisode error", e);
        }
    },

    play: async (episode) => {
        const { sound } = get();

        // 🧨 STOP OLD AUDIO FIRST
        if (sound) {
            try {
                await sound.stopAsync();
                await sound.unloadAsync();
            } catch (e) {
                console.log("cleanup error", e);
            }
        }

        try {
            await AsyncStorage.setItem(LAST_EPISODE_KEY, JSON.stringify(episode));
        } catch (e) {
            // ignore
        }

        // 🎧 CREATE NEW AUDIO
        const { sound: newSound } = await Audio.Sound.createAsync(
            { uri: episode.url },
            { shouldPlay: true }
        );

        set({
            sound: newSound,
            isPlaying: true,
            currentEpisode: episode,
            lastEpisode: episode,
        });
    },

    pause: async () => {
        const sound = get().sound;
        if (!sound) return;

        await sound.pauseAsync();
        set({ isPlaying: false });
    },

    resume: async () => {
        const sound = get().sound;
        if (!sound) return;

        await sound.playAsync();
        set({ isPlaying: true });
    },

    stop: async () => {
        const sound = get().sound;
        if (sound) {
            try {
                await sound.stopAsync();
                await sound.unloadAsync();
            } catch (e) {
                console.log("stop error", e);
            }
        }

        set({
            sound: null,
            isPlaying: false,
            currentEpisode: null,
        });
    },
}));