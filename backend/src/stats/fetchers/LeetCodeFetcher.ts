import { Logger } from '@nestjs/common';
import { IPlatformFetcher, PlatformStats } from './IPlatformFetcher';
import axios from 'axios';

export class LeetCodeFetcher implements IPlatformFetcher {
    private readonly logger = new Logger(LeetCodeFetcher.name);

    async fetchStats(username: string): Promise<PlatformStats | null> {
        try {
            this.logger.log(`Fetching LeetCode stats for: ${username}`);

            // Unified query for solved count and contest ranking
            const query = `
                query userStats($username: String!) {
                    matchedUser(username: $username) {
                        submitStatsGlobal {
                            acSubmissionNum {
                                difficulty
                                count
                            }
                        }
                    }
                    userContestRanking(username: $username) {
                        rating
                        globalRanking
                    }
                }
            `;

            const response = await axios.post('https://leetcode.com/graphql', {
                query,
                variables: { username }
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            const data = response.data.data;
            if (!data.matchedUser) return null;

            const solvedStats = data.matchedUser.submitStatsGlobal.acSubmissionNum;
            const solved = solvedStats.find((i: any) => i.difficulty === 'All')?.count || 0;
            const rating = Math.round(data.userContestRanking?.rating || 0);

            this.logger.log(`LeetCode for ${username}: Solved ${solved}, Rating ${rating}`);
            return { solved, rating };
        } catch (error) {
            this.logger.error(`Error fetching LeetCode stats for ${username}:`, error.message);
            return null;
        }
    }
}
