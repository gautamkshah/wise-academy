import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @UseGuards(AuthGuard)
    @Get()
    async getDashboard(@Req() req) {
        console.log('DashboardController hit. User:', req.user);
        try {
            const userId = req.user.uid;
            return await this.dashboardService.getDashboardData(userId);
        } catch (e) {
            console.error('DashboardController Error:', e);
            throw e;
        }
    }
}
