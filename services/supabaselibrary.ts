import { supabase } from '../lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SavedPodcast = {
    id: string;
    podcast_id: string;
    title: string;
    poster: string;
    duration: string;
    published_at: string;
    created_at: string;
};

export type SavedBook = {
    id: string;
    book_id: string;
    title: string;
    cover_image: string;
    created_at: string;
};

export type PodcastProgress = {
    podcast_id: string;
    title: string;
    poster: string;
    duration_ms: number;
    position_ms: number;
    completed: boolean;
    last_listened_at: string;
};

export type BookProgress = {
    book_id: string;
    title: string;
    cover_image: string;
    current_page: number;
    total_pages: number;
    last_read_at: string;
};

// ─── Saved Podcasts ───────────────────────────────────────────────────────────

export const savePodcast = async (
    userId: string,
    podcast: Omit<SavedPodcast, 'id' | 'created_at'>
) => {
    const { error } = await supabase
        .from('saved_podcasts')
        .upsert({ user_id: userId, ...podcast }, { onConflict: 'user_id,podcast_id' });
    if (error) throw error;
};

export const unsavePodcast = async (userId: string, podcastId: string) => {
    const { error } = await supabase
        .from('saved_podcasts')
        .delete()
        .eq('user_id', userId)
        .eq('podcast_id', podcastId);
    if (error) throw error;
};

export const getSavedPodcasts = async (userId: string): Promise<SavedPodcast[]> => {
    const { data, error } = await supabase
        .from('saved_podcasts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
};

export const getSavedPodcastIds = async (userId: string): Promise<Set<string>> => {
    const { data, error } = await supabase
        .from('saved_podcasts')
        .select('podcast_id')
        .eq('user_id', userId);
    if (error) throw error;
    return new Set((data ?? []).map((r: any) => r.podcast_id));
};

// ─── Saved Books ──────────────────────────────────────────────────────────────

export const saveBook = async (
    userId: string,
    book: Omit<SavedBook, 'id' | 'created_at'>
) => {
    const { error } = await supabase
        .from('saved_books')
        .upsert({ user_id: userId, ...book }, { onConflict: 'user_id,book_id' });
    if (error) throw error;
};

export const unsaveBook = async (userId: string, bookId: string) => {
    const { error } = await supabase
        .from('saved_books')
        .delete()
        .eq('user_id', userId)
        .eq('book_id', bookId);
    if (error) throw error;
};

export const getSavedBooks = async (userId: string): Promise<SavedBook[]> => {
    const { data, error } = await supabase
        .from('saved_books')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
};

// ─── Podcast Progress ─────────────────────────────────────────────────────────

export const updatePodcastProgress = async (
    userId: string,
    progress: Omit<PodcastProgress, 'last_listened_at'>
) => {
    const { error } = await supabase
        .from('podcast_progress')
        .upsert(
            { user_id: userId, ...progress, last_listened_at: new Date().toISOString() },
            { onConflict: 'user_id,podcast_id' }
        );
    if (error) throw error;
};

export const getRecentPodcasts = async (
    userId: string,
    limit = 20
): Promise<PodcastProgress[]> => {
    const { data, error } = await supabase
        .from('podcast_progress')
        .select('*')
        .eq('user_id', userId)
        .order('last_listened_at', { ascending: false })
        .limit(limit);
    if (error) throw error;
    return data ?? [];
};

export const getPodcastProgress = async (
    userId: string,
    podcastId: string
): Promise<PodcastProgress | null> => {
    const { data, error } = await supabase
        .from('podcast_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('podcast_id', podcastId)
        .single();
    if (error) return null;
    return data;
};

// ─── Book Progress ────────────────────────────────────────────────────────────

export const updateBookProgress = async (
    userId: string,
    progress: Omit<BookProgress, 'last_read_at'>
) => {
    const { error } = await supabase
        .from('book_progress')
        .upsert(
            { user_id: userId, ...progress, last_read_at: new Date().toISOString() },
            { onConflict: 'user_id,book_id' }
        );
    if (error) throw error;
};

export const getRecentBooks = async (
    userId: string,
    limit = 20
): Promise<BookProgress[]> => {
    const { data, error } = await supabase
        .from('book_progress')
        .select('*')
        .eq('user_id', userId)
        .order('last_read_at', { ascending: false })
        .limit(limit);
    if (error) throw error;
    return data ?? [];
};

export const getBookProgress = async (
    userId: string,
    bookId: string
): Promise<BookProgress | null> => {
    const { data, error } = await supabase
        .from('book_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .single();
    if (error) return null;
    return data;
};