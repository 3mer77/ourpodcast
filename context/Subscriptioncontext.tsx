import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import { addCustomerInfoListener, checkIsPremium, setupRevenueCat } from '../lib/revenuecat';
import { useAuth } from './AuthContext';

// ─── Free tier limits ─────────────────────────────────────────────────────────

export const FREE_LIMITS = {
    podcastsPerMonth: 2,   // can play 2 different podcasts per month
    episodesPerPodcast: 2,   // max 2 episodes per podcast
    booksPerMonth: 1,   // can read 1 book per month
};

// ─── Usage tracking keys (AsyncStorage) ──────────────────────────────────────

const STORAGE_KEYS = {
    playedPodcasts: 'free_played_podcasts_v2',   // JSON array of {id, title}
    playedBooks: 'free_played_books_v2',       // JSON array of {id, title}
    usageMonth: 'free_usage_month',        // "2024-01" — resets monthly
};

// ─── Types ────────────────────────────────────────────────────────────────────

export type UsageItem = {
    id: string;
    title?: string;
};

type UsageState = {
    playedPodcasts: UsageItem[];
    playedBooks: UsageItem[];
};

type SubscriptionContextType = {
    isPremium: boolean;
    loading: boolean;
    usage: UsageState;
    refreshSubscription: () => Promise<boolean>;
    // checks if user can access content — returns true if allowed
    canPlayPodcast: (podcastId: string) => boolean;
    canReadBook: (bookId: string) => boolean;
    // call when user actually starts playing/reading
    recordPodcastPlay: (podcastId: string, title?: string) => Promise<void>;
    recordBookRead: (bookId: string, title?: string) => Promise<void>;
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

const parseUsageItems = (raw: string | null): UsageItem[] => {
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            return parsed.map((item) => typeof item === 'string' ? { id: item } : item);
        }
    } catch (e) {
        // ignore
    }
    return [];
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
            return { playedPodcasts: [], playedBooks: [] };
        }

        const podcasts = await AsyncStorage.getItem(STORAGE_KEYS.playedPodcasts);
        const books = await AsyncStorage.getItem(STORAGE_KEYS.playedBooks);

        return {
            playedPodcasts: parseUsageItems(podcasts),
            playedBooks: parseUsageItems(books),
        };
    } catch {
        return { playedPodcasts: [], playedBooks: [] };
    }
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();

    const [isPremium, setIsPremium] = useState(false);
    const [loading, setLoading] = useState(true);
    const [usage, setUsage] = useState<UsageState>({
        playedPodcasts: [],
        playedBooks: [],
    });

    const refreshSubscription = useCallback(async (): Promise<boolean> => {
        try {
            const premium = await checkIsPremium();
            setIsPremium(premium);
            return premium;
        } catch (e) {
            console.error('refreshSubscription error:', e);
            return false;
        }
    }, []);

    // ── Initialize RevenueCat + load usage ───────────────────────────────────
    useEffect(() => {
        let unsubscribeListener: (() => void) | undefined;

        const init = async () => {
            setLoading(true);
            try {
                await setupRevenueCat(user?.id);
                const premium = await checkIsPremium();
                const savedUsage = await loadUsage();
                setIsPremium(premium);
                setUsage(savedUsage);

                // Listen for real-time changes
                unsubscribeListener = addCustomerInfoListener((status) => {
                    setIsPremium(status);
                });
            } catch (e) {
                console.error('SubscriptionProvider init error:', e);
            } finally {
                setLoading(false);
            }
        };
        init();

        return () => {
            if (unsubscribeListener) unsubscribeListener();
        };
    }, [user?.id]);

    // ── Can play podcast ─────────────────────────────────────────────────────
    const canPlayPodcast = useCallback((podcastId: string): boolean => {
        if (isPremium) return true;
        // already played this one → allow (don't double-count)
        if (usage.playedPodcasts.some((p) => p.id === podcastId)) return true;
        // under limit → allow
        return usage.playedPodcasts.length < FREE_LIMITS.podcastsPerMonth;
    }, [isPremium, usage]);

    // ── Can read book ────────────────────────────────────────────────────────
    const canReadBook = useCallback((bookId: string): boolean => {
        if (isPremium) return true;
        if (usage.playedBooks.some((b) => b.id === bookId)) return true;
        return usage.playedBooks.length < FREE_LIMITS.booksPerMonth;
    }, [isPremium, usage]);

    // ── Record podcast play ──────────────────────────────────────────────────
    const recordPodcastPlay = useCallback(async (podcastId: string, title?: string) => {
        if (isPremium) return;
        if (usage.playedPodcasts.some((p) => p.id === podcastId)) return;

        const next = [...usage.playedPodcasts, { id: podcastId, title: title ?? 'بودكاست' }];
        setUsage((s) => ({ ...s, playedPodcasts: next }));
        await AsyncStorage.setItem(STORAGE_KEYS.playedPodcasts, JSON.stringify(next));
    }, [isPremium, usage]);

    // ── Record book read ─────────────────────────────────────────────────────
    const recordBookRead = useCallback(async (bookId: string, title?: string) => {
        if (isPremium) return;
        if (usage.playedBooks.some((b) => b.id === bookId)) return;

        const next = [...usage.playedBooks, { id: bookId, title: title ?? 'كتاب' }];
        setUsage((s) => ({ ...s, playedBooks: next }));
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
        : Math.max(0, FREE_LIMITS.podcastsPerMonth - usage.playedPodcasts.length);

    const booksRemaining = isPremium
        ? Infinity
        : Math.max(0, FREE_LIMITS.booksPerMonth - usage.playedBooks.length);

    return (
        <SubscriptionContext.Provider value={{
            isPremium,
            loading,
            usage,
            refreshSubscription,
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