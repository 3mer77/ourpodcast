import { useState } from 'react';
import { useSubscription } from '../context/Subscriptioncontext';

/**
 * useContentGate
 *
 * Call this in Player and BookDetail to check if user can access content.
 * Returns a gated flag and a PaywallScreen trigger.
 *
 * Usage in Player:
 *   const { isGated, paywallReason, showPaywall, setShowPaywall } = useContentGate();
 *   useEffect(() => {
 *       const allowed = checkAndGatePodcast(podcastId);
 *       if (!allowed) return; // paywall shown automatically
 *       // proceed with playback
 *   }, []);
 */

export type GateReason = 'podcast' | 'book' | 'general';

export const useContentGate = () => {
    const { canPlayPodcast, canReadBook, recordPodcastPlay, recordBookRead } = useSubscription();

    const [showPaywall, setShowPaywall] = useState(false);
    const [paywallReason, setPaywallReason] = useState<GateReason>('general');

    // ✅ Returns true if allowed, false if gated
    const checkAndGatePodcast = (podcastId: string, title?: string): boolean => {
        if (canPlayPodcast(podcastId)) {
            recordPodcastPlay(podcastId, title); // record usage
            return true;
        }
        setPaywallReason('podcast');
        setShowPaywall(true);
        return false;
    };

    const checkAndGateBook = (bookId: string, title?: string): boolean => {
        if (canReadBook(bookId)) {
            recordBookRead(bookId, title);
            return true;
        }
        setPaywallReason('book');
        setShowPaywall(true);
        return false;
    };

    return {
        showPaywall,
        setShowPaywall,
        paywallReason,
        checkAndGatePodcast,
        checkAndGateBook,
    };
};