import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot()],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule { }
