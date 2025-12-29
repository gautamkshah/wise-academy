import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Problem } from '@prisma/client';

@Injectable()
export class ProblemService {
    constructor(private prisma: PrismaService) { }

    async create(data: {
        title: string;
        platform: string;
        leetcode_link?: string;
        difficulty: string;
        tags: string[];
        chapter_id: string;
    }): Promise<Problem> {
        return this.prisma.problem.create({
            data,
        });
    }

    async findByChapter(chapterId: string): Promise<Problem[]> {
        return this.prisma.problem.findMany({
            where: { chapter_id: chapterId },
        });
    }

    async findOne(id: string): Promise<Problem | null> {
        return this.prisma.problem.findUnique({
            where: { id },
        });
    }
}
