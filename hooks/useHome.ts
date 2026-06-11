import { useCallback, useEffect, useState } from "react";

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;
const API_KEY  = process.env.EXPO_PUBLIC_API_KEY;

export type Episode = {
    id: string;
    title: string;
    poster?: string;
    duration: string;
    publishedAt: string;
    isSaved?: boolean;
    description?: string;
};

type RawPodcast = {
    id: string;
    title: string;
    image: string;
    audio_length_sec?: number;
    pub_date_ms?: number;
};

const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const toArabic = (n: number) =>
        n.toString().replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[+d]);
    if (h > 0) return `${toArabic(h)} س ${toArabic(m)} د`;
    return `${toArabic(m)} د`;
};

const formatDate = (ms: number): string =>
    new Date(ms).toLocaleDateString("ar-SA", {
        day: "numeric", month: "long", year: "numeric",
    });

// ✅ Shared delay helper
const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

// ✅ Fetch with retry on 429
const fetchByGenre = async (
    genreId: number,
    retries = 3
): Promise<Episode[]> => {
    if (!BASE_URL || !API_KEY) {
        throw new Error("Missing env vars");
    }

    const url = `${BASE_URL}/best_podcasts?genre_id=${genreId}&region=us`;

    for (let attempt = 0; attempt < retries; attempt++) {
        const res = await fetch(url, {
            headers: { "X-ListenAPI-Key": API_KEY },
        });

        // ✅ on 429 wait and retry
        if (res.status === 429) {
            const waitMs = 1500 * (attempt + 1); // 1.5s, 3s, 4.5s
            console.warn(`429 on genre ${genreId} — retrying in ${waitMs}ms`);
            await delay(waitMs);
            continue;
        }

        if (!res.ok) {
            const body = await res.text().catch(() => "");
            throw new Error(`API error ${res.status} for genre ${genreId}: ${body}`);
        }

        const json = await res.json();
        const podcasts: RawPodcast[] = json.podcasts ?? [];

        return podcasts.map((p) => ({
            id:          p.id,
            title:       p.title,
            poster:      p.image,
            duration:    formatDuration(p.audio_length_sec ?? 0),
            publishedAt: p.pub_date_ms ? formatDate(p.pub_date_ms) : "",
            isSaved:     false,
        }));
    }

    throw new Error(`Failed after ${retries} retries for genre ${genreId}`);
};

export const useHome = () => {
    const [hearFirst,    setHearFirst]    = useState<Episode[]>([]);
    const [youMightLike, setYouMightLike] = useState<Episode[]>([]);
    const [loading,      setLoading]      = useState(true);
    const [error,        setError]        = useState<string | null>(null);

    const loadHome = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // ✅ Sequential with gap — avoids hitting rate limit
            const business = await fetchByGenre(93);
            await delay(1200);
            const tech = await fetchByGenre(127);

            setHearFirst(business);
            setYouMightLike(tech);

        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Unknown error";
            console.error("useHome error:", msg);
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadHome();
    }, [loadHome]);

    return { hearFirst, youMightLike, loading, error, retry: loadHome };
};