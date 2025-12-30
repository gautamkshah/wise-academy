import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CourseModule } from './course/course.module';
import { ChapterModule } from './chapter/chapter.module';
import { ProblemModule } from './problem/problem.module';
import { ProgressModule } from './progress/progress.module';
import { StatsModule } from './stats/stats.module';
import { TestimonialModule } from './testimonial/testimonial.module';
import { ContactModule } from './contact/contact.module';

import { ConfigModule } from '@nestjs/config';

import { ContestModule } from './contest/contest.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule, AuthModule, UserModule, CourseModule, ChapterModule, ProblemModule, ProgressModule, StatsModule, TestimonialModule, ContactModule, ContestModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
