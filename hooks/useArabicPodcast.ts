import { useEffect, useState } from 'react';
import { fetchArabicPodcasts } from '../app/api/podcastapi';
import { Episode } from './useHome';

export const useArabicPodcast = () => {
    const [podcasts, setPodcasts] = useState<Episode[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            // ✅ Wait 3s so useHome finishes its 2 requests first
            await new Promise(r => setTimeout(r, 3000));

            setLoading(true);
            try {
                const result = await fetchArabicPodcasts();
                setPodcasts(result);
            } catch (e: any) {
                console.error('Arabic podcasts error:', e.message);
                setError(e.message ?? 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    return { podcasts, loading, error };
};