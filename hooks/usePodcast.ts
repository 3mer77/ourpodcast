import { useEffect, useState } from "react";
import { getpodcast } from "../services/podcastService";

export const usePodcast = (query: string) => {
    const [podcasts, setPodcasts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPodcast = async () => {
        setLoading(true);
        try {
            const result = await getpodcast(query);
            setPodcasts(result);
        } catch (er: any) {
            setError(er);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPodcast();
    }, [query]);

    return { podcasts, loading, error };
}

