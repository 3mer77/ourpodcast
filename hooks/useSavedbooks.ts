import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    getSavedBooks,
    saveBook,
    SavedBook,
    unsaveBook,
} from '../services/supabaselibrary';

export const useSavedBooks = () => {
    const { user } = useAuth();

    const [savedBookIds, setSavedBookIds] = useState<Set<string>>(new Set());
    const [savedBooks,   setSavedBooks]   = useState<SavedBook[]>([]);
    const [loading,      setLoading]      = useState(false);

    useEffect(() => {
        if (!user) { setSavedBookIds(new Set()); setSavedBooks([]); return; }

        const load = async () => {
            try {
                const data = await getSavedBooks(user.id);
                setSavedBooks(data);
                setSavedBookIds(new Set(data.map((b) => b.book_id)));
            } catch (e) {
                console.error('useSavedBooks load error:', e);
            }
        };
        load();
    }, [user]);

    const loadSavedBooks = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await getSavedBooks(user.id);
            setSavedBooks(data);
            setSavedBookIds(new Set(data.map((b) => b.book_id)));
        } catch (e) {
            console.error('loadSavedBooks error:', e);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const toggleSaveBook = useCallback(async (
        bookId: string,
        isSaving: boolean,
        meta?: { title: string; cover_image: string }
    ) => {
        if (!user) return;

        // optimistic update
        setSavedBookIds((prev) => {
            const next = new Set(prev);
            isSaving ? next.add(bookId) : next.delete(bookId);
            return next;
        });

        try {
            if (isSaving && meta) {
                await saveBook(user.id, { book_id: bookId, ...meta });
            } else {
                await unsaveBook(user.id, bookId);
            }
        } catch (e) {
            setSavedBookIds((prev) => {
                const next = new Set(prev);
                isSaving ? next.delete(bookId) : next.add(bookId);
                return next;
            });
            console.error('toggleSaveBook error:', e);
        }
    }, [user]);

    return { savedBookIds, savedBooks, loading, toggleSaveBook, loadSavedBooks };
};