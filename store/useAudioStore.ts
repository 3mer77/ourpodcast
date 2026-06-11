import { create } from "zustand";
import { Audio } from "expo-av";

type Episode = {
    url: string;
    title: string;
    image: string;
};

type State = {
    sound: Audio.Sound | null;
    isPlaying: boolean;
    currentEpisode: Episode | null;

    play: (episode: Episode) => Promise<void>;
    pause: () => Promise<void>;
    resume: () => Promise<void>;
    stop: () => Promise<void>;
};

export const useAudioStore = create<State>((set, get) => ({
    sound: null,
    isPlaying: false,
    currentEpisode: null,

    play: async (episode) => {
        const { sound } = get();

        // 🧨 STOP OLD AUDIO FIRST (critical fix)
        if (sound) {
            try {
                await sound.stopAsync();
                await sound.unloadAsync();
            } catch (e) {
                console.log("cleanup error", e);
            }
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
        if (!sound) return;

        await sound.stopAsync();
        await sound.unloadAsync();

        set({
            sound: null,
            isPlaying: false,
            currentEpisode: null,
        });
    },
}));