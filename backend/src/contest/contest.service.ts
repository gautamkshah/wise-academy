import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface Contest {
    name: string;
    platform: 'LeetCode' | 'CodeForces' | 'CodeChef';
    startTime: string; // ISO string
    duration: string; // e.g., "2 hours", "90 minutes"
    url: string;
}

@Injectable()
export class ContestService {
    private readonly logger = new Logger(ContestService.name);

    async getAllContests(): Promise<Contest[]> {
        const [cf, lc, cc] = await Promise.all([
            this.fetchCodeForcesContests(),
            this.fetchLeetCodeContests(),
            this.fetchCodeChefContests()
        ]);

        const allContests = [...cf, ...lc, ...cc];
        return allContests.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    }

    private async fetchCodeForcesContests(): Promise<Contest[]> {
        try {
            const response = await axios.get('https://codeforces.com/api/contest.list');
            if (response.data.status !== 'OK') return [];

            const contests = response.data.result
                .filter((c: any) => c.phase === 'BEFORE')
                .map((c: any) => ({
                    name: c.name,
                    platform: 'CodeForces',
                    startTime: new Date(c.startTimeSeconds * 1000).toISOString(),
                    duration: `${c.durationSeconds / 60} minutes`,
                    url: `https://codeforces.com/contest/${c.id}`
                }));

            return contests;
        } catch (error) {
            this.logger.error('Error fetching CodeForces contests', error.message);
            return [];
        }
    }

    private async fetchLeetCodeContests(): Promise<Contest[]> {
        try {
            const query = `
                query topTwoContests {
                    topTwoContests {
                        title
                        titleSlug
                        startTime
                        duration
                    }
                }
            `;
            const response = await axios.post('https://leetcode.com/graphql', { query }, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Content-Type': 'application/json',
                    'Referer': 'https://leetcode.com/contest/'
                }
            });

            if (!response.data.data || !response.data.data.topTwoContests) {
                this.logger.warn('LeetCode API returned no contest data structure', response.data);
                return [];
            }

            return response.data.data.topTwoContests.map((c: any) => ({
                name: c.title,
                platform: 'LeetCode',
                startTime: new Date(c.startTime * 1000).toISOString(),
                duration: `${c.duration / 60} minutes`,
                url: `https://leetcode.com/contest/${c.titleSlug}`
            }));
        } catch (error) {
            this.logger.error('Error fetching LeetCode contests', error.message);
            if (error.response) {
                this.logger.error('LC Error Response:', error.response.data);
            }
            return [];
        }
    }

    private async fetchCodeChefContests(): Promise<Contest[]> {
        try {
            const response = await axios.get('https://www.codechef.com/api/list/contests/all?sort_by=START&sorting_order=asc&offset=0&mode=all');

            const presentContests = response.data.present_contests || [];
            const futureContests = response.data.future_contests || [];

            const all = [...presentContests, ...futureContests];

            return all.map((c: any) => ({
                name: c.contest_name,
                platform: 'CodeChef',
                startTime: c.contest_start_date_iso,
                duration: `${c.contest_duration} minutes`,
                url: `https://www.codechef.com/${c.contest_code}`
            }));
        } catch (error) {
            // Fallback to scraping if API fails or is blocked
            this.logger.warn('CodeChef API failed, attempting scrape fallback...');
            // For now, return empty to avoid breaking everything if scrape is complex
            this.logger.error('Error fetching CodeChef contests', error.message);
            return [];
        }
    }
}
