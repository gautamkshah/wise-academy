import { Logger } from '@nestjs/common';
import { IPlatformFetcher, PlatformStats } from './IPlatformFetcher';
import axios from 'axios';
import * as cheerio from 'cheerio';

export class CodeChefFetcher implements IPlatformFetcher {
    private readonly logger = new Logger(CodeChefFetcher.name);

    async fetchStats(username: string): Promise<PlatformStats | null> {
        try {
            this.logger.log(`Fetching CodeChef stats for: ${username}`);

            const response = await axios.get(`https://www.codechef.com/users/${username}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            const $ = cheerio.load(response.data);

            // Rating
            const ratingText = $('.rating-number').first().text();
            const rating = parseInt(ratingText) || 0;

            // Solved Problems
            // Target the specific section and text for Total Problems Solved
            const solvedText = $('section.problems-solved h3:contains("Total Problems Solved")').text();
            let solved = 0;
            const match = solvedText.match(/\d+/);
            if (match) {
                solved = parseInt(match[0]);
            } else {
                // Fallback: search for any h3 containing "Total Problems Solved"
                const fallbackText = $('h3:contains("Total Problems Solved")').first().text();
                const fallbackMatch = fallbackText.match(/\d+/);
                if (fallbackMatch) solved = parseInt(fallbackMatch[0]);
            }

            this.logger.log(`CodeChef for ${username}: Solved ${solved}, Rating ${rating}`);
            return { solved, rating };
        } catch (error) {
            this.logger.error(`Error fetching CodeChef stats for ${username}:`, error.message);
            return null;
        }
    }
}
