import { useCallback, useEffect, useRef, useState } from 'react';
import { BooksService } from '../services/books';

// ─── Types ────────────────────────────────────────────────────────────────────

export type BookDetail = {
    id: number;
    title: string;
    authors: { id: number; name: string }[];
    cover_image: string | null;
    summary: string;
    subjects: string[];
    download_count: number;
    reading_ease_score: string | null;
    issued: string;
};

type State = {
    book: BookDetail | null;
    pages: string[];          // text split into pages
    currentPage: number;
    totalPages: number;
    loading: boolean;
    loadingText: boolean;
    error: string | null;
};

// ─── Constants ────────────────────────────────────────────────────────────────

// roughly how many characters per page — adjust to feel right
const CHARS_PER_PAGE = 1800;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const splitIntoPages = (text: string): string[] => {
    const pages: string[] = [];

    // split on paragraph breaks to avoid cutting mid-sentence
    const paragraphs = text.split(/\n\s*\n/);
    let current = '';

    for (const para of paragraphs) {
        const trimmed = para.trim();
        if (!trimmed) continue;

        if ((current + '\n\n' + trimmed).length > CHARS_PER_PAGE && current) {
            pages.push(current.trim());
            current = trimmed;
        } else {
            current = current ? current + '\n\n' + trimmed : trimmed;
        }
    }

    if (current.trim()) pages.push(current.trim());
    return pages;
};

// ─── Hook ────────────────────────────────────────────────────────────────────

export const useBookDetail = (bookId: number) => {
    const [state, setState] = useState<State>({
        book: null,
        pages: [],
        currentPage: 0,
        totalPages: 0,
        loading: true,
        loadingText: false,
        error: null,
    });

    const pagesRef = useRef<string[]>([]);

    // ── Load book info + text ─────────────────────────────────────────────────
    const load = useCallback(async () => {
        try {
            setState((s) => ({ ...s, loading: true, error: null }));

            // fetch both in parallel
            const [bookData, textData] = await Promise.all([
                BooksService.getBookById(bookId),
                BooksService.getBookText(bookId),
            ]);

            const rawText = textData?.text ?? textData?.content ?? '';
            const pages = splitIntoPages(rawText);
            pagesRef.current = pages;

            setState({
                book: bookData,
                pages,
                currentPage: 0,
                totalPages: pages.length,
                loading: false,
                loadingText: false,
                error: null,
            });
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Unknown error';
            setState((s) => ({ ...s, loading: false, error: msg }));
        }
    }, [bookId]);

    // ── Navigation ────────────────────────────────────────────────────────────
    const nextPage = useCallback(() => {
        setState((s) => {
            if (s.currentPage >= s.totalPages - 1) return s;
            return { ...s, currentPage: s.currentPage + 1 };
        });
    }, []);

    const prevPage = useCallback(() => {
        setState((s) => {
            if (s.currentPage <= 0) return s;
            return { ...s, currentPage: s.currentPage - 1 };
        });
    }, []);

    const goToPage = useCallback((page: number) => {
        setState((s) => ({
            ...s,
            currentPage: Math.max(0, Math.min(page, s.totalPages - 1)),
        }));
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    return {
        ...state,
        nextPage,
        prevPage,
        goToPage,
        retry: load,
    };
};