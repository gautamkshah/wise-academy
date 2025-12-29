import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

import { UserController } from './user.controller';
import { StatsModule } from '../stats/stats.module';

@Module({
  imports: [PrismaModule, forwardRef(() => AuthModule), StatsModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule { }
