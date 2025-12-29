import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ProblemService } from './problem.service';

@Controller('problems')
export class ProblemController {
    constructor(private readonly problemService: ProblemService) { }

    @Post()
    create(
        @Body()
        createProblemDto: {
            title: string;
            platform: string;
            leetcode_link?: string;
            difficulty: string;
            tags: string[];
            chapter_id: string;
        },
    ) {
        return this.problemService.create(createProblemDto);
    }

    @Get('chapter/:chapterId')
    findByChapter(@Param('chapterId') chapterId: string) {
        return this.problemService.findByChapter(chapterId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.problemService.findOne(id);
    }
}
