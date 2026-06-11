import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    getSavedPodcastIds,
    getSavedPodcasts,
    SavedPodcast,
    savePodcast,
    unsavePodcast,
} from '../services/supabaselibrary';

export const useSaved = () => {
    const { user } = useAuth();

    const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
    const [saved, setSaved] = useState<SavedPodcast[]>([]);
    const [loading, setLoading] = useState(false);

    // ── Load saved IDs on mount ───────────────────────────────────────────────
    useEffect(() => {
        if (!user) { setSavedIds(new Set()); setSaved([]); return; }

        const load = async () => {
            try {
                const ids = await getSavedPodcastIds(user.id);
                setSavedIds(ids);
            } catch (e) {
                console.error('useSaved load error:', e);
            }
        };
        load();
    }, [user]);

    // ── Load full saved list (for favorites screen) ───────────────────────────
    const loadSaved = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await getSavedPodcasts(user.id);
            setSaved(data);
            setSavedIds(new Set(data.map((p) => p.podcast_id)));
        } catch (e) {
            console.error('loadSaved error:', e);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // ── Toggle save ───────────────────────────────────────────────────────────
    const toggleSave = useCallback(async (
        podcastId: string,
        isSaving: boolean,
        meta?: { title: string; poster: string; duration: string; published_at: string }
    ) => {
        if (!user) return;

        // optimistic update
        setSavedIds((prev) => {
            const next = new Set(prev);
            isSaving ? next.add(podcastId) : next.delete(podcastId);
            return next;
        });

        try {
            if (isSaving && meta) {
                await savePodcast(user.id, { podcast_id: podcastId, ...meta });
            } else {
                await unsavePodcast(user.id, podcastId);
            }
        } catch (e) {
            // rollback on error
            setSavedIds((prev) => {
                const next = new Set(prev);
                isSaving ? next.delete(podcastId) : next.add(podcastId);
                return next;
            });
            console.error('toggleSave error:', e);
        }
    }, [user]);

    return { savedIds, saved, loading, toggleSave, loadSaved };
};