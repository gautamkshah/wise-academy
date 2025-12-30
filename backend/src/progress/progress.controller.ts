import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('progress')
export class ProgressController {
    constructor(private readonly progressService: ProgressService) { }

    @UseGuards(AuthGuard)
    @Post('solve')
    async updateStatus(@Body() body: { problemId: string, userId: string, status: 'PENDING' | 'SOLVED' }) {
        return this.progressService.updateProblemStatus(body.userId, body.problemId, body.status);
    }

    @UseGuards(AuthGuard)
    @Post('sync')
    async syncExternal(@Body('userId') userId: string) {
        return this.progressService.syncWithExternalPlatforms(userId);
    }

    @Get(':userId')
    async getUserProgress(@Param('userId') userId: string) {
        return this.progressService.getUserProgress(userId);
    }
}
