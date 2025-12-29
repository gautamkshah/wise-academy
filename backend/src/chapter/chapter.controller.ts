import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ChapterService } from './chapter.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('chapters')
export class ChapterController {
    constructor(private readonly chapterService: ChapterService) { }

    @Post()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    create(@Body() createChapterDto: { title: string; order_no: number; course_id: string }) {
        return this.chapterService.create(createChapterDto);
    }

    @Get('course/:courseId')
    findByCourse(@Param('courseId') courseId: string) {
        return this.chapterService.findByCourse(courseId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.chapterService.findOne(id);
    }

    @Put(':id')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    update(@Param('id') id: string, @Body() updateChapterDto: { title?: string; order_no?: number; course_id?: string }) {
        return this.chapterService.update(id, updateChapterDto);
    }

    @Delete(':id')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    remove(@Param('id') id: string) {
        return this.chapterService.remove(id);
    }
}
