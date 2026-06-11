import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import { checkIsPremium, setupRevenueCat } from '../lib/revenuecat';
import { useAuth } from './AuthContext';

// ─── Free tier limits ─────────────────────────────────────────────────────────

export const FREE_LIMITS = {
    podcastsPerMonth: 2,   // can play 2 different podcasts per month
    episodesPerPodcast: 2,   // max 2 episodes per podcast
    booksPerMonth: 1,   // can read 1 book per month
};

// ─── Usage tracking keys (AsyncStorage) ──────────────────────────────────────

const STORAGE_KEYS = {
    playedPodcasts: 'free_played_podcasts',   // JSON array of podcast IDs this month
    playedBooks: 'free_played_books',       // JSON array of book IDs this month
    usageMonth: 'free_usage_month',        // "2024-01" — resets monthly
};

// ─── Types ────────────────────────────────────────────────────────────────────

type UsageState = {
    playedPodcastIds: string[];
    playedBookIds: string[];
};

type SubscriptionContextType = {
    isPremium: boolean;
    loading: boolean;
    usage: UsageState;
    // checks if user can access content — returns true if allowed
    canPlayPodcast: (podcastId: string) => boolean;
    canReadBook: (bookId: string) => boolean;
    // call when user actually starts playing/reading
    recordPodcastPlay: (podcastId: string) => Promise<void>;
    recordBookRead: (bookId: string) => Promise<void>;
    // remaining counts
    podcastsRemaining: number;
    booksRemaining: number;
    // mock toggle for development
    devTogglePremium: () => void;
};

// ─── Context ──────────────────────────────────────────────────────────────────

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const currentMonth = () => {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}`;
};

const loadUsage = async (): Promise<UsageState> => {
    try {
        const month = await AsyncStorage.getItem(STORAGE_KEYS.usageMonth);
        const thisMonth = currentMonth();

        // ✅ reset if new month
        if (month !== thisMonth) {
            await AsyncStorage.multiSet([
                [STORAGE_KEYS.usageMonth, thisMonth],
                [STORAGE_KEYS.playedPodcasts, '[]'],
                [STORAGE_KEYS.playedBooks, '[]'],
            ]);
            return { playedPodcastIds: [], playedBookIds: [] };
        }

        const podcasts = await AsyncStorage.getItem(STORAGE_KEYS.playedPodcasts);
        const books = await AsyncStorage.getItem(STORAGE_KEYS.playedBooks);

        return {
            playedPodcastIds: podcasts ? JSON.parse(podcasts) : [],
            playedBookIds: books ? JSON.parse(books) : [],
        };
    } catch {
        return { playedPodcastIds: [], playedBookIds: [] };
    }
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();

    const [isPremium, setIsPremium] = useState(false);
    const [loading, setLoading] = useState(true);
    const [usage, setUsage] = useState<UsageState>({
        playedPodcastIds: [],
        playedBookIds: [],
    });

    // ── Initialize RevenueCat + load usage ───────────────────────────────────
    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                await setupRevenueCat(user?.id);
                const premium = await checkIsPremium();
                const savedUsage = await loadUsage();
                setIsPremium(premium);
                setUsage(savedUsage);
            } catch (e) {
                console.error('SubscriptionProvider init error:', e);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [user?.id]);

    // ── Can play podcast ─────────────────────────────────────────────────────
    const canPlayPodcast = useCallback((podcastId: string): boolean => {
        if (isPremium) return true;
        // already played this one → allow (don't double-count)
        if (usage.playedPodcastIds.includes(podcastId)) return true;
        // under limit → allow
        return usage.playedPodcastIds.length < FREE_LIMITS.podcastsPerMonth;
    }, [isPremium, usage]);

    // ── Can read book ────────────────────────────────────────────────────────
    const canReadBook = useCallback((bookId: string): boolean => {
        if (isPremium) return true;
        if (usage.playedBookIds.includes(bookId)) return true;
        return usage.playedBookIds.length < FREE_LIMITS.booksPerMonth;
    }, [isPremium, usage]);

    // ── Record podcast play ──────────────────────────────────────────────────
    const recordPodcastPlay = useCallback(async (podcastId: string) => {
        if (isPremium) return;
        if (usage.playedPodcastIds.includes(podcastId)) return;

        const next = [...usage.playedPodcastIds, podcastId];
        setUsage((s) => ({ ...s, playedPodcastIds: next }));
        await AsyncStorage.setItem(STORAGE_KEYS.playedPodcasts, JSON.stringify(next));
    }, [isPremium, usage]);

    // ── Record book read ─────────────────────────────────────────────────────
    const recordBookRead = useCallback(async (bookId: string) => {
        if (isPremium) return;
        if (usage.playedBookIds.includes(bookId)) return;

        const next = [...usage.playedBookIds, bookId];
        setUsage((s) => ({ ...s, playedBookIds: next }));
        await AsyncStorage.setItem(STORAGE_KEYS.playedBooks, JSON.stringify(next));
    }, [isPremium, usage]);

    // ── Dev toggle (remove before production) ───────────────────────────────
    const devTogglePremium = useCallback(() => {
        setIsPremium((prev) => {
            console.log('🔧 Dev: isPremium toggled to', !prev);
            return !prev;
        });
    }, []);

    // ── Remaining counts ─────────────────────────────────────────────────────
    const podcastsRemaining = isPremium
        ? Infinity
        : Math.max(0, FREE_LIMITS.podcastsPerMonth - usage.playedPodcastIds.length);

    const booksRemaining = isPremium
        ? Infinity
        : Math.max(0, FREE_LIMITS.booksPerMonth - usage.playedBookIds.length);

    return (
        <SubscriptionContext.Provider value={{
            isPremium,
            loading,
            usage,
            canPlayPodcast,
            canReadBook,
            recordPodcastPlay,
            recordBookRead,
            podcastsRemaining,
            booksRemaining,
            devTogglePremium,
        }}>
            {children}
        </SubscriptionContext.Provider>
    );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useSubscription = (): SubscriptionContextType => {
    const ctx = useContext(SubscriptionContext);
    if (!ctx) throw new Error('useSubscription must be used inside SubscriptionProvider');
    return ctx;
};