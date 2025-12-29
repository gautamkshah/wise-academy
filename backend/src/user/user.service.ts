import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }

    async findOrCreateUser(uid: string, email: string, name: string, photo?: string): Promise<User> {
        return this.prisma.user.upsert({
            where: { email },
            update: {
                firebase_uid: uid,
                name,
                photo,
            },
            create: {
                firebase_uid: uid,
                email,
                name,
                photo,
            },
        });
    }

    async findByUid(uid: string) {
        return this.prisma.user.findFirst({
            where: {
                OR: [
                    { firebase_uid: uid },
                    { id: uid }, // Fallback for anyone using the database ID
                ]
            },
            include: { stats: true },
        });
    }

    async findUserById(id: string) {
        return this.prisma.user.findUnique({
            where: { id },
            include: { stats: true },
        });
    }

    async getRankings(limit = 10) {
        return this.prisma.user.findMany({
            include: {
                stats: true,
            },
            orderBy: {
                stats: {
                    total_solved: 'desc'
                }
            },
            take: limit,
        });
    }
    async updateHandles(id: string, handles: { leetcode_id?: string; codeforces_id?: string; codechef_id?: string }) {
        const user = await this.prisma.user.findFirst({
            where: { OR: [{ firebase_uid: id }, { id: id }] }
        });

        if (!user) {
            throw new Error(`User not found with ID/UID: ${id}`);
        }

        return this.prisma.user.update({
            where: { id: user.id },
            data: {
                leetcode_id: handles.leetcode_id,
                codeforces_id: handles.codeforces_id,
                codechef_id: handles.codechef_id,
            },
        });
    }
}
