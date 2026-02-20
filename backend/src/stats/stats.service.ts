import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { LeetCodeFetcher } from './fetchers/LeetCodeFetcher';
import { CodeForcesFetcher } from './fetchers/CodeForcesFetcher';
import { CodeChefFetcher } from './fetchers/CodeChefFetcher';
import { AtCoderFetcher } from './fetchers/AtCoderFetcher';
import { HackerRankFetcher } from './fetchers/HackerRankFetcher';

@Injectable()
export class StatsService {
    private readonly logger = new Logger(StatsService.name);
    private readonly leetcodeFetcher = new LeetCodeFetcher();
    private readonly cfFetcher = new CodeForcesFetcher();
    private readonly ccFetcher = new CodeChefFetcher();
    private readonly atcoderFetcher = new AtCoderFetcher();
    private readonly hackerRankFetcher = new HackerRankFetcher();

    constructor(private prisma: PrismaService) { }

    async fetchRecentLeetCodeSubmissions(username: string) {
        return this.leetcodeFetcher.fetchRecentSubmissions(username);
    }

    async fetchCodeForcesSolved(username: string) {
        return this.cfFetcher.fetchSolvedProblems(username);
    }

    @Cron(CronExpression.EVERY_HOUR)
    async handleCron() {
        this.logger.debug('Running hourly stats update...');

        const users = await this.prisma.user.findMany();

        for (const user of users) {
            await this.syncUserStats(user.id);
        }
    }

    async syncUserStats(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) return;

        this.logger.log(`Syncing stats for user: ${user.email}`);

        let leetcodeSolved = 0;
        let leetcodeRating: number | null = null;
        let cfSolved = 0;
        let cfRating: number | null = null;
        let ccSolved = 0;
        let ccRating: number | null = null;
        let atcoderSolved = 0;
        let atcoderRating: number | null = null;
        let hackerrankSolved = 0;

        // Fetch LeetCode
        if (user.leetcode_id) {
            const lcStats = await this.leetcodeFetcher.fetchStats(user.leetcode_id);
            if (lcStats) {
                leetcodeSolved = lcStats.solved;
                leetcodeRating = lcStats.rating;
            }
        }

        // Fetch CodeForces
        if (user.codeforces_id) {
            const cfStats = await this.cfFetcher.fetchStats(user.codeforces_id);
            if (cfStats) {
                cfSolved = cfStats.solved;
                cfRating = cfStats.rating;
            }
        }

        // Fetch CodeChef
        if (user.codechef_id) {
            const ccStats = await this.ccFetcher.fetchStats(user.codechef_id);
            if (ccStats) {
                ccSolved = ccStats.solved;
                ccRating = ccStats.rating;
            }
        }

        // Fetch AtCoder
        if (user.atcoder_id) {
            const acStats = await this.atcoderFetcher.fetchStats(user.atcoder_id);
            if (acStats) {
                atcoderSolved = acStats.solved;
                atcoderRating = acStats.rating;
            }
        }

        // Fetch HackerRank
        if (user.hackerrank_id) {
            const hrStats = await this.hackerRankFetcher.fetchStats(user.hackerrank_id);
            if (hrStats) {
                hackerrankSolved = hrStats.solved;
            }
        }

        // Academy Progress
        const academySolved = await this.prisma.userProblem.count({
            where: { user_id: user.id, status: 'SOLVED' }
        });

        // Total solved should only include external platforms to avoid double counting
        // since academySolved are just subsets of these external problems.
        const totalSolved = leetcodeSolved + cfSolved + ccSolved + atcoderSolved + hackerrankSolved;

        try {
            const result = await (this.prisma.userStats as any).upsert({
                where: { user_id: user.id },
                update: {
                    total_solved: totalSolved,
                    leetcode_solved: leetcodeSolved,
                    leetcode_rating: leetcodeRating,
                    cf_solved: cfSolved,
                    cf_rating: cfRating,
                    cc_solved: ccSolved,
                    cc_rating: ccRating,
                    atcoder_solved: atcoderSolved,
                    atcoder_rating: atcoderRating,
                    hackerrank_solved: hackerrankSolved,
                },
                create: {
                    user_id: user.id,
                    total_solved: totalSolved,
                    leetcode_solved: leetcodeSolved,
                    leetcode_rating: leetcodeRating,
                    cf_solved: cfSolved,
                    cf_rating: cfRating,
                    cc_solved: ccSolved,
                    cc_rating: ccRating,
                    atcoder_solved: atcoderSolved,
                    atcoder_rating: atcoderRating,
                    hackerrank_solved: hackerrankSolved,
                }
            });
            this.logger.log(`Successfully synced stats for ${user.email}: Total ${totalSolved}`);
            return result;
        } catch (error) {
            this.logger.error(`Failed to upsert stats for ${user.email}:`, error.message);
        }
    }

}
