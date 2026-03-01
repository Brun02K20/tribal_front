import { Module } from '@nestjs/common';
import { AiService } from 'src/ai/ai.service';
import { AuthModule } from 'src/auth/auth.module';
import { Role1Guard } from 'src/auth/utils/role1.guard';
import { AiController } from './ai.controller';

@Module({
  imports: [AuthModule],
  controllers: [AiController],
  providers: [AiService, Role1Guard],
})
export class AiModule {}
