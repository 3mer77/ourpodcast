import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchPodcast } from '../app/api/podcastapi';
import { stripHtml } from '../utils/scripthtml';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SearchResult = {
    id: string;
    title: string;
    description: string;
    image: string;
};

type State = {
    results: SearchResult[];
    loading: boolean;
    error: string | null;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useSearch = () => {
    const [query, setQuery] = useState('');
    const [state, setState] = useState<State>({
        results: [],
        loading: false,
        error: null,
    });

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const search = useCallback(async (q: string) => {
        if (!q.trim()) {
            setState({ results: [], loading: false, error: null });
            return;
        }

        setState((s) => ({ ...s, loading: true, error: null }));

        try {
            const data = await fetchPodcast(q);

            // ✅ strip HTML from title and description
            const clean = data.map((item: SearchResult) => ({
                ...item,
                title: stripHtml(item.title),
                description: stripHtml(item.description),
            }));

            setState({ results: clean, loading: false, error: null });
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Unknown error';
            setState({ results: [], loading: false, error: msg });
        }
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (!query.trim()) {
            setState({ results: [], loading: false, error: null });
            return;
        }

        setState((s) => ({ ...s, loading: true }));

        debounceRef.current = setTimeout(() => {
            search(query);
        }, 500);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query, search]);

    return {
        query,
        setQuery,
        ...state,
    };
};