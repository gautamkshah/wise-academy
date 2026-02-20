import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }

    async getDashboardData(userId: string) {
        // 1. Fetch User & Stats
        // 1. Fetch User & Stats
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { firebase_uid: userId },
                    { id: userId }
                ]
            },
            include: { stats: true }
        });

        if (!user) throw new Error('User not found');

        // 2. Fetch Recent Activity (Last 30 days)
        const activity = await this.prisma.userProblem.findMany({
            where: {
                user_id: user.id,
                status: 'SOLVED',
                solved_at: {
                    gte: new Date(new Date().setDate(new Date().getDate() - 365)) // Last year for heatmap
                }
            },
            select: {
                solved_at: true,
                problem: { select: { platform: true, difficulty: true } }
            },
            orderBy: { solved_at: 'asc' }
        });

        // 3. Fetch Active Courses Progress
        // Get courses where user has solved at least one problem
        const activeCourses = await this.prisma.course.findMany({
            where: {
                chapters: {
                    some: {
                        problems: {
                            some: {
                                userProgress: {
                                    some: { user_id: user.id, status: 'SOLVED' }
                                }
                            }
                        }
                    }
                }
            },
            include: {
                chapters: {
                    include: {
                        problems: { select: { id: true } }
                    }
                }
            }
        });

        const courseProgress = await Promise.all(activeCourses.map(async (course) => {
            const totalProblems = course.chapters.reduce((acc, ch) => acc + ch.problems.length, 0);
            const courseProblemIds = course.chapters.flatMap(ch => ch.problems.map(p => p.id));

            const solvedCount = await this.prisma.userProblem.count({
                where: {
                    user_id: user.id,
                    problem_id: { in: courseProblemIds },
                    status: 'SOLVED'
                }
            });

            return {
                id: course.id,
                title: course.title,
                totalProblems,
                solved: solvedCount,
                percentage: totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0
            };
        }));

        // 4. Format Activity Data for Heatmap (Count per day)
        const activityMap = new Map<string, number>();
        activity.forEach(a => {
            if (a.solved_at) {
                const date = a.solved_at.toISOString().split('T')[0];
                activityMap.set(date, (activityMap.get(date) || 0) + 1);
            }
        });

        const activityHeatmap = Array.from(activityMap.entries()).map(([date, count]) => ({
            date,
            count
        }));

        return {
            user: {
                name: user.name,
                email: user.email,
                avatar: user.photo
            },
            stats: user.stats,
            handles: {
                leetcode: user.leetcode_id,
                codeforces: user.codeforces_id,
                codechef: user.codechef_id,
                hackerrank: user.hackerrank_id,
                atcoder: user.atcoder_id,
                github: user.github_id
            },
            activityHeatmap,
            recentActivity: activity.slice(-5).reverse(), // Last 5 solved
            courseProgress
        };
    }
}
