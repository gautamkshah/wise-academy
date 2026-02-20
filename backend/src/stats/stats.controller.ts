import { Controller, Post } from '@nestjs/common';
import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {
    constructor(private readonly statsService: StatsService) { }

    @Post('sync-all')
    async syncAll() {
        await this.statsService.handleCron();
        return { message: 'Sync started' };
    }
}
