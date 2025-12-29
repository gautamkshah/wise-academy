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

    async markProblemSolved(userId: string, problemId: string): Promise<UserProblem> {
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
                status: 'SOLVED',
                solved_at: new Date(),
            },
            create: {
                user_id: internalId,
                problem_id: problemId,
                status: 'SOLVED',
                solved_at: new Date(),
            },
        });

        // Trigger stats sync to update leaderboard
        await this.statsService.syncUserStats(internalId);

        return progress;
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
