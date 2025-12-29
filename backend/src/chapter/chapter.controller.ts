import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ChapterService } from './chapter.service';

@Controller('chapters')
export class ChapterController {
    constructor(private readonly chapterService: ChapterService) { }

    @Post()
    create(@Body() createChapterDto: { title: string; order_no: number; course_id: string }) {
        return this.chapterService.create(createChapterDto);
    }

    @Get('course/:courseId')
    findByCourse(@Param('courseId') courseId: string) {
        return this.chapterService.findByCourse(courseId);
    }
}
