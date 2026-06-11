import { fetchPodcast, fetchPodcastDetail } from '../app/api/podcastapi';

// ─── Search podcasts ──────────────────────────────────────────────────────────

export const getpodcast = async (query: string) => {
    // ✅ fetchPodcast already maps the results — no need to map .results again
    const data = await fetchPodcast(query);

    return data.map((item: any) => ({
        id:          item.id,
        title:       item.title,
        description: item.description,
        image:       item.image,
    }));
};

// ─── Get podcast detail with episodes ────────────────────────────────────────

export const getPodcastDetail = async (podcastId: string) => {
    // ✅ fetchPodcastDetail returns a single object, not an array
    const response = await fetchPodcastDetail(podcastId);

    return {
        id:            response.id,
        title:         response.title,
        description:   response.description,
        image:         response.image,
        publisher:     response.publisher,
        totalEpisodes: response.totalEpisodes,
        episodes:      response.episodes,
    };
};