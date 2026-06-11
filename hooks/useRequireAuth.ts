import { router } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * useRequireAuth
 *
 * Call this at the top of any screen that requires the user to be signed in.
 * If not authenticated, redirects to login and saves the intended destination.
 *
 * Usage:
 *   const { user, loading } = useRequireAuth();
 *   if (loading) return <Spinner />;
 */
export const useRequireAuth = () => {
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/(auth)/login');
        }
    }, [user, loading]);

    return { user, loading };
};