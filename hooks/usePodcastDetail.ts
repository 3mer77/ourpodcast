import { useCallback, useEffect, useRef, useState } from 'react';
import { stripHtml } from '../utils/scripthtml';
import { fetchPodcastDetail, RawEpisode } from '../app/api/podcastapi';

// ─── formatted episode shape used by the UI ──────────────────────────────────

export type Episode = {
    id: string;
    title: string;
    description: string;
    image: string;
    audioUrl: string;
    duration: string;
    publishedAt: string;
};

export type PodcastInfo = {
    id: string;
    title: string;
    description: string;
    image: string;
    publisher: string;
    totalEpisodes: number;
};

// ─── helpers ─────────────────────────────────────────────────────────────────

const toArabic = (n: number) =>
    n.toString().replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d]);

const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${toArabic(h)} س ${toArabic(m)} د`;
    return `${toArabic(m)} د`;
};

const formatDate = (ms: number): string =>
    new Date(ms).toLocaleDateString('ar-SA', {
        day: 'numeric', month: 'long', year: 'numeric',
    });

const toEpisode = (raw: RawEpisode): Episode => ({
    id: raw.id,
    title: stripHtml(raw.title),           // ✅ strip HTML
    description: stripHtml(raw.description),     // ✅ strip HTML
    image: raw.image,
    audioUrl: raw.audio || "",
    duration: formatDuration(raw.audio_length_sec),
    publishedAt: formatDate(raw.pub_date_ms),
    
});

// ─── hook ────────────────────────────────────────────────────────────────────

type State = {
    info: PodcastInfo | null;
    episodes: Episode[];
    loading: boolean;
    loadingMore: boolean;
    hasMore: boolean;
    error: string | null;
};

export const usePodcastDetail = (podcastId: string) => {
    const [state, setState] = useState<State>({
        info: null,
        episodes: [],
        loading: true,
        loadingMore: false,
        hasMore: true,
        error: null,
    });

    const cursorRef = useRef<number | null>(null);
    const loadingMoreRef = useRef(false);

    // ── Initial load ─────────────────────────────────────────────────────────
    const loadInitial = useCallback(async () => {
        try {
            setState((s) => ({ ...s, loading: true, error: null }));

            const data = await fetchPodcastDetail(podcastId);

            cursorRef.current = data.nextCursor;

            setState({
                info: {
                    id: data.id,
                    title: stripHtml(data.title),           // ✅ strip HTML
                    description: stripHtml(data.description),     // ✅ strip HTML
                    image: data.image,
                    publisher: stripHtml(data.publisher),
                    totalEpisodes: data.totalEpisodes,
                },
                episodes: data.episodes.map(toEpisode),
                loading: false,
                loadingMore: false,
                hasMore: data.nextCursor !== null,
                error: null,
            });
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Unknown error';
            setState((s) => ({ ...s, loading: false, error: msg }));
        }
    }, [podcastId]);

    // ── Load more ────────────────────────────────────────────────────────────
    const loadMore = useCallback(async () => {
        if (loadingMoreRef.current || cursorRef.current === null) return;

        loadingMoreRef.current = true;
        setState((s) => ({ ...s, loadingMore: true }));

        try {
            const data = await fetchPodcastDetail(podcastId, cursorRef.current);

            cursorRef.current = data.nextCursor;

            setState((s) => {
                const existingIds = new Set(s.episodes.map((e) => e.id));
                const newEpisodes = data.episodes
                    .map(toEpisode)
                    .filter((e) => !existingIds.has(e.id));

                return {
                    ...s,
                    episodes: [...s.episodes, ...newEpisodes],
                    loadingMore: false,
                    hasMore: data.nextCursor !== null && newEpisodes.length > 0,
                };
            });
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Unknown error';
            setState((s) => ({ ...s, loadingMore: false, error: msg }));
        } finally {
            loadingMoreRef.current = false;
        }
    }, [podcastId]);

    useEffect(() => {
        loadInitial();
    }, [loadInitial]);

    return {
        ...state,
        retry: loadInitial,
        loadMore,
    };
};