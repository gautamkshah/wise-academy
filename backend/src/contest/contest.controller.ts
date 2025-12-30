import { Controller, Get } from '@nestjs/common';
import { ContestService } from './contest.service';

@Controller('contests')
export class ContestController {
    constructor(private readonly contestService: ContestService) { }

    @Get()
    async getContests() {
        return this.contestService.getAllContests();
    }
}
