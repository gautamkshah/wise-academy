import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Contact } from '@prisma/client';

@Injectable()
export class ContactService {
    constructor(private prisma: PrismaService) { }

    async create(data: { name: string; email: string; message: string }): Promise<Contact> {
        return this.prisma.contact.create({
            data,
        });
    }
}
