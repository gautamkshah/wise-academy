import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
    constructor(private prisma: PrismaService) { }

    async getCourseAnalytics(courseId: string, college?: string, branch?: string, year?: number) {
        // 1. Fetch Course Structure (Chapters & Problems)
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
            include: {
                chapters: {
                    include: {
                        problems: {
                            select: { id: true }
                        }
                    },
                    orderBy: { order_no: 'asc' }
                }
            }
        });

        if (!course) {
            throw new Error('Course not found');
        }

        // 2. Build User Filter
        const where: any = {};
        if (college) where.college = { contains: college, mode: 'insensitive' };
        if (branch) where.branch = { contains: branch, mode: 'insensitive' };
        if (year) where.year = year;

        // 3. Fetch Users with Progress
        // We fetch all users who maximize the filter. 
        // Note: In a huge specific LMS, we might filter by "Enrolled", but here it seems open.
        const users = await this.prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                college: true,
                branch: true,
                year: true,
                roll_no: true,
                phone: true,
                progress: {
                    where: {
                        problem: {
                            chapter: { course_id: courseId }
                        },
                        status: 'SOLVED'
                    },
                    select: {
                        problem_id: true,
                        problem: {
                            select: { chapter_id: true }
                        }
                    }
                }
            },
            orderBy: { name: 'asc' }
        });

        // 4. Aggregate Data
        // Map simplified structure for frontend
        const totalProblems = course.chapters.reduce((acc, ch) => acc + ch.problems.length, 0);

        return users.map(user => {
            const solvedProblemIds = new Set(user.progress.map(p => p.problem_id));

            // Chapter-wise breakdown
            const chapterProgress = course.chapters.map(ch => {
                const totalInChapter = ch.problems.length;
                const solvedInChapter = ch.problems.filter(p => solvedProblemIds.has(p.id)).length;
                return {
                    chapterId: ch.id,
                    chapterTitle: ch.title,
                    total: totalInChapter,
                    solved: solvedInChapter,
                    percentage: totalInChapter > 0 ? (solvedInChapter / totalInChapter) * 100 : 0
                };
            });

            const totalSolved = user.progress.length;

            return {
                userId: user.id,
                name: user.name,
                email: user.email,
                college: user.college,
                branch: user.branch,
                year: user.year,
                roll_no: user.roll_no,
                totalSolved,
                totalProblems,
                progressPercentage: totalProblems > 0 ? (totalSolved / totalProblems) * 100 : 0,
                chapterStats: chapterProgress
            };
        });
    }
}
