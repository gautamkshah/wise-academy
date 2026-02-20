import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @UseGuards(AuthGuard)
    @Get('course/:id')
    async getCourseAnalytics(
        @Param('id') courseId: string,
        @Query('college') college?: string,
        @Query('branch') branch?: string,
        @Query('year') year?: string
    ) {
        const parsedYear = year ? parseInt(year) : undefined;
        return this.analyticsService.getCourseAnalytics(courseId, college, branch, parsedYear);
    }
}
