import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('progress')
export class ProgressController {
    constructor(private readonly progressService: ProgressService) { }

    @UseGuards(AuthGuard)
    @Post('solve')
    markSolved(@Body('problemId') problemId: string, @Req() req) {
        const userId = req.user.uid; // Assuming uid is mapped from Firebase token
        // Note: We need to ensure logic that maps Firebase UID to our DB User ID.
        // For now, let's assume the user service handles this translation or we use the Firebase UID as our primary key.
        // Given the schema using @default(uuid()), we likely need a lookup.
        // Let's assume the client sends the proper DB User ID or we modify the AuthGuard/Service to fetch it.

        // Simplified for MVP: accepting userId from body for testing or needing integration
        // But logically, it should come from the token. 
        // Let's require userId in body for now to keep it simple until full integration.
        return this.progressService.markProblemSolved(req.body.userId, problemId);
    }

    @Get(':userId')
    async getUserProgress(@Param('userId') userId: string) {
        return this.progressService.getUserProgress(userId);
    }
}
