import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    BookProgress,
    getRecentBooks,
    getRecentPodcasts,
    PodcastProgress,
    updateBookProgress,
    updatePodcastProgress,
} from '../services/supabaselibrary';

// ─── Recently played podcasts ─────────────────────────────────────────────────

export const useRecentPodcasts = () => {
    const { user } = useAuth();
    const [recent,  setRecent]  = useState<PodcastProgress[]>([]);
    const [loading, setLoading] = useState(false);

    const load = useCallback(async () => {
        if (!user) { setRecent([]); return; }
        setLoading(true);
        try {
            const data = await getRecentPodcasts(user.id, 20);
            setRecent(data);
        } catch (e) {
            console.error('useRecentPodcasts error:', e);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // ✅ Call this from the Player screen when position updates
    const saveProgress = useCallback(async (
        progress: Omit<PodcastProgress, 'last_listened_at'>
    ) => {
        if (!user) return;
        try {
            await updatePodcastProgress(user.id, progress);
            // update local state immediately
            setRecent((prev) => {
                const filtered = prev.filter((p) => p.podcast_id !== progress.podcast_id);
                return [{ ...progress, last_listened_at: new Date().toISOString() }, ...filtered].slice(0, 20);
            });
        } catch (e) {
            console.error('saveProgress error:', e);
        }
    }, [user]);

    useEffect(() => { load(); }, [load]);

    return { recent, loading, saveProgress, reload: load };
};

// ─── Recently read books ──────────────────────────────────────────────────────

export const useRecentBooks = () => {
    const { user } = useAuth();
    const [recent,  setRecent]  = useState<BookProgress[]>([]);
    const [loading, setLoading] = useState(false);

    const load = useCallback(async () => {
        if (!user) { setRecent([]); return; }
        setLoading(true);
        try {
            const data = await getRecentBooks(user.id, 20);
            setRecent(data);
        } catch (e) {
            console.error('useRecentBooks error:', e);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // ✅ Call this from BookDetail when page changes
    const saveBookProgress = useCallback(async (
        progress: Omit<BookProgress, 'last_read_at'>
    ) => {
        if (!user) return;
        try {
            await updateBookProgress(user.id, progress);
            setRecent((prev) => {
                const filtered = prev.filter((b) => b.book_id !== progress.book_id);
                return [{ ...progress, last_read_at: new Date().toISOString() }, ...filtered].slice(0, 20);
            });
        } catch (e) {
            console.error('saveBookProgress error:', e);
        }
    }, [user]);

    useEffect(() => { load(); }, [load]);

    return { recent, loading, saveBookProgress, reload: load };
};