import { useCallback, useEffect, useRef, useState } from 'react';
import { Book } from '../components/BookCard';
import { BooksService } from '../services/books';

type State = {
    books:       Book[];
    loading:     boolean;
    loadingMore: boolean;   // ✅ added
    error:       string | null;
    hasMore:     boolean;
};

export const useBooks = (categoryQuery = '', searchQuery = '') => {
    const [state, setState] = useState<State>({
        books:       [],
        loading:     true,
        loadingMore: false,
        error:       null,
        hasMore:     true,
    });

    const nextUrlRef     = useRef<string | null>(null);
    const loadingMoreRef = useRef(false);

    const loadInitial = useCallback(async () => {
        setState({ books: [], loading: true, loadingMore: false, error: null, hasMore: true });

        try {
            let data: any;

            if (searchQuery.trim()) {
                data = await BooksService.searchBooks(searchQuery.trim());
            } else if (categoryQuery.trim()) {
                data = await BooksService.getBySubject(categoryQuery.trim());
            } else {
                data = await BooksService.getBooks(1);
            }

            nextUrlRef.current = data.next ?? null;

            setState({
                books:       data.results ?? [],
                loading:     false,
                loadingMore: false,
                error:       null,
                hasMore:     !!data.next,
            });
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Unknown error';
            setState((s) => ({ ...s, loading: false, error: msg }));
        }
    }, [categoryQuery, searchQuery]);

    const loadMore = useCallback(async () => {
        if (loadingMoreRef.current || !nextUrlRef.current) return;

        loadingMoreRef.current = true;
        setState((s) => ({ ...s, loadingMore: true }));  // ✅ set loadingMore true

        try {
            const data = await BooksService.getNext(nextUrlRef.current);
            nextUrlRef.current = data.next ?? null;

            setState((s) => ({
                ...s,
                books:       [...s.books, ...(data.results ?? [])],
                loadingMore: false,
                hasMore:     !!data.next,
            }));
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Unknown error';
            setState((s) => ({ ...s, loadingMore: false, error: msg }));
        } finally {
            loadingMoreRef.current = false;
        }
    }, []);

    useEffect(() => {
        loadInitial();
    }, [loadInitial]);

    return { ...state, loadMore, retry: loadInitial };
};