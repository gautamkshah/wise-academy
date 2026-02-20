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
                course: true,
            },
        });
    }

    async findOne(id: string): Promise<Chapter | null> {
        return this.prisma.chapter.findUnique({
            where: { id },
            include: {
                problems: true,
                course: true,
            },
        });
    }

    async update(id: string, data: { title?: string; order_no?: number; course_id?: string }): Promise<Chapter> {
        return this.prisma.chapter.update({
            where: { id },
            data,
        });
    }

    async remove(id: string): Promise<Chapter> {
        return this.prisma.chapter.delete({
            where: { id },
        });
    }
}
