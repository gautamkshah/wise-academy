import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';

import { StatsController } from './stats.controller';

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot()],
  providers: [StatsService],
  controllers: [StatsController],
  exports: [StatsService],
})
export class StatsModule { }
