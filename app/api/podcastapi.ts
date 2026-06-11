const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

// ─── shared fetch wrapper ────────────────────────────────────────────────────

const apiFetch = async (path: string): Promise<any> => {
    if (!BASE_URL || !API_KEY) {
        throw new Error(
            'Missing env vars: EXPO_PUBLIC_BASE_URL or EXPO_PUBLIC_API_KEY'
        );
    }

    const res = await fetch(`${BASE_URL}${path}`, {
        headers: { 'X-ListenAPI-Key': API_KEY },
    });

    if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`[${res.status}] ${path} — ${body}`);
    }

    return res.json();
};

// ─── types ───────────────────────────────────────────────────────────────────

export type RawEpisode = {
    id: string;
    title: string;
    description: string;
    image: string;
    audio: string;
    audio_length_sec: number;
    pub_date_ms: number;
};

export type PodcastDetail = {
    id: string;
    title: string;
    description: string;
    image: string;
    publisher: string;
    totalEpisodes: number;
    episodes: RawEpisode[];
    nextCursor: number | null;
};

// ─── endpoints ───────────────────────────────────────────────────────────────

/**
 * Search podcasts by keyword
 * ListenNotes: GET /search?q=...&type=podcast
 */
export const fetchPodcast = async (query: string) => {
    const data = await apiFetch(
        `/search?q=${encodeURIComponent(query)}&type=podcast`
    );

    return (data.results ?? []).map((item: any) => ({
        id: item.id,
        title: item.title_original,
        description: item.description_original,
        image: item.image,
    }));
};

/**
 * Get podcast detail + paginated episodes
 * ListenNotes: GET /podcasts/:id
 */
export const fetchPodcastDetail = async (
    podcastId: string,
    nextEpisodePubDate?: number
): Promise<PodcastDetail> => {
    const cursor = nextEpisodePubDate
        ? `?next_episode_pub_date=${nextEpisodePubDate}`
        : '';

    const data = await apiFetch(`/podcasts/${podcastId}${cursor}`);

    return {
        id: data.id,
        title: data.title,
        description: data.description,
        image: data.image,
        publisher: data.publisher,
        totalEpisodes: data.total_episodes ?? 0,
        episodes: data.episodes ?? [],
        nextCursor: data.next_episode_pub_date ?? null,
    };
};

/**
 * Get best podcasts by genre
 * ListenNotes: GET /best_podcasts?genre_id=...
 */
export const fetchBestPodcastsByGenre = async (genreId: number) => {
    const data = await apiFetch(
        `/best_podcasts?genre_id=${genreId}&region=us`
    );
    return data.podcasts ?? [];
};

/**
 * Fetch Arabic podcasts
 * ✅ uses apiFetch — same base URL and key as everything else
 * ✅ returns shape that matches Episode type used by EpisodeListCard
 * ✅ language=Arabic (full name, not ISO code ar)
 */
export const fetchArabicPodcasts = async () => {
    const data = await apiFetch(
        '/search?q=%D8%A8%D9%88%D8%AF%D9%83%D8%A7%D8%B3%D8%AA&type=podcast&language=Arabic&sort_by_date=0'
    );

    return (data.results ?? []).map((p: any) => ({
        id: p.id,
        title: p.title_original ?? '',
        poster: p.image ?? '',
        description: p.description_original ?? '',
        duration: '',
        publishedAt: '',
        isSaved: false,
    }));
};