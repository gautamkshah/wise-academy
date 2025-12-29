import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Chapter } from '@prisma/client';

@Injectable()
export class ChapterService {
    constructor(private prisma: PrismaService) { }

    async create(data: { title: string; order_no: number; course_id: string }): Promise<Chapter> {
        return this.prisma.chapter.create({
            data,
        });
    }

    async findByCourse(courseId: string): Promise<Chapter[]> {
        return this.prisma.chapter.findMany({
            where: { course_id: courseId },
            orderBy: { order_no: 'asc' },
            include: {
                problems: true,
            },
        });
    }
}
