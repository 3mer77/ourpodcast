import { Session, User } from '@supabase/supabase-js';
import { router } from 'expo-router';
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import { supabase } from '../lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

type AuthState = {
    user:        User | null;
    session:     Session | null;
    loading:     boolean;
    authLoading: boolean;
    error:       string | null;
};

type AuthContextType = AuthState & {
    signUpWithEmail:  (email: string, password: string) => Promise<void>;
    signInWithEmail:  (email: string, password: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signOut:          () => Promise<void>;
    clearError:       () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AuthState>({
        user:        null,
        session:     null,
        loading:     true,
        authLoading: false,
        error:       null,
    });

    const setError = (error: string) =>
        setState((s) => ({ ...s, error, authLoading: false }));

    const clearError = useCallback(() =>
        setState((s) => ({ ...s, error: null })), []);

    // ── Listen to auth state changes ──────────────────────────────────────────
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setState((s) => ({
                ...s,
                session,
                user:    session?.user ?? null,
                loading: false,
            }));
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setState((s) => ({
                    ...s,
                    session,
                    user:    session?.user ?? null,
                    loading: false,
                }));
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    // ── Sign up ───────────────────────────────────────────────────────────────
    const signUpWithEmail = useCallback(async (email: string, password: string) => {
        setState((s) => ({ ...s, authLoading: true, error: null }));
        try {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) throw error;
            setState((s) => ({ ...s, authLoading: false }));
            router.replace('/(auth)/verify');
        } catch (e: any) {
            setError(e.message ?? 'Sign up failed');
        }
    }, []);

    // ── Sign in with email ────────────────────────────────────────────────────
    const signInWithEmail = useCallback(async (email: string, password: string) => {
        setState((s) => ({ ...s, authLoading: true, error: null }));
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            setState((s) => ({ ...s, authLoading: false }));
            router.replace('/(tabs)');
        } catch (e: any) {
            setError(e.message ?? 'Sign in failed');
        }
    }, []);

    // ── Sign in with Google ───────────────────────────────────────────────────
    const signInWithGoogle = useCallback(async () => {
        setState((s) => ({ ...s, authLoading: true, error: null }));
        try {
            const { openAuthSessionAsync } = await import('expo-web-browser');

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    // ✅ Supabase redirects back to your app after Google auth
                    redirectTo: 'ourpodcast://',
                    skipBrowserRedirect: true, // ✅ we open the browser manually
                },
            });

            if (error) throw error;
            if (!data.url) throw new Error('No OAuth URL returned');

            // ✅ Open Google login — closes automatically when redirected to ourpodcast://
            const result = await openAuthSessionAsync(
                data.url,
                'ourpodcast://'
            );

            if (result.type === 'success' && result.url) {
                // ✅ Tokens are in the URL hash fragment after redirect
                const hashParams  = new URLSearchParams(result.url.split('#')[1] ?? '');
                const accessToken  = hashParams.get('access_token');
                const refreshToken = hashParams.get('refresh_token');

                if (accessToken && refreshToken) {
                    const { error: sessionError } = await supabase.auth.setSession({
                        access_token:  accessToken,
                        refresh_token: refreshToken,
                    });
                    if (sessionError) throw sessionError;
                    router.replace('/(tabs)');
                } else {
                    throw new Error('Could not extract tokens from redirect URL');
                }
            }

            setState((s) => ({ ...s, authLoading: false }));
        } catch (e: any) {
            setError(e.message ?? 'Google sign in failed');
        }
    }, []);

    // ── Sign out ──────────────────────────────────────────────────────────────
    const signOut = useCallback(async () => {
        await supabase.auth.signOut();
        router.replace('/(auth)/login');
    }, []);

    return (
        <AuthContext.Provider value={{
            ...state,
            signUpWithEmail,
            signInWithEmail,
            signInWithGoogle,
            signOut,
            clearError,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAuth = (): AuthContextType => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
};