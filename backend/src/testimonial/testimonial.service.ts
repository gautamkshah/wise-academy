import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Testimonial } from '@prisma/client';

@Injectable()
export class TestimonialService {
    constructor(private prisma: PrismaService) { }

    async create(data: { user_id: string; message: string; rating: number }): Promise<Testimonial> {
        return this.prisma.testimonial.create({
            data,
        });
    }

    async findAll(): Promise<Testimonial[]> {
        return this.prisma.testimonial.findMany({
            include: {
                user: {
                    select: { name: true, photo: true },
                },
            },
        });
    }
}
