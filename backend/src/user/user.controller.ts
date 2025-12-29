import { Controller, Get, Query, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '../auth/auth.guard';
import { StatsService } from '../stats/stats.service';

@Controller('users')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly statsService: StatsService,
    ) { }

    @Get('rankings')
    async getRankings(@Query('limit') limit?: string) {
        const parsedLimit = limit ? parseInt(limit, 10) : 10;
        const rankings = await this.userService.getRankings(parsedLimit);

        // Format response to be cleaner for frontend
        return rankings.map(user => ({
            id: user.id,
            name: user.name,
            photo: user.photo,
            solvedCount: user.stats?.total_solved || 0,
        }));
    }
    @Get(':id')
    async getUser(@Param('id') id: string) {
        return this.userService.findByUid(id);
    }

    @UseGuards(AuthGuard)
    @Post('handles')
    async updateHandles(@Body() handles: { leetcode_id?: string; codeforces_id?: string; codechef_id?: string }, @Req() req) {
        const userId = req.user.uid;
        const result = await this.userService.updateHandles(userId, handles);

        // Trigger immediate stats sync
        await this.statsService.syncUserStats(result.id);

        return result;
    }
}
