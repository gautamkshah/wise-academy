import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ProblemService } from './problem.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('problems')
export class ProblemController {
    constructor(private readonly problemService: ProblemService) { }

    @Post()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
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

    @Put(':id')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    update(
        @Param('id') id: string,
        @Body()
        updateProblemDto: {
            title?: string;
            platform?: string;
            leetcode_link?: string;
            difficulty?: string;
            tags?: string[];
            chapter_id?: string;
        },
    ) {
        return this.problemService.update(id, updateProblemDto);
    }

    @Delete(':id')
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    remove(@Param('id') id: string) {
        return this.problemService.remove(id);
    }
}
