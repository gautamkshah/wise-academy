import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Course } from '@prisma/client';

@Injectable()
export class CourseService {
    constructor(private prisma: PrismaService) { }

    async create(data: { title: string; description?: string; level: string }): Promise<Course> {
        return this.prisma.course.create({
            data,
        });
    }

    async findAll(): Promise<Course[]> {
        return this.prisma.course.findMany({
            include: {
                chapters: true, // Include chapters in the course list
            },
        });
    }

    async findOne(id: string): Promise<Course | null> {
        return this.prisma.course.findUnique({
            where: { id },
            include: {
                chapters: {
                    orderBy: {
                        order_no: 'asc',
                    },
                },
            },
        });
    }

    async update(id: string, data: { title?: string; description?: string; level?: string }): Promise<Course> {
        return this.prisma.course.update({
            where: { id },
            data,
        });
    }

    async remove(id: string): Promise<Course> {
        return this.prisma.course.delete({
            where: { id },
        });
    }
}
