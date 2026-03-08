import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { Role1Guard } from 'src/auth/utils/role1.guard';
import { DescuentosController } from './descuentos.controller';
import { DescuentosService } from './descuentos.service';

@Module({
  imports: [AuthModule],
  controllers: [DescuentosController],
  providers: [DescuentosService, Role1Guard],
  exports: [DescuentosService],
})
export class DescuentosModule {}
