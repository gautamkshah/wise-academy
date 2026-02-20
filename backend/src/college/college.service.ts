import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CollegeService {
    constructor(private prisma: PrismaService) { }

    async findAll(query: string = '') {
        return this.prisma.college.findMany({
            where: {
                name: { contains: query, mode: 'insensitive' }
            },
            orderBy: { name: 'asc' },
            take: 50
        });
    }

    async create(name: string) {
        const existing = await this.prisma.college.findUnique({
            where: { name }
        });

        if (existing) {
            throw new ConflictException('College already exists');
        }

        return this.prisma.college.create({
            data: {
                name,
                slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
            }
        });
    }

    async delete(id: string) {
        return this.prisma.college.delete({
            where: { id }
        });
    }
}
