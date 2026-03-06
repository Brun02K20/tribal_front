import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { Role1Guard } from 'src/auth/utils/role1.guard';
import { MetricasController } from './metricas.controller';
import { MetricasService } from './metricas.service';

@Module({
  imports: [AuthModule],
  controllers: [MetricasController],
  providers: [MetricasService, Role1Guard],
})
export class MetricasModule {}
