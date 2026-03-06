import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { Role2Guard } from 'src/auth/utils/role2.guard';
import { ResenasController } from './resenas.controller';
import { ResenasService } from './resenas.service';

@Module({
  imports: [AuthModule],
  controllers: [ResenasController],
  providers: [ResenasService, Role2Guard],
})
export class ResenasModule {}
