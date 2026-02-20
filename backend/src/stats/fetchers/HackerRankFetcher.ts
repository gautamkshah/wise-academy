import axios from 'axios';
import { IPlatformFetcher } from './IPlatformFetcher';

export class HackerRankFetcher implements IPlatformFetcher {
    async fetchStats(username: string): Promise<{ solved: number; rating: number | null } | null> {
        if (!username) return null;
        try {
            // HackerRank doesn't have a simple "total solved" API.
            // We can get badges/points from: https://www.hackerrank.com/rest/hackers/{username}/badges
            // Or recent submission history.

            const response = await axios.get(`https://www.hackerrank.com/rest/hackers/${username}/badges`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            if (response.data && response.data.models) {
                // Sum up solved count from badges? 
                // Actually, https://www.hackerrank.com/rest/hackers/{username}/scores_elo 
                // might be better for practice data.

                // Let's try to get a "Total Solved" proxy. 
                // The badges endpoint gives us "solved" per badge (e.g. Algorithms: solved 50).

                const badges = response.data.models;
                let totalSolved = 0;

                badges.forEach((badge: any) => {
                    if (badge.solved) {
                        totalSolved += badge.solved;
                    }
                });

                return { solved: totalSolved, rating: null }; // HackerRank doesn't have a single "Rating"
            }

            return { solved: 0, rating: null };

        } catch (error) {
            console.error(`Failed to fetch HackerRank stats for ${username}:`, error.message);
            return null;
        }
    }
}
