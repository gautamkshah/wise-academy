import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserProblem } from '@prisma/client';
import { StatsService } from '../stats/stats.service';

@Injectable()
export class ProgressService {
    constructor(
        private prisma: PrismaService,
        private statsService: StatsService,
    ) { }

    async updateProblemStatus(userId: string, problemId: string, status: 'PENDING' | 'SOLVED'): Promise<UserProblem> {
        // Resolve internal ID if userId is a Firebase UID
        const user = await this.prisma.user.findFirst({
            where: { OR: [{ firebase_uid: userId }, { id: userId }] }
        });
        const internalId = user?.id || userId;

        const progress = await this.prisma.userProblem.upsert({
            where: {
                user_id_problem_id: {
                    user_id: internalId,
                    problem_id: problemId,
                },
            },
            update: {
                status: status,
                solved_at: status === 'SOLVED' ? new Date() : null,
            },
            create: {
                user_id: internalId,
                problem_id: problemId,
                status: status,
                solved_at: status === 'SOLVED' ? new Date() : null,
            },
        });

        // Trigger stats sync to update leaderboard
        await this.statsService.syncUserStats(internalId);

        return progress;
    }

    async syncWithExternalPlatforms(userId: string) {
        const user = await this.prisma.user.findFirst({
            where: { OR: [{ firebase_uid: userId }, { id: userId }] },
            include: { progress: true }
        });

        if (!user) return { message: 'User not found' };

        const results = {
            leetcode: 0,
            totalSynced: 0
        };

        // LeetCode Sync
        if (user.leetcode_id) {
            // We'll need a way to fetch recent submissions slugs
            // Use the stats service to fetch submissions
            const submissions = await this.statsService.fetchRecentLeetCodeSubmissions(user.leetcode_id);

            if (submissions && submissions.length > 0) {
                const problems = await this.prisma.problem.findMany({
                    where: { platform: 'LeetCode' }
                });

                for (const sub of submissions) {
                    const matchingProblem = problems.find(p => p.leetcode_link?.includes(sub.titleSlug));
                    if (matchingProblem) {
                        const alreadySolved = user.progress.some(p => p.problem_id === matchingProblem.id && p.status === 'SOLVED');
                        if (!alreadySolved) {
                            await this.prisma.userProblem.upsert({
                                where: {
                                    user_id_problem_id: {
                                        user_id: user.id,
                                        problem_id: matchingProblem.id
                                    }
                                },
                                update: { status: 'SOLVED', solved_at: new Date() },
                                create: { user_id: user.id, problem_id: matchingProblem.id, status: 'SOLVED', solved_at: new Date() }
                            });
                            results.leetcode++;
                            results.totalSynced++;
                        }
                    }
                }
            }
        }


        // CodeForces Sync
        if (user.codeforces_id) {
            const solvedProblems = await this.statsService.fetchCodeForcesSolved(user.codeforces_id);

            if (solvedProblems && solvedProblems.size > 0) {
                const problems = await this.prisma.problem.findMany({
                    where: { platform: 'CodeForces' }
                });

                for (const problem of problems) {
                    // Extract ID from leetcode_link (stored as actual URL or just ID? Assuming URL or ID string based on Schema comments)
                    // The schema comments say leetcode_link, but for CF we might use it to store the link which contains the ID.
                    // Or we should rely on a convention. The Plan said: "parse their leetcode_link to extract the Codeforces problem identifier"
                    // Better approach: Check if leetcode_link contains the problem ID (e.g. /contest/123/problem/A) or if we just stored the ID in it.
                    // Let's assume leetcode_link stores the full URL: https://codeforces.com/contest/123/problem/C
                    // Regex to extract: contest/(\d+)/problem/(\w+) -> $1$2

                    if (problem.leetcode_link) {
                        const match = problem.leetcode_link.match(/contest\/(\d+)\/problem\/(\w+)/);
                        if (match) {
                            const problemId = `${match[1]}${match[2]}`;
                            if (solvedProblems.has(problemId)) {
                                const alreadySolved = user.progress.some(p => p.problem_id === problem.id && p.status === 'SOLVED');
                                if (!alreadySolved) {
                                    await this.prisma.userProblem.upsert({
                                        where: {
                                            user_id_problem_id: {
                                                user_id: user.id,
                                                problem_id: problem.id
                                            }
                                        },
                                        update: { status: 'SOLVED', solved_at: new Date() },
                                        create: { user_id: user.id, problem_id: problem.id, status: 'SOLVED', solved_at: new Date() }
                                    });
                                    // Initialize if undefined (though results is {leetcode:0, totalSynced:0})
                                    // We need to add 'codeforces' to results object or just track total.
                                    // The output type isn't strict so we can add properties.
                                    if (!(results as any).codeforces) (results as any).codeforces = 0;
                                    (results as any).codeforces++;
                                    results.totalSynced++;
                                }
                            }
                        }
                    }
                }
            }
        }

        if (results.totalSynced > 0) {
            await this.statsService.syncUserStats(user.id);
        }

        return results;
    }

    async getUserProgress(userId: string): Promise<UserProblem[]> {
        const user = await this.prisma.user.findFirst({
            where: { OR: [{ firebase_uid: userId }, { id: userId }] }
        });
        const internalId = user?.id || userId;

        return this.prisma.userProblem.findMany({
            where: { user_id: internalId },
        });
    }
}
