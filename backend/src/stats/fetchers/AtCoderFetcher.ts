import axios from 'axios';
import { IPlatformFetcher } from './IPlatformFetcher';

export class AtCoderFetcher implements IPlatformFetcher {
    async fetchStats(username: string): Promise<{ solved: number; rating: number | null } | null> {
        if (!username) return null;
        try {
            // 1. Fetch Solved Count (Kenkoooo API)
            const acResponse = await axios.get(`https://kenkoooo.com/atcoder/atcoder-api/v3/user/ac_rank?user=${username}`);
            const solved = acResponse.data.count || 0;

            // 2. Fetch Rating (Optional - scraping algorithm rating is complex, Kenkoooo doesn't give current rating easily)
            // For now, we will return rating as null or implement scraping later if needed.
            // Some users use https://atcoder.jp/users/{username}/history/json 

            let rating = null;
            try {
                // Try fetching rating from history
                const historyRes = await axios.get(`https://atcoder.jp/users/${username}/history/json`);
                if (historyRes.data && historyRes.data.length > 0) {
                    rating = historyRes.data[historyRes.data.length - 1].NewRating;
                }
            } catch (e) {
                // Ignore rating fetch error
            }

            return { solved, rating };
        } catch (error) {
            console.error(`Failed to fetch AtCoder stats for ${username}:`, error.message);
            return null;
        }
    }
}
